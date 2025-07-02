export const rgbRegex =
  /^rgba?\(\s*(\d+)\s*,\s*(\d+)\s*,\s*(\d+)(?:\s*,\s*([\d.]+))?\s*\)$/i;

export const rgbToHex = (rgb: string): string => {
  const result = rgbRegex.exec(rgb);
  if (!result) {
    return "Invalid color";
  }
  const r = Number.parseInt(result[1], 10);
  const g = Number.parseInt(result[2], 10);
  const b = Number.parseInt(result[3], 10);
  const a = result[4]
    ? Math.round(Number.parseFloat(result[4]) * 255)
    : undefined;
  const hex = `#${r.toString(16).padStart(2, "0")}${g.toString(16).padStart(2, "0")}${b.toString(16).padStart(2, "0")}`;
  return a !== undefined ? `${hex}${a.toString(16).padStart(2, "0")}` : hex;
};
