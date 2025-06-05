import { useCallback } from "react";

const hexRegex = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})?$/i;
const rgbRegex =
  /^rgba?\(\s*(\d+)\s*,\s*(\d+)\s*,\s*(\d+)(?:\s*,\s*([\d.]+))?\s*\)$/i;
const hslRegex =
  /^hsla?\(\s*(\d+)\s*,\s*(\d+)%\s*,\s*(\d+)%(?:\s*,\s*([\d.]+))?\s*\)$/i;
const oklchRegex =
  /^oklch\(\s*([\d.]+)\s*%\s*([\d.]+)\s*([\d.]+)(?:\s*\/\s*([\d.]+))?\s*\)$/i;

const detectColorFormat = (
  color: string
): "hex" | "rgb" | "rgba" | "hsl" | "hsla" | "oklch" | "invalid" => {
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
  return a !== undefined
    ? `rgba(${r}, ${g}, ${b}, ${a.toFixed(2)})`
    : `rgb(${r}, ${g}, ${b})`;
};

const rgbToHexImpl = (rgb: string): string => {
  const result = rgbRegex.exec(rgb);
  if (!result) return "Invalid color";
  const r = Number.parseInt(result[1]);
  const g = Number.parseInt(result[2]);
  const b = Number.parseInt(result[3]);
  const a = result[4]
    ? Math.round(Number.parseFloat(result[4]) * 255)
    : undefined;
  const hex = `#${r.toString(16).padStart(2, "0")}${g
    .toString(16)
    .padStart(2, "0")}${b.toString(16).padStart(2, "0")}`;
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

  return a !== undefined
    ? `hsla(${h}, ${s}%, ${lPercent}%, ${a.toFixed(2)})`
    : `hsl(${h}, ${s}%, ${lPercent}%)`;
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

// Color space conversion matrices and constants
const XYZ_TO_LMS = [
  [0.8190224432164319, 0.3619062562801221, -0.12887378261216414],
  [0.0329836671980271, 0.9292868468965546, 0.03614466816999844],
  [0.048177199566046255, 0.2642395317527308, 0.6335478258136937],
];

const LMS_TO_XYZ = [
  [1.2268798733741557, -0.5578149965554813, 0.28139105017721583],
  [-0.04057576262431372, 1.1122868293970594, -0.07171106666151701],
  [-0.07637294974672142, -0.4214933239627914, 1.5869240244272418],
];

const LMS_TO_OKLAB = [
  [0.2104542553, 0.793617785, -0.0040720468],
  [1.9779984951, -2.428592205, 0.4505937099],
  [0.0259040371, 0.7827717662, -0.808675766],
];

const OKLAB_TO_LMS = [
  [1.0, 0.3963377774, 0.2158037573],
  [1.0, -0.1055613458, -0.0638541728],
  [1.0, -0.0894841775, -1.291485548],
];

// Helper functions for color space conversions
const linearToSRGB = (c: number): number => {
  const abs = Math.abs(c);
  if (abs > 0.0031308) {
    return Math.sign(c) * (1.055 * abs ** (1 / 2.4) - 0.055);
  }
  return 12.92 * c;
};

const sRGBToLinear = (c: number): number => {
  const abs = Math.abs(c);
  if (abs > 0.04045) {
    return Math.sign(c) * ((abs + 0.055) / 1.055) ** 2.4;
  }
  return c / 12.92;
};

const matrixMultiply = (matrix: number[][], vector: number[]): number[] => {
  return matrix.map((row) =>
    row.reduce((sum, val, i) => sum + val * vector[i], 0)
  );
};

const hexToOklchImpl = (hex: string): string => {
  const result = hexRegex.exec(hex);
  if (!result) return "Invalid color";

  // Convert hex to linear RGB
  const r = sRGBToLinear(Number.parseInt(result[1], 16) / 255);
  const g = sRGBToLinear(Number.parseInt(result[2], 16) / 255);
  const b = sRGBToLinear(Number.parseInt(result[3], 16) / 255);
  const alpha = result[4] ? Number.parseInt(result[4], 16) / 255 : undefined;

  // Convert to XYZ
  const x = r * 0.4124564 + g * 0.3575761 + b * 0.1804375;
  const y = r * 0.2126729 + g * 0.7151522 + b * 0.072175;
  const z = r * 0.0193339 + g * 0.119192 + b * 0.9503041;

  // Convert to LMS
  const lms = matrixMultiply(XYZ_TO_LMS, [x, y, z]);

  // Convert to OKLab
  const lCubed = Math.cbrt(lms[0]);
  const mCubed = Math.cbrt(lms[1]);
  const sCubed = Math.cbrt(lms[2]);
  const lab = matrixMultiply(LMS_TO_OKLAB, [lCubed, mCubed, sCubed]);

  // Convert to OKLCH
  const lightness = lab[0];
  const chroma = Math.sqrt(lab[1] * lab[1] + lab[2] * lab[2]);
  const hueAngle = (Math.atan2(lab[2], lab[1]) * 180) / Math.PI;
  const hue = hueAngle < 0 ? hueAngle + 360 : hueAngle;

  return alpha !== undefined
    ? `oklch(${(lightness * 100).toFixed(2)}% ${chroma.toFixed(
        2
      )} ${hue.toFixed(2)} / ${alpha.toFixed(2)})`
    : `oklch(${(lightness * 100).toFixed(2)}% ${chroma.toFixed(
        2
      )} ${hue.toFixed(2)})`;
};

const oklchToHexImpl = (oklch: string): string => {
  const result = oklchRegex.exec(oklch);
  if (!result) return "Invalid color";

  const lightness = Number.parseFloat(result[1]) / 100;
  const chroma = Number.parseFloat(result[2]);
  const hue = Number.parseFloat(result[3]);
  const alpha = result[4] ? Number.parseFloat(result[4]) : undefined;

  // Convert OKLCH to OKLab
  const hRad = (hue * Math.PI) / 180;
  const a = chroma * Math.cos(hRad);
  const b = chroma * Math.sin(hRad);

  // Convert OKLab to LMS
  const lms = matrixMultiply(OKLAB_TO_LMS, [lightness, a, b]);
  const l = lms[0] * lms[0] * lms[0];
  const m = lms[1] * lms[1] * lms[1];
  const s = lms[2] * lms[2] * lms[2];

  // Convert LMS to XYZ
  const xyz = matrixMultiply(LMS_TO_XYZ, [l, m, s]);

  // Convert XYZ to linear RGB
  const rLinear = xyz[0] * 3.2404542 - xyz[1] * 1.5371385 - xyz[2] * 0.4985314;
  const gLinear = -xyz[0] * 0.969266 + xyz[1] * 1.8760108 + xyz[2] * 0.041556;
  const bLinear = xyz[0] * 0.0556434 - xyz[1] * 0.2040259 + xyz[2] * 1.0572252;

  // Convert linear RGB to sRGB
  const sr = Math.round(linearToSRGB(rLinear) * 255);
  const sg = Math.round(linearToSRGB(gLinear) * 255);
  const sb = Math.round(linearToSRGB(bLinear) * 255);

  const hex = `#${sr.toString(16).padStart(2, "0")}${sg
    .toString(16)
    .padStart(2, "0")}${sb.toString(16).padStart(2, "0")}`;
  return alpha !== undefined
    ? `${hex}${Math.round(alpha * 255)
        .toString(16)
        .padStart(2, "0")}`
    : hex;
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
    [rgbToHex, hslToHex, oklchToHex]
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
