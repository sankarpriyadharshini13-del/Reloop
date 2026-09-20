// Phone photos are often 5-12 MB, but Vercel functions accept ~4.5 MB request bodies and the
// model only looks at 224px anyway. Shrink on the device before uploading.

const MAX_UPLOAD_BYTES = 4 * 1024 * 1024;

async function loadBitmap(file) {
  if (typeof createImageBitmap === 'function') {
    try {
      return await createImageBitmap(file, { imageOrientation: 'from-image' });
    } catch {
      try {
        return await createImageBitmap(file);
      } catch {
        // fall through to <img>
      }
    }
  }
  return new Promise((resolve, reject) => {
    const url = URL.createObjectURL(file);
    const img = new Image();
    img.onload = () => {
      URL.revokeObjectURL(url);
      resolve(img);
    };
    img.onerror = (e) => {
      URL.revokeObjectURL(url);
      reject(e);
    };
    img.src = url;
  });
}

export async function compressImage(file, { maxDimension = 1024, quality = 0.85 } = {}) {
  try {
    const bitmap = await loadBitmap(file);
    const srcW = bitmap.naturalWidth || bitmap.width;
    const srcH = bitmap.naturalHeight || bitmap.height;
    const scale = Math.min(1, maxDimension / Math.max(srcW, srcH));
    const width = Math.max(1, Math.round(srcW * scale));
    const height = Math.max(1, Math.round(srcH * scale));

    const canvas = document.createElement('canvas');
    canvas.width = width;
    canvas.height = height;
    const ctx = canvas.getContext('2d');
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(0, 0, width, height);
    ctx.drawImage(bitmap, 0, 0, width, height);
    if (typeof bitmap.close === 'function') bitmap.close();

    const blob = await new Promise((resolve) => canvas.toBlob(resolve, 'image/jpeg', quality));
    if (blob) return blob;
  } catch {
    // fall through
  }

  if (file.size <= MAX_UPLOAD_BYTES) return file;
  throw new Error("We couldn't process that photo. Try a JPG or PNG under 4 MB.");
}
