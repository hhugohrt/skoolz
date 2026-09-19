// Les photos de téléphone pèsent souvent 4 à 10 Mo : on les réduit avant l'envoi (limite de taille des requêtes
// serveur, et envoi plus rapide en 4G). 2000 px de côté restent largement lisibles pour un cours.
const MAX_SIDE = 2000;

export async function compressImage(file: File): Promise<File> {
  if (!file.type.startsWith("image/")) return file;
  try {
    const bitmap = await createImageBitmap(file);
    const ratio = Math.min(1, MAX_SIDE / Math.max(bitmap.width, bitmap.height));
    const canvas = document.createElement("canvas");
    canvas.width = Math.round(bitmap.width * ratio);
    canvas.height = Math.round(bitmap.height * ratio);
    const context = canvas.getContext("2d");
    if (!context) return file;
    context.drawImage(bitmap, 0, 0, canvas.width, canvas.height);
    bitmap.close?.();
    const blob = await new Promise<Blob | null>((resolve) => canvas.toBlob(resolve, "image/jpeg", 0.85));
    if (!blob || blob.size >= file.size) return file;
    return new File([blob], file.name.replace(/\.[^/.]+$/, "") + ".jpg", { type: "image/jpeg" });
  } catch {
    // Format que le navigateur ne sait pas décoder (ex. HEIC hors Safari) : on envoie l'original.
    return file;
  }
}
