import { put, del } from "@vercel/blob";

export async function uploadImage(buffer: Buffer, filename: string): Promise<{ url: string }> {
  const blob = await put(filename, buffer, {
    access: "public",
    addRandomSuffix: true,
  });
  return { url: blob.url };
}

export async function deleteImage(url: string): Promise<void> {
  await del(url);
}
