import { NextRequest, NextResponse } from "next/server";
import { isSuperAdmin } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { encryptSecret, decryptSecret, maskSecret } from "@/lib/encryption";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  if (!(await isSuperAdmin(req))) return NextResponse.json({ error: "Accès refusé." }, { status: 403 });
  const config = await prisma.mediaStorageConfig.findUnique({ where: { provider: "cloudinary" } }).catch(() => null);

  const plainApiKey = decryptSecret(config?.apiKey);
  const plainApiSecret = decryptSecret(config?.apiSecret);

  return NextResponse.json({
    success: true,
    data: config
      ? {
          cloudName: config.cloudName,
          apiKey: maskSecret(plainApiKey),
          apiSecret: maskSecret(plainApiSecret),
          uploadFolder: config.uploadFolder,
          isEnabled: config.isEnabled,
          configured: Boolean(config.cloudName && plainApiKey && plainApiSecret),
        }
      : {
          cloudName: "",
          apiKey: "",
          apiSecret: "",
          uploadFolder: "divinexpress/products",
          isEnabled: false,
          configured: false,
        },
  });
}

export async function POST(req: NextRequest) {
  if (!(await isSuperAdmin(req))) return NextResponse.json({ error: "Accès refusé." }, { status: 403 });
  const body = await req.json();
  const existing = await prisma.mediaStorageConfig.findUnique({ where: { provider: "cloudinary" } }).catch(() => null);

  const plainApiKey = body.apiKey && !body.apiKey.includes("••••")
    ? body.apiKey.trim()
    : decryptSecret(existing?.apiKey);

  const plainApiSecret = body.apiSecret && !body.apiSecret.includes("••••")
    ? body.apiSecret.trim()
    : decryptSecret(existing?.apiSecret);

  if (!body.cloudName?.trim() || !plainApiKey || !plainApiSecret) {
    return NextResponse.json({ error: "Cloud name, API key et API secret sont requis." }, { status: 400 });
  }

  const encryptedApiKey = encryptSecret(plainApiKey) || "";
  const encryptedApiSecret = encryptSecret(plainApiSecret) || "";

  await prisma.mediaStorageConfig.upsert({
    where: { provider: "cloudinary" },
    update: {
      cloudName: body.cloudName.trim(),
      apiKey: encryptedApiKey,
      apiSecret: encryptedApiSecret,
      uploadFolder: body.uploadFolder?.trim() || "divinexpress/products",
      isEnabled: Boolean(body.isEnabled),
    },
    create: {
      provider: "cloudinary",
      cloudName: body.cloudName.trim(),
      apiKey: encryptedApiKey,
      apiSecret: encryptedApiSecret,
      uploadFolder: body.uploadFolder?.trim() || "divinexpress/products",
      isEnabled: Boolean(body.isEnabled),
    },
  });

  if (body.action === "test") {
    const authorization = Buffer.from(`${plainApiKey}:${plainApiSecret}`).toString("base64");
    const response = await fetch(`https://api.cloudinary.com/v1_1/${body.cloudName.trim()}/resources/image?max_results=1`, {
      headers: { Authorization: `Basic ${authorization}` },
    }).catch(() => null);
    if (!response || !response.ok) {
      return NextResponse.json({ success: false, error: "Identifiants Cloudinary invalides." }, { status: 400 });
    }
  }

  return NextResponse.json({ success: true, message: "Configuration Cloudinary enregistrée avec succès." });
}
