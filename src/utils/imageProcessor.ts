/**
 * Processes and optimizes any image uploaded by the user.
 * Converts AVIF, HEIC, JFIF, PNG, WebP or camera photos into universally
 * supported, high-performance JPEG data URLs suitable for web display across
 * all mobile devices and desktop browsers.
 */
export const processImageFile = (file: File): Promise<string> => {
  return new Promise((resolve, reject) => {
    if (file.type === 'image/svg+xml') {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = reject;
      reader.readAsDataURL(file);
      return;
    }

    const reader = new FileReader();
    reader.onload = (e) => {
      const rawDataUrl = e.target?.result as string;
      if (!rawDataUrl) {
        reject(new Error('Falha ao ler arquivo de imagem'));
        return;
      }

      const img = new Image();
      img.crossOrigin = 'anonymous';

      img.onload = () => {
        try {
          const MAX_DIM = 1200;
          let width = img.width || 800;
          let height = img.height || 800;

          if (width > MAX_DIM || height > MAX_DIM) {
            if (width > height) {
              height = Math.round((height * MAX_DIM) / width);
              width = MAX_DIM;
            } else {
              width = Math.round((width * MAX_DIM) / height);
              height = MAX_DIM;
            }
          }

          const canvas = document.createElement('canvas');
          canvas.width = width;
          canvas.height = height;
          const ctx = canvas.getContext('2d');

          if (!ctx) {
            resolve(rawDataUrl);
            return;
          }

          // Draw white background then image
          ctx.fillStyle = '#FFFFFF';
          ctx.fillRect(0, 0, width, height);
          ctx.drawImage(img, 0, 0, width, height);

          // Standard universal JPEG format (works on 100% of browsers)
          const optimizedDataUrl = canvas.toDataURL('image/jpeg', 0.88);
          resolve(optimizedDataUrl);
        } catch {
          // Fallback to original data URL if canvas tainted
          resolve(rawDataUrl);
        }
      };

      img.onerror = () => {
        // Fallback to original data URL if decode fails
        resolve(rawDataUrl);
      };

      img.src = rawDataUrl;
    };

    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
};
