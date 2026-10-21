import { getSupabaseClient, isSupabaseConfigured } from './supabase';

/**
 * Optimizes and compresses an image file using an HTML5 Canvas to WebP or high-quality JPEG.
 * This guarantees ultra-fast loading, crisp visual fidelity, and prevents heavy files.
 */
export async function optimizeImageFile(
  file: File,
  maxWidth = 1200,
  maxHeight = 1200,
  quality = 0.85
): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();

    reader.onload = (readerEvent) => {
      const img = new Image();

      img.onload = () => {
        let width = img.width;
        let height = img.height;

        if (width > height) {
          if (width > maxWidth) {
            height = Math.round((height * maxWidth) / width);
            width = maxWidth;
          }
        } else {
          if (height > maxHeight) {
            width = Math.round((width * maxHeight) / height);
            height = maxHeight;
          }
        }

        const canvas = document.createElement('canvas');
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');

        if (!ctx) {
          resolve(readerEvent.target?.result as string);
          return;
        }

        // Clean white background for transparent PNGs converted to JPEG/WebP
        ctx.fillStyle = '#FFFFFF';
        ctx.fillRect(0, 0, width, height);
        ctx.drawImage(img, 0, 0, width, height);

        // Export as WebP if supported, fallback to JPEG
        let dataUrl = canvas.toDataURL('image/webp', quality);
        if (!dataUrl.startsWith('data:image/webp')) {
          dataUrl = canvas.toDataURL('image/jpeg', quality);
        }

        resolve(dataUrl);
      };

      img.onerror = (err) => reject(err);
      img.src = readerEvent.target?.result as string;
    };

    reader.onerror = (err) => reject(err);
    reader.readAsDataURL(file);
  });
}

/**
 * Uploads a product photo:
 * 1. If Supabase Storage is connected, uploads to the 'product-images' bucket and returns CDN public URL.
 * 2. If running locally or offline, compresses into an optimized WebP Data URL that is permanently stored in the website database.
 */
export async function uploadProductImage(file: File, folder = 'products'): Promise<string> {
  const supabase = getSupabaseClient();

  if (supabase && isSupabaseConfigured()) {
    try {
      const ext = file.name.split('.').pop() || 'webp';
      const cleanName = `${folder}/${Date.now()}-${Math.random().toString(36).substring(2, 7)}.${ext}`;

      const { data, error } = await supabase.storage
        .from('product-images')
        .upload(cleanName, file, {
          cacheControl: '3600',
          upsert: true,
        });

      if (!error && data) {
        const { data: urlData } = supabase.storage
          .from('product-images')
          .getPublicUrl(cleanName);

        if (urlData?.publicUrl) {
          return urlData.publicUrl;
        }
      } else {
        console.warn('Supabase storage upload returned error, falling back to optimized local storage:', error?.message);
      }
    } catch (err) {
      console.warn('Error in Supabase storage upload:', err);
    }
  }

  // Fallback: Local client-side optimized storage
  return await optimizeImageFile(file);
}
