
import { getSupabaseClient, isSupabaseConfigured } from './supabase';

export async function optimizeImageFile(
  file: File,
  maxWidth = 1200,
  maxHeight = 1200,
  quality = 0.85
): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();

    reader.onerror = () => reject(new Error('No se pudo leer la imagen.'));

    reader.onload = () => {
      const img = new Image();

      img.onerror = () => reject(new Error('No se pudo procesar la imagen.'));

      img.onload = () => {
        let width = img.width;
        let height = img.height;

        const scale = Math.min(1, maxWidth / width, maxHeight / height);
        width = Math.max(1, Math.round(width * scale));
        height = Math.max(1, Math.round(height * scale));

        const canvas = document.createElement('canvas');
        canvas.width = width;
        canvas.height = height;

        const ctx = canvas.getContext('2d');

        if (!ctx) {
          reject(new Error('No se pudo preparar la imagen.'));
          return;
        }

        ctx.fillStyle = '#FFFFFF';
        ctx.fillRect(0, 0, width, height);
        ctx.drawImage(img, 0, 0, width, height);

        let dataUrl = canvas.toDataURL('image/webp', quality);

        if (!dataUrl.startsWith('data:image/webp')) {
          dataUrl = canvas.toDataURL('image/jpeg', quality);
        }

        resolve(dataUrl);
      };

      img.src = reader.result as string;
    };

    reader.readAsDataURL(file);
  });
}

export async function uploadProductImage(
  file: File,
  folder = 'products'
): Promise<string> {
  if (!file || file.size === 0) {
    throw new Error('El archivo seleccionado está vacío.');
  }

  if (!file.type.startsWith('image/')) {
    throw new Error('El archivo seleccionado no es una imagen válida.');
  }

  if (isSupabaseConfigured()) {
    const supabase = getSupabaseClient();

    if (!supabase) {
      throw new Error('No se pudo conectar con Supabase. Revisá la configuración.');
    }

    const extensionByType: Record<string, string> = {
      'image/jpeg': 'jpg',
      'image/png': 'png',
      'image/webp': 'webp',
      'image/gif': 'gif',
      'image/avif': 'avif',
      'image/heic': 'heic',
      'image/heif': 'heif',
    };

    const extension =
      extensionByType[file.type.toLowerCase()] || 'jpg';

    const safeFolder = folder.replace(/[^a-zA-Z0-9_-]/g, '') || 'products';
    const filePath =
      `${safeFolder}/${crypto.randomUUID()}.${extension}`;

    const { data, error } = await supabase.storage
      .from('product-images')
      .upload(filePath, file, {
        cacheControl: '3600',
        upsert: false,
        contentType: file.type,
      });

    if (error) {
      console.error('Error subiendo imagen a Supabase:', error);
      throw new Error(`No se pudo subir la imagen: ${error.message}`);
    }

    if (!data?.path) {
      throw new Error('Supabase no confirmó la subida de la imagen.');
    }

    const { data: urlData } = supabase.storage
      .from('product-images')
      .getPublicUrl(data.path);

    if (!urlData?.publicUrl) {
      throw new Error('No se pudo obtener la dirección pública de la imagen.');
    }

    return urlData.publicUrl;
  }

  return optimizeImageFile(file);
}
