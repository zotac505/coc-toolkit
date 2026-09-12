export interface ProcessedImage {
  dataUrl: string; // プレビュー用 (data:image/png;base64,...)
  base64: string;  // GitHub API送信用の純粋なBase64
}

export const processImageFile = (file: File, maxDimension = 800): Promise<ProcessedImage> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (event) => {
      const img = new Image();
      img.onload = () => {
        let width = img.width;
        let height = img.height;

        if (width > maxDimension || height > maxDimension) {
          if (width > height) {
            height = Math.round((height * maxDimension) / width);
            width = maxDimension;
          } else {
            width = Math.round((width * maxDimension) / height);
            height = maxDimension;
          }
        }

        const canvas = document.createElement('canvas');
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');
        if (!ctx) {
          reject(new Error('Canvas context not available'));
          return;
        }

        ctx.drawImage(img, 0, 0, width, height);

        // PNGまたはJPEG形式で出力（アルファチャンネル考慮でPNG優先）
        const dataUrl = canvas.toDataURL('image/png', 0.85);
        const base64 = dataUrl.replace(/^data:image\/[a-z]+;base64,/, '');

        resolve({ dataUrl, base64 });
      };
      img.onerror = () => reject(new Error('画像の読み込みに失敗しました'));
      img.src = event.target?.result as string;
    };
    reader.onerror = () => reject(new Error('ファイルの読み込みに失敗しました'));
    reader.readAsDataURL(file);
  });
};
