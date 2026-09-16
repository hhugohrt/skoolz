// Les photos de téléphone (3-8+ Mo) dépassent la limite de 4,5 Mo des fonctions
// serverless Vercel — on les redimensionne/recompresse côté client avant l'envoi.
// En cas d'échec ou de blocage (format non décodable par le navigateur, ex: certains
// HEIC), on retombe sur le fichier original tel quel plutôt que de bloquer l'envoi.
export async function compressImage(file: File, maxDimension = 1600, quality = 0.8): Promise<File> {
  try {
    return await Promise.race([
      compress(file, maxDimension, quality),
      new Promise<File>((_, reject) => setTimeout(() => reject(new Error("timeout")), 5000)),
    ]);
  } catch {
    return file;
  }
}

async function compress(file: File, maxDimension: number, quality: number): Promise<File> {
  const bitmap = await createImageBitmap(file);
  const scale = Math.min(1, maxDimension / Math.max(bitmap.width, bitmap.height));
  const width = Math.round(bitmap.width * scale);
  const height = Math.round(bitmap.height * scale);

  const canvas = document.createElement("canvas");
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext("2d");
  if (!ctx) return file;
  ctx.drawImage(bitmap, 0, 0, width, height);
  bitmap.close();

  const blob = await new Promise<Blob | null>((resolve) => canvas.toBlob(resolve, "image/jpeg", quality));
  if (!blob) return file;

  return new File([blob], file.name.replace(/\.\w+$/, ".jpg"), { type: "image/jpeg" });
}
