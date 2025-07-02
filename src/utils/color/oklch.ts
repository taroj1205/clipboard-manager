import { hexRegex } from "./hex";

export const oklchRegex =
  /^oklch\(\s*([\d.]+)\s*%\s*([\d.]+)\s*([\d.]+)(?:\s*\/\s*([\d.]+))?\s*\)$/i;

// Color space conversion matrices and constants
const XYZ_TO_LMS = [
  [0.819_022_443_216_431_9, 0.361_906_256_280_122_1, -0.128_873_782_612_164_14],
  [0.032_983_667_198_027_1, 0.929_286_846_896_554_6, 0.036_144_668_169_998_44],
  [0.048_177_199_566_046_255, 0.264_239_531_752_730_8, 0.633_547_825_813_693_7],
];

const LMS_TO_XYZ = [
  [1.226_879_873_374_155_7, -0.557_814_996_555_481_3, 0.281_391_050_177_215_83],
  [
    -0.040_575_762_624_313_72, 1.112_286_829_397_059_4,
    -0.071_711_066_661_517_01,
  ],
  [
    -0.076_372_949_746_721_42, -0.421_493_323_962_791_4,
    1.586_924_024_427_241_8,
  ],
];

const LMS_TO_OKLAB = [
  [0.210_454_255_3, 0.793_617_785, -0.004_072_046_8],
  [1.977_998_495_1, -2.428_592_205, 0.450_593_709_9],
  [0.025_904_037_1, 0.782_771_766_2, -0.808_675_766],
];

const OKLAB_TO_LMS = [
  [1.0, 0.396_337_777_4, 0.215_803_757_3],
  [1.0, -0.105_561_345_8, -0.063_854_172_8],
  [1.0, -0.089_484_177_5, -1.291_485_548],
];

// Helper functions for color space conversions
const linearToSRGB = (c: number): number => {
  const abs = Math.abs(c);
  if (abs > 0.003_130_8) {
    return Math.sign(c) * (1.055 * abs ** (1 / 2.4) - 0.055);
  }
  return 12.92 * c;
};

const sRGBToLinear = (c: number): number => {
  const abs = Math.abs(c);
  if (abs > 0.040_45) {
    return Math.sign(c) * ((abs + 0.055) / 1.055) ** 2.4;
  }
  return c / 12.92;
};

const matrixMultiply = (matrix: number[][], vector: number[]): number[] => {
  return matrix.map((row) =>
    row.reduce((sum, val, i) => sum + val * vector[i], 0)
  );
};

export const hexToOklch = (hex: string): string => {
  const result = hexRegex.exec(hex);
  if (!result) {
    return "Invalid color";
  }

  // Convert hex to linear RGB
  const r = sRGBToLinear(Number.parseInt(result[1], 16) / 255);
  const g = sRGBToLinear(Number.parseInt(result[2], 16) / 255);
  const b = sRGBToLinear(Number.parseInt(result[3], 16) / 255);
  const alpha = result[4] ? Number.parseInt(result[4], 16) / 255 : undefined;

  // Convert to XYZ
  const x = r * 0.412_456_4 + g * 0.357_576_1 + b * 0.180_437_5;
  const y = r * 0.212_672_9 + g * 0.715_152_2 + b * 0.072_175;
  const z = r * 0.019_333_9 + g * 0.119_192 + b * 0.950_304_1;

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
  if (!result) {
    return "Invalid color";
  }

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
  const rLinear =
    xyz[0] * 3.240_454_2 - xyz[1] * 1.537_138_5 - xyz[2] * 0.498_531_4;
  const gLinear =
    -xyz[0] * 0.969_266 + xyz[1] * 1.876_010_8 + xyz[2] * 0.041_556;
  const bLinear =
    xyz[0] * 0.055_643_4 - xyz[1] * 0.204_025_9 + xyz[2] * 1.057_225_2;

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
