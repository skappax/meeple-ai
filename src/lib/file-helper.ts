/**
 * Helper per caricamento e compressione client-side di immagini e documenti PDF.
 */

import { Attachment } from '@/types/chat';

export async function processSelectedFile(file: File): Promise<Attachment> {
  const isImage = file.type.startsWith('image/');
  const isPdf = file.type === 'application/pdf' || file.name.toLowerCase().endsWith('.pdf');

  if (!isImage && !isPdf) {
    throw new Error('Formato non supportato. Seleziona un\'immagine (JPEG, PNG, WEBP) o un documento PDF.');
  }

  // Se è un'immagine, comprimila con Canvas a max 1280px per ridurre latenza mobile
  if (isImage) {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = (e) => {
        const img = new Image();
        img.onload = () => {
          const maxDim = 1280;
          let { width, height } = img;

          if (width > maxDim || height > maxDim) {
            if (width > height) {
              height = Math.round((height * maxDim) / width);
              width = maxDim;
            } else {
              width = Math.round((width * maxDim) / height);
              height = maxDim;
            }
          }

          const canvas = document.createElement('canvas');
          canvas.width = width;
          canvas.height = height;
          const ctx = canvas.getContext('2d');
          if (!ctx) {
            return reject(new Error('Impossibile elaborare l\'immagine.'));
          }

          ctx.drawImage(img, 0, 0, width, height);
          const compressedDataUrl = canvas.toDataURL('image/jpeg', 0.82);

          resolve({
            type: 'image',
            mimeType: 'image/jpeg',
            name: file.name,
            data: compressedDataUrl,
            size: Math.round(compressedDataUrl.length * 0.75),
          });
        };
        img.onerror = () => reject(new Error('Errore nel caricamento dell\'immagine'));
        img.src = e.target?.result as string;
      };
      reader.onerror = () => reject(new Error('Errore nella lettura del file'));
      reader.readAsDataURL(file);
    });
  }

  // Se è un PDF, controlla la dimensione (max 15MB)
  if (file.size > 15 * 1024 * 1024) {
    throw new Error('Il file PDF supera il limite massimo di 15 MB.');
  }

  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      const base64Data = e.target?.result as string;
      resolve({
        type: 'file',
        mimeType: 'application/pdf',
        name: file.name,
        data: base64Data,
        size: file.size,
      });
    };
    reader.onerror = () => reject(new Error('Errore nella lettura del file PDF'));
    reader.readAsDataURL(file);
  });
}
