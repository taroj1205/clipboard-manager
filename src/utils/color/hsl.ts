export const hslRegex =
  /^hsla?\(\s*(\d+)\s*,\s*(\d+)%\s*,\s*(\d+)%(?:\s*,\s*([\d.]+))?\s*\)$/i;

export const hslToHex = (hsl: string): string => {
  const result = hslRegex.exec(hsl);
  if (!result) {
    return 'Invalid color';
  }

  const h = Number.parseInt(result[1], 10) / 360;
  const s = Number.parseInt(result[2], 10) / 100;
  const l = Number.parseInt(result[3], 10) / 100;
  const a = result[4] ? Number.parseFloat(result[4]) : undefined;

  let r: number;
  let g: number;
  let b: number;

  if (s === 0) {
    r = l;
    g = l;
    b = l;
  } else {
    const hue2rgb = (pVal: number, qVal: number, t: number) => {
      let adjustedT = t;
      if (adjustedT < 0) {
        adjustedT += 1;
      }
      if (adjustedT > 1) {
        adjustedT -= 1;
      }
      if (adjustedT < 1 / 6) {
        return pVal + (qVal - pVal) * 6 * adjustedT;
      }
      if (adjustedT < 1 / 2) {
        return qVal;
      }
      if (adjustedT < 2 / 3) {
        return pVal + (qVal - pVal) * (2 / 3 - adjustedT) * 6;
      }
      return pVal;
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
        .padStart(2, '0')}`
    : hex;
};
