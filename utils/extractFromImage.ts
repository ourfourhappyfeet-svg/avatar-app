// Super-lightweight color extractor (no external libs).
// It samples a few regions of the uploaded image to guess hair/skin/eye colors.

export type Extracted = {
  skinTone: string;
  hairColor: string;
  eyeColor: string;
};

// Convert RGB -> hex
function rgbToHex(r: number, g: number, b: number) {
  return (
    "#" +
    [r, g, b]
      .map((x) => Math.max(0, Math.min(255, Math.round(x))).toString(16).padStart(2, "0"))
      .join("")
  );
}

// Average a rectangular region
function averageRect(
  ctx: CanvasRenderingContext2D,
  x: number, y: number, w: number, h: number
) {
  const { data } = ctx.getImageData(x, y, w, h);
  let r = 0, g = 0, b = 0, count = 0;
  for (let i = 0; i < data.length; i += 4) {
    r += data[i];
    g += data[i + 1];
    b += data[i + 2];
    count++;
  }
  return [r / count, g / count, b / count] as const;
}

/**
 * Heuristics (works best on front-facing photos):
 * - Hair: sample a band across the top 15% of the image (hair usually at top)
 * - Skin: sample a central rectangle (face usually near center)
 * - Eyes: sample small boxes where eyes often are (left/right, ~45% height)
 */
export async function extractFromImage(file: File): Promise<Extracted> {
  const url = URL.createObjectURL(file);
  try {
    const img = await loadImage(url);
    const canvas = document.createElement("canvas");
    const ctx = canvas.getContext("2d")!;
    // Normalize width so results are consistent
    const targetW = 600;
    const scale = targetW / img.width;
    const w = targetW;
    const h = Math.round(img.height * scale);
    canvas.width = w;
    canvas.height = h;
    ctx.drawImage(img, 0, 0, w, h);

    // Hair region: top band
    const hairH = Math.max(10, Math.round(h * 0.15));
    const [hr, hg, hb] = averageRect(ctx, Math.round(w * 0.1), 0, Math.round(w * 0.8), hairH);

    // Skin region: center box
    const cx = Math.round(w * 0.25);
    const cy = Math.round(h * 0.30);
    const cw = Math.round(w * 0.50);
    const ch = Math.round(h * 0.40);
    const [sr, sg, sb] = averageRect(ctx, cx, cy, cw, ch);

    // Eye regions: two small boxes
    const eyeY = Math.round(h * 0.45);
    const eyeBox = Math.max(6, Math.round(Math.min(w, h) * 0.04));
    const leftX = Math.round(w * 0.35) - Math.round(eyeBox / 2);
    const rightX = Math.round(w * 0.65) - Math.round(eyeBox / 2);
    const [elr, elg, elb] = averageRect(ctx, leftX, eyeY, eyeBox, eyeBox);
    const [err, erg, erb] = averageRect(ctx, rightX, eyeY, eyeBox, eyeBox);
    const er = (elr + err) / 2, eg = (elg + erg) / 2, eb = (elb + erb) / 2;

    // Snap colors a bit toward a pleasing palette range
    const hairHex = rgbToHex(hr * 0.9, hg * 0.7, hb * 0.6); // darker/warmer
    const skinHex = rgbToHex(sr * 1.02, sg * 0.95, sb * 0.9); // slightly warmer
    const eyeHex  = rgbToHex(er * 0.9, eg * 0.95, eb * 1.05); // slightly cooler

    return {
      hairColor: hairHex,
      skinTone: skinHex,
      eyeColor: eyeHex,
    };
  } finally {
    URL.revokeObjectURL(url);
  }
}

function loadImage(src: string) {
  return new Promise<HTMLImageElement>((resolve, reject) => {
    const img = new Image();
    img.crossOrigin = "anonymous";
    img.onload = () => resolve(img);
    img.onerror = reject;
    img.src = src;
  });
}
