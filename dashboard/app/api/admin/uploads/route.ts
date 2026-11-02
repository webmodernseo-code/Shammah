import { createHash } from "node:crypto";
import { NextRequest, NextResponse } from "next/server";
import { isAdmin } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { decryptSecret } from "@/lib/encryption";

export const dynamic = "force-dynamic";

const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5 MB max

/**
 * Validates binary signature (magic bytes) to prevent extension/MIME spoofing & SVG XSS
 */
function validateImageMagicBytes(buffer: Buffer): { valid: boolean; detectedMime: string } {
  if (buffer.length < 12) return { valid: false, detectedMime: "" };

  // JPEG: FF D8 FF
  if (buffer[0] === 0xff && buffer[1] === 0xd8 && buffer[2] === 0xff) {
    return { valid: true, detectedMime: "image/jpeg" };
  }
  // PNG: 89 50 4E 47
  if (buffer[0] === 0x89 && buffer[1] === 0x50 && buffer[2] === 0x4e && buffer[3] === 0x47) {
    return { valid: true, detectedMime: "image/png" };
  }
  // WEBP: RIFF (bytes 0-3) + WEBP (bytes 8-11)
  if (
    buffer[0] === 0x52 && buffer[1] === 0x49 && buffer[2] === 0x46 && buffer[3] === 0x46 &&
    buffer[8] === 0x57 && buffer[9] === 0x45 && buffer[10] === 0x42 && buffer[11] === 0x50
  ) {
    return { valid: true, detectedMime: "image/webp" };
  }
  // GIF: 47 49 46 38
  if (buffer[0] === 0x47 && buffer[1] === 0x49 && buffer[2] === 0x46 && buffer[3] === 0x38) {
    return { valid: true, detectedMime: "image/gif" };
  }

  return { valid: false, detectedMime: "" };
}

export async function POST(req: NextRequest) {
  if (!(await isAdmin(req))) {
    return NextResponse.json({ error: "Non autorisé." }, { status: 401 });
  }

  try {
    const input = await req.formData();
    const file = input.get("file");

    if (!(file instanceof File)) {
      return NextResponse.json(
        { error: "Fichier manquant ou invalide." },
        { status: 400 }
      );
    }

    if (file.size > MAX_FILE_SIZE) {
      return NextResponse.json(
        { error: "Le fichier dépasse la taille maximale autorisée de 5 Mo." },
        { status: 400 }
      );
    }

    // Explicitly reject SVG due to script execution / Stored XSS vectors
    if (file.type.includes("svg") || file.name.toLowerCase().endsWith(".svg")) {
      return NextResponse.json(
        { error: "Les fichiers SVG ne sont pas autorisés pour des raisons de sécurité. Utilisez JPEG, PNG ou WEBP." },
        { status: 400 }
      );
    }

    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    // Validate true binary headers (magic numbers)
    const { valid, detectedMime } = validateImageMagicBytes(buffer);
    if (!valid) {
      return NextResponse.json(
        { error: "Format de fichier non reconnu ou non autorisé. Seuls les formats JPEG, PNG, WEBP et GIF authentiques sont acceptés." },
        { status: 400 }
      );
    }

    // 1. Check Cloudinary config from Database
    let cloudName = "";
    let apiKey = "";
    let apiSecret = "";
    let uploadFolder = "shammah/products";
    let isEnabled = true;

    try {
      const dbConfig = await prisma.mediaStorageConfig.findUnique({
        where: { provider: "cloudinary" },
      });
      if (dbConfig && dbConfig.isEnabled && dbConfig.cloudName && dbConfig.apiKey && dbConfig.apiSecret) {
        cloudName = dbConfig.cloudName;
        apiKey = decryptSecret(dbConfig.apiKey);
        apiSecret = decryptSecret(dbConfig.apiSecret);
        uploadFolder = dbConfig.uploadFolder || uploadFolder;
        isEnabled = true;
      }
    } catch {
      // Prisma DB query fallback
    }

    // 2. Fallback to Environment Variables if DB not configured
    if (!cloudName || !apiKey || !apiSecret) {
      cloudName = process.env.CLOUDINARY_CLOUD_NAME || process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME || "";
      apiKey = process.env.CLOUDINARY_API_KEY || "";
      apiSecret = process.env.CLOUDINARY_API_SECRET || "";
      uploadFolder = process.env.CLOUDINARY_UPLOAD_FOLDER || uploadFolder;
    }

    // 3. If Cloudinary credentials are valid, upload to Cloudinary API
    if (cloudName && apiKey && apiSecret && isEnabled) {
      const timestamp = Math.floor(Date.now() / 1000);
      const params = `folder=${uploadFolder}&timestamp=${timestamp}`;
      const signature = createHash("sha1")
        .update(`${params}${apiSecret}`)
        .digest("hex");

      const form = new FormData();
      const blob = new Blob([buffer], { type: detectedMime });
      form.set("file", blob, file.name);
      form.set("folder", uploadFolder);
      form.set("timestamp", String(timestamp));
      form.set("api_key", apiKey);
      form.set("signature", signature);

      const response = await fetch(
        `https://api.cloudinary.com/v1_1/${cloudName}/image/upload`,
        { method: "POST", body: form }
      );

      const data = await response.json();

      if (!response.ok) {
        return NextResponse.json(
          { error: data.error?.message || "Échec du téléversement Cloudinary." },
          { status: 502 }
        );
      }

      return NextResponse.json({
        success: true,
        source: "cloudinary",
        data: {
          url: data.secure_url,
          publicId: data.public_id,
          width: data.width,
          height: data.height,
          format: data.format,
        },
      });
    }

    // 4. Safe fallback preview if Cloudinary is not configured yet
    const base64 = `data:${detectedMime};base64,${buffer.toString("base64")}`;

    return NextResponse.json({
      success: true,
      source: "local_preview",
      warning: "Cloudinary n'est pas configuré. L'image est stockée en aperçu temporaire. Configurez vos clés dans Réglages > Médias.",
      data: {
        url: base64,
        publicId: `preview_${Date.now()}`,
      },
    });
  } catch (err: any) {
    return NextResponse.json(
      { error: err?.message || "Erreur interne lors du traitement de l'image." },
      { status: 500 }
    );
  }
}
