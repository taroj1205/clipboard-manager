import { useCallback } from "react";
import { hexRegex, hexToHsl, hexToRgb } from "./color/hex";
import { hslRegex, hslToHex } from "./color/hsl";
import { hexToOklch, oklchRegex, oklchToHex } from "./color/oklch";
import { rgbRegex, rgbToHex } from "./color/rgb";

const detectColorFormat = (color: string): "hex" | "hsl" | "hsla" | "invalid" | "oklch" | "rgb" | "rgba" => {
  if (hexRegex.test(color)) return color.length === 9 ? "rgba" : "hex";
  if (rgbRegex.test(color)) return color.includes("rgba") ? "rgba" : "rgb";
  if (hslRegex.test(color)) return color.includes("hsla") ? "hsla" : "hsl";
  if (oklchRegex.test(color)) return "oklch";
  return "invalid";
};

export const useColorConverters = () => {
  const normalizeColor = useCallback((color: string): string => {
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
  }, []);

  return {
    detectColorFormat,
    hexToHsl,
    hexToOklch,
    hexToRgb,
    hslToHex,
    normalizeColor,
    oklchToHex,
    rgbToHex,
  };
};

export { detectColorFormat };
