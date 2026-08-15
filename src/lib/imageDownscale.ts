/**
 * Shrinks oversized photos and fliers in the browser before they are
 * uploaded.
 *
 * Event fliers come out of design tools at print resolution — the one that
 * prompted this was over 10MB — and every member who opens the event page
 * then downloads it on their phone. Resizing here means the upload
 * succeeds, storage stays small, and the page loads fast, without adding a
 * native image library to the server.
 *
 * Deliberately conservative: anything it cannot handle (SVG, PDF, animated
 * GIF, a decode failure) passes through untouched rather than failing the
 * upload.
 */

/** Below this, resizing costs quality and saves nothing worth having. */
const SKIP_BELOW_BYTES = 1.5 * 1024 * 1024;

/** Plenty for a full-width flier on a retina screen. */
const MAX_DIMENSION = 2400;

const JPEG_QUALITY = 0.85;

const RESIZABLE = new Set(['image/png', 'image/jpeg', 'image/jpg', 'image/webp']);

export async function downscaleImage(file: File): Promise<File> {
  if (!RESIZABLE.has(file.type) || file.size <= SKIP_BELOW_BYTES) return file;

  try {
    const bitmap = await createImageBitmap(file);
    const scale = Math.min(1, MAX_DIMENSION / Math.max(bitmap.width, bitmap.height));

    // Already small enough in pixels — a big file at modest dimensions is
    // usually a PNG screenshot, and re-encoding it as JPEG still helps.
    const width = Math.round(bitmap.width * scale);
    const height = Math.round(bitmap.height * scale);

    const canvas = document.createElement('canvas');
    canvas.width = width;
    canvas.height = height;
    const ctx = canvas.getContext('2d');
    if (!ctx) return file;
    // White backdrop so transparent PNGs do not turn black once flattened.
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(0, 0, width, height);
    ctx.drawImage(bitmap, 0, 0, width, height);
    bitmap.close?.();

    const blob = await new Promise<Blob | null>((resolve) =>
      canvas.toBlob(resolve, 'image/jpeg', JPEG_QUALITY)
    );
    if (!blob || blob.size >= file.size) return file;

    const name = file.name.replace(/\.[^.]+$/, '') + '.jpg';
    return new File([blob], name, { type: 'image/jpeg', lastModified: Date.now() });
  } catch {
    return file;
  }
}
