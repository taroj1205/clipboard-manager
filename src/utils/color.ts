import { useCallback } from "react";

const hexRegex = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})?$/i;
const rgbRegex = /^rgba?\(\s*(\d+)\s*,\s*(\d+)\s*,\s*(\d+)(?:\s*,\s*([\d.]+))?\s*\)$/i;
const hslRegex = /^hsla?\(\s*(\d+)\s*,\s*(\d+)%\s*,\s*(\d+)%(?:\s*,\s*([\d.]+))?\s*\)$/i;
const oklchRegex = /^oklch\(\s*([\d.]+)\s*%\s*([\d.]+)\s*([\d.]+)(?:\s*\/\s*([\d.]+))?\s*\)$/i;

const detectColorFormat = (color: string): "hex" | "rgb" | "rgba" | "hsl" | "hsla" | "oklch" | "invalid" => {
  if (hexRegex.test(color)) return color.length === 9 ? "rgba" : "hex";
  if (rgbRegex.test(color)) return color.includes("rgba") ? "rgba" : "rgb";
  if (hslRegex.test(color)) return color.includes("hsla") ? "hsla" : "hsl";
  if (oklchRegex.test(color)) return "oklch";
  return "invalid";
};

const hexToRgbImpl = (hex: string): string => {
  const result = hexRegex.exec(hex);
  if (!result) return "Invalid color";
  const r = Number.parseInt(result[1], 16);
  const g = Number.parseInt(result[2], 16);
  const b = Number.parseInt(result[3], 16);
  const a = result[4] ? Number.parseInt(result[4], 16) / 255 : undefined;
  return a !== undefined ? `rgba(${r}, ${g}, ${b}, ${a.toFixed(2)})` : `rgb(${r}, ${g}, ${b})`;
};

const rgbToHexImpl = (rgb: string): string => {
  const result = rgbRegex.exec(rgb);
  if (!result) return "Invalid color";
  const r = Number.parseInt(result[1]);
  const g = Number.parseInt(result[2]);
  const b = Number.parseInt(result[3]);
  const a = result[4] ? Math.round(Number.parseFloat(result[4]) * 255) : undefined;
  const hex = `#${r.toString(16).padStart(2, "0")}${g.toString(16).padStart(2, "0")}${b.toString(16).padStart(2, "0")}`;
  return a !== undefined ? `${hex}${a.toString(16).padStart(2, "0")}` : hex;
};

const hexToHslImpl = (hex: string): string => {
  const result = hexRegex.exec(hex);
  if (!result) return "Invalid color";

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
    }

    h /= 6;
  }

  h = Math.round(h * 360);
  s = Math.round(s * 100);
  const lPercent = Math.round(l * 100);

  return a !== undefined ? `hsla(${h}, ${s}%, ${lPercent}%, ${a.toFixed(2)})` : `hsl(${h}, ${s}%, ${lPercent}%)`;
};

const hslToHexImpl = (hsl: string): string => {
  const result = hslRegex.exec(hsl);
  if (!result) return "Invalid color";

  const h = Number.parseInt(result[1]) / 360;
  const s = Number.parseInt(result[2]) / 100;
  const l = Number.parseInt(result[3]) / 100;
  const a = result[4] ? Number.parseFloat(result[4]) : undefined;

  let r: number;
  let g: number;
  let b: number;

  if (s === 0) {
    r = l;
    g = l;
    b = l;
  } else {
    const hue2rgb = (p: number, q: number, t: number) => {
      let adjustedT = t;
      if (adjustedT < 0) adjustedT += 1;
      if (adjustedT > 1) adjustedT -= 1;
      if (adjustedT < 1 / 6) return p + (q - p) * 6 * adjustedT;
      if (adjustedT < 1 / 2) return q;
      if (adjustedT < 2 / 3) return p + (q - p) * (2 / 3 - adjustedT) * 6;
      return p;
    };

    const q = l < 0.5 ? l * (1 + s) : l + s - l * s;
    const p = 2 * l - q;

    r = hue2rgb(p, q, h + 1 / 3);
    g = hue2rgb(p, q, h);
    b = hue2rgb(p, q, h - 1 / 3);
  }

  const toHex = (x: number) => {
    const hex = Math.round(x * 255).toString(16);
    return hex.length === 1 ? `0${hex}` : hex;
  };

  const hex = `#${toHex(r)}${toHex(g)}${toHex(b)}`;
  return a !== undefined
    ? `${hex}${Math.round(a * 255)
        .toString(16)
        .padStart(2, "0")}`
    : hex;
};

const oklchToHexImpl = (oklch: string): string => {
  const result = oklchRegex.exec(oklch);
  if (!result) return "Invalid color";

  // This is a simplified conversion. For accurate OKLCH to RGB conversion,
  // you would need a more complex color space conversion library
  const l = Number.parseFloat(result[1]) / 100;
  const c = Number.parseFloat(result[2]);
  const h = Number.parseFloat(result[3]);
  const a = result[4] ? Number.parseFloat(result[4]) : undefined;

  // Simplified conversion (not accurate, but works for basic cases)
  const r = Math.min(255, Math.max(0, Math.round(l * 255)));
  const g = Math.min(255, Math.max(0, Math.round(l * 255)));
  const b = Math.min(255, Math.max(0, Math.round(l * 255)));

  const hex = `#${r.toString(16).padStart(2, "0")}${g.toString(16).padStart(2, "0")}${b.toString(16).padStart(2, "0")}`;
  return a !== undefined
    ? `${hex}${Math.round(a * 255)
        .toString(16)
        .padStart(2, "0")}`
    : hex;
};

const hexToOklchImpl = (hex: string): string => {
  const result = hexRegex.exec(hex);
  if (!result) return "Invalid color";

  const r = Number.parseInt(result[1], 16) / 255;
  const g = Number.parseInt(result[2], 16) / 255;
  const b = Number.parseInt(result[3], 16) / 255;
  const a = result[4] ? Number.parseInt(result[4], 16) / 255 : undefined;

  const l = Math.cbrt(0.2126 * r * r + 0.7152 * g * g + 0.0722 * b * b);
  const c = Math.sqrt(0.4122 * (r - l) * (r - l) + 0.5363 * (g - l) * (g - l) + 0.0515 * (b - l) * (b - l));
  const h = (Math.atan2(b - g, r - g) * 180) / Math.PI;

  return a !== undefined
    ? `oklch(${l.toFixed(2)}% ${c.toFixed(2)} ${h.toFixed(2)} / ${a.toFixed(2)})`
    : `oklch(${l.toFixed(2)}% ${c.toFixed(2)} ${h.toFixed(2)})`;
};

export const useColorConverters = () => {
  const hexToRgb = useCallback(hexToRgbImpl, []);
  const rgbToHex = useCallback(rgbToHexImpl, []);
  const hexToHsl = useCallback(hexToHslImpl, []);
  const hslToHex = useCallback(hslToHexImpl, []);
  const oklchToHex = useCallback(oklchToHexImpl, []);
  const hexToOklch = useCallback(hexToOklchImpl, []);
  const normalizeColor = useCallback(
    (color: string): string => {
      const format = detectColorFormat(color);
      switch (format) {
        case "hex":
          return color.startsWith("#") ? color : `#${color}`;
        case "rgb":
          return rgbToHex(color);
        case "hsl":
          return hslToHex(color);
        case "oklch":
          return oklchToHex(color);
        default:
          return color;
      }
    },
    [rgbToHex, hslToHex, oklchToHex],
  );

  return {
    hexToRgb,
    rgbToHex,
    hexToHsl,
    hslToHex,
    oklchToHex,
    hexToOklch,
    normalizeColor,
    detectColorFormat,
  };
};

export { detectColorFormat };
