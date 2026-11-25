export type ResultCardInput = {
  headline: string;
  body: string;
  reasons: string[];
  previewUrl: string | null;
  confidenceLabel: string | null;
};

function wrap(ctx: CanvasRenderingContext2D, text: string, maxWidth: number): string[] {
  const words = text.split(/\s+/);
  const lines: string[] = [];
  let current = "";
  for (const word of words) {
    const next = current ? `${current} ${word}` : word;
    if (ctx.measureText(next).width <= maxWidth) current = next;
    else {
      if (current) lines.push(current);
      current = word;
    }
  }
  if (current) lines.push(current);
  return lines;
}

function loadImage(url: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const image = new Image();
    image.onload = () => resolve(image);
    image.onerror = () => reject(new Error("Could not load preview"));
    image.src = url;
  });
}

export async function downloadResultCard(input: ResultCardInput): Promise<void> {
  const width = 1080;
  const height = 1350;
  const canvas = document.createElement("canvas");
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext("2d");
  if (!ctx) throw new Error("Canvas is not available.");

  ctx.fillStyle = "#f7f1e3";
  ctx.fillRect(0, 0, width, height);
  ctx.fillStyle = "#1b2a6b";
  ctx.fillRect(0, 0, width, 160);

  ctx.fillStyle = "#f7f1e3";
  ctx.font = "600 42px Fraunces, serif";
  ctx.fillText("AdireTrust", 72, 96);
  ctx.font = "500 22px Inter, sans-serif";
  ctx.fillStyle = "#c9a227";
  ctx.fillText("Cloth check", 72, 130);

  let cursorY = 210;
  if (input.previewUrl) {
    try {
      const image = await loadImage(input.previewUrl);
      const photoH = 420;
      const photoW = width - 144;
      ctx.save();
      rounded(ctx, 72, cursorY, photoW, photoH, 28);
      ctx.clip();
      const scale = Math.max(photoW / image.width, photoH / image.height);
      const dw = image.width * scale;
      const dh = image.height * scale;
      ctx.drawImage(image, 72 + (photoW - dw) / 2, cursorY + (photoH - dh) / 2, dw, dh);
      ctx.restore();
      cursorY += photoH + 56;
    } catch {
      cursorY += 24;
    }
  }

  ctx.fillStyle = "#1b2a6b";
  ctx.font = "500 64px Fraunces, serif";
  for (const line of wrap(ctx, input.headline, width - 144)) {
    ctx.fillText(line, 72, cursorY);
    cursorY += 74;
  }

  ctx.fillStyle = "#1a1714";
  ctx.font = "400 30px Inter, sans-serif";
  cursorY += 16;
  for (const line of wrap(ctx, input.body, width - 144)) {
    ctx.fillText(line, 72, cursorY);
    cursorY += 42;
  }

  if (input.confidenceLabel) {
    cursorY += 18;
    ctx.fillStyle = "#5c574e";
    ctx.font = "500 26px Inter, sans-serif";
    ctx.fillText(input.confidenceLabel, 72, cursorY);
    cursorY += 40;
  }

  ctx.fillStyle = "#1a1714";
  ctx.font = "400 28px Inter, sans-serif";
  for (const reason of input.reasons) {
    cursorY += 16;
    for (const line of wrap(ctx, `• ${reason}`, width - 144)) {
      ctx.fillText(line, 72, cursorY);
      cursorY += 38;
    }
  }

  ctx.fillStyle = "#5c574e";
  ctx.font = "400 22px Inter, sans-serif";
  ctx.fillText("This is not a certificate.", 72, height - 72);

  await new Promise<void>((resolve, reject) => {
    canvas.toBlob((blob) => {
      if (!blob) {
        reject(new Error("Could not create the image."));
        return;
      }
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = "adiretrust-check.png";
      link.click();
      URL.revokeObjectURL(url);
      resolve();
    }, "image/png");
  });
}

function rounded(ctx: CanvasRenderingContext2D, x: number, y: number, w: number, h: number, r: number) {
  ctx.beginPath();
  ctx.moveTo(x + r, y);
  ctx.arcTo(x + w, y, x + w, y + h, r);
  ctx.arcTo(x + w, y + h, x, y + h, r);
  ctx.arcTo(x, y + h, x, y, r);
  ctx.arcTo(x, y, x + w, y, r);
  ctx.closePath();
}
