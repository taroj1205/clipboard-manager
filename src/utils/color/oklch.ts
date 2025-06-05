import { hexRegex } from "./hex";

export const oklchRegex = /^oklch\(\s*([\d.]+)\s*%\s*([\d.]+)\s*([\d.]+)(?:\s*\/\s*([\d.]+))?\s*\)$/i;

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
  return matrix.map((row) => row.reduce((sum, val, i) => sum + val * vector[i], 0));
};

export const hexToOklch = (hex: string): string => {
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
    ? `oklch(${(lightness * 100).toFixed(2)}% ${chroma.toFixed(2)} ${hue.toFixed(2)} / ${alpha.toFixed(2)})`
    : `oklch(${(lightness * 100).toFixed(2)}% ${chroma.toFixed(2)} ${hue.toFixed(2)})`;
};

export const oklchToHex = (oklch: string): string => {
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

  const hex = `#${sr.toString(16).padStart(2, "0")}${sg.toString(16).padStart(2, "0")}${sb.toString(16).padStart(2, "0")}`;
  return alpha !== undefined
    ? `${hex}${Math.round(alpha * 255)
        .toString(16)
        .padStart(2, "0")}`
    : hex;
};
