export const hexRegex =
  /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})?$/i;

export const hexToRgb = (hex: string): string => {
  const result = hexRegex.exec(hex);
  if (!result) {
    return "Invalid color";
  }
  const r = Number.parseInt(result[1], 16);
  const g = Number.parseInt(result[2], 16);
  const b = Number.parseInt(result[3], 16);
  const a = result[4] ? Number.parseInt(result[4], 16) / 255 : undefined;
  return a !== undefined
    ? `rgba(${r}, ${g}, ${b}, ${a.toFixed(2)})`
    : `rgb(${r}, ${g}, ${b})`;
};

export const hexToHsl = (hex: string): string => {
  const result = hexRegex.exec(hex);
  if (!result) {
    return "Invalid color";
  }

  const r = Number.parseInt(result[1], 16) / 255;
  const g = Number.parseInt(result[2], 16) / 255;
  const b = Number.parseInt(result[3], 16) / 255;
  const a = result[4] ? Number.parseInt(result[4], 16) / 255 : undefined;

  const max = Math.max(r, g, b);
  const min = Math.min(r, g, b);
  let h = 0;
  let s = 0;
  const l = (max + min) / 2;

  if (max !== min) {
    const d = max - min;
    s = l > 0.5 ? d / (2 - max - min) : d / (max + min);

    switch (max) {
      case r:
        h = (g - b) / d + (g < b ? 6 : 0);
        break;
      case g:
        h = (b - r) / d + 2;
        break;
      case b:
        h = (r - g) / d + 4;
        break;
      default:
        break;
    }

    h /= 6;
  }

  h = Math.round(h * 360);
  s = Math.round(s * 100);
  const lPercent = Math.round(l * 100);

  return a !== undefined
    ? `hsla(${h}, ${s}%, ${lPercent}%, ${a.toFixed(2)})`
    : `hsl(${h}, ${s}%, ${lPercent}%)`;
};
