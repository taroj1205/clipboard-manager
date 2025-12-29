import { z } from "zod";
import type { ClipboardEntry } from "./clipboard";
import { detectColorFormat } from "./color";
import { hexRegex, hexToHsl, hexToRgb } from "./color/hex";
import { hslToHex } from "./color/hsl";
import { hexToOklch, oklchToHex } from "./color/oklch";
import { rgbToHex } from "./color/rgb";

const unitOnlyRegex = /^([+-]?\d+(?:\.\d+)?)\s*px$/i;
const unitConversionRegex =
  /^([+-]?\d+(?:\.\d+)?)\s*(px|rem|em|in|cm|mm|pt|pc)\s*(?:to|in)\s*(px|rem|em|in|cm|mm|pt|pc)$/i;
const colorConversionRegex = /^(.+?)\s+(?:to|in)\s+(hex|rgb|hsl|oklch)\s*$/i;
const expressionTokenRegex = /\s*([()+\-*/%]|\d+(?:\.\d+)?)\s*/y;
const mathAllowedCharsRegex = /^[\d\s()+\-*/%.]+$/;
const trailingZerosRegex = /\.?0+$/;

const unitToPx = {
  cm: 96 / 2.54,
  em: 16,
  in: 96,
  mm: 96 / 25.4,
  pc: 16,
  pt: 96 / 72,
  px: 1,
  rem: 16,
} as const;

const unitSchema = z.enum(["px", "rem", "em", "in", "cm", "mm", "pt", "pc"]);
const colorTargetSchema = z.enum(["hex", "rgb", "hsl", "oklch"]);
const smartCommandSchema = z.discriminatedUnion("kind", [
  z.object({
    expression: z.string().min(1),
    kind: z.literal("math"),
  }),
  z.object({
    from: unitSchema,
    kind: z.literal("unit"),
    to: unitSchema,
    value: z.number(),
  }),
  z.object({
    kind: z.literal("color"),
    to: colorTargetSchema,
    value: z.string().min(1),
  }),
]);

type Unit = z.infer<typeof unitSchema>;
type Operator = "+" | "-" | "*" | "/" | "%";
type MathToken =
  | { kind: "number"; value: number }
  | { kind: "operator"; value: Operator }
  | { kind: "paren"; value: "(" | ")" };
type ColorFormat =
  | "hex"
  | "hsl"
  | "hsla"
  | "invalid"
  | "oklch"
  | "rgb"
  | "rgba";

interface SmartEntry {
  content: string;
  type: ClipboardEntry["type"];
}

const operatorPrecedence = {
  "+": 1,
  "-": 1,
  "*": 2,
  "/": 2,
  "%": 2,
} as const;

const formatNumber = (value: number, digits: number): string => {
  const fixed = value.toFixed(digits);
  return fixed.replace(trailingZerosRegex, "");
};

const normalizeUnit = (raw: string): Unit | null => {
  const unit = raw.toLowerCase();
  const parsed = unitSchema.safeParse(unit);
  return parsed.success ? parsed.data : null;
};

const normalizeHex = (value: string): string =>
  value.startsWith("#") ? value : `#${value}`;

const normalizeToHex = (color: string, format: ColorFormat): string | null => {
  if (hexRegex.test(color)) {
    return normalizeHex(color);
  }
  if (format === "rgb" || format === "rgba") {
    const hex = rgbToHex(color);
    return hex === "Invalid color" ? null : hex;
  }
  if (format === "hsl" || format === "hsla") {
    const hex = hslToHex(color);
    return hex === "Invalid color" ? null : hex;
  }
  if (format === "oklch") {
    const hex = oklchToHex(color);
    return hex === "Invalid color" ? null : hex;
  }
  return null;
};

const buildColorEntry = (query: string): SmartEntry | null => {
  const match = colorConversionRegex.exec(query);
  if (!match) {
    return null;
  }

  const rawColor = match[1].trim();
  const targetParse = colorTargetSchema.safeParse(match[2].toLowerCase());
  if (!targetParse.success) {
    return null;
  }
  const commandParse = smartCommandSchema.safeParse({
    kind: "color",
    to: targetParse.data,
    value: rawColor,
  });
  if (!commandParse.success) {
    return null;
  }

  const format = detectColorFormat(rawColor) as ColorFormat;
  if (format === "invalid") {
    return null;
  }

  const hex = normalizeToHex(rawColor, format);
  if (!hex) {
    return null;
  }

  let result: string | null = null;
  if (targetParse.data === "hex") {
    result = normalizeHex(hex);
  } else if (targetParse.data === "rgb") {
    result = hexToRgb(hex);
  } else if (targetParse.data === "hsl") {
    result = hexToHsl(hex);
  } else {
    result = hexToOklch(hex);
  }

  if (!result || result === "Invalid color") {
    return null;
  }

  return { content: result, type: "color" };
};

const convertUnits = (value: number, fromUnit: Unit, toUnit: Unit): number => {
  const pxValue = value * unitToPx[fromUnit];
  return pxValue / unitToPx[toUnit];
};

const buildUnitEntry = (query: string): SmartEntry | null => {
  const conversionMatch = unitConversionRegex.exec(query);
  if (conversionMatch) {
    const value = Number.parseFloat(conversionMatch[1]);
    const fromUnit = normalizeUnit(conversionMatch[2]);
    const toUnit = normalizeUnit(conversionMatch[3]);

    if (!(Number.isFinite(value) && fromUnit && toUnit)) {
      return null;
    }

    const commandParse = smartCommandSchema.safeParse({
      from: fromUnit,
      kind: "unit",
      to: toUnit,
      value,
    });
    if (!commandParse.success) {
      return null;
    }

    const converted = convertUnits(value, fromUnit, toUnit);
    const formatted = `${formatNumber(converted, 4)}${toUnit}`;
    return { content: formatted, type: "text" };
  }

  const pxMatch = unitOnlyRegex.exec(query);
  if (!pxMatch) {
    return null;
  }

  const value = Number.parseFloat(pxMatch[1]);
  if (!Number.isFinite(value)) {
    return null;
  }

  const commandParse = smartCommandSchema.safeParse({
    from: "px",
    kind: "unit",
    to: "rem",
    value,
  });
  if (!commandParse.success) {
    return null;
  }

  const converted = convertUnits(value, "px", "rem");
  return { content: `${formatNumber(converted, 4)}rem`, type: "text" };
};

const tokenizeExpression = (input: string): MathToken[] | null => {
  if (!mathAllowedCharsRegex.test(input)) {
    return null;
  }

  const tokens: MathToken[] = [];
  expressionTokenRegex.lastIndex = 0;

  let match = expressionTokenRegex.exec(input);
  let hasOperator = false;
  let endIndex = 0;

  while (match) {
    const rawToken = match[1];
    endIndex = expressionTokenRegex.lastIndex;
    if (rawToken === "(" || rawToken === ")") {
      tokens.push({ kind: "paren", value: rawToken });
    } else if (rawToken in operatorPrecedence) {
      tokens.push({ kind: "operator", value: rawToken as Operator });
      hasOperator = true;
    } else {
      const value = Number.parseFloat(rawToken);
      if (!Number.isFinite(value)) {
        return null;
      }
      tokens.push({ kind: "number", value });
    }
    match = expressionTokenRegex.exec(input);
  }

  if (!hasOperator || endIndex !== input.length) {
    return null;
  }

  return tokens;
};

const flushUntilLeftParen = (
  operators: Array<Operator | "(">,
  output: MathToken[]
): boolean => {
  // biome-ignore lint/style/useAtIndex: .at() requires newer lib target.
  while (operators.length > 0 && operators[operators.length - 1] !== "(") {
    output.push({ kind: "operator", value: operators.pop() as Operator });
  }
  if (operators.length === 0) {
    return false;
  }
  operators.pop();
  return true;
};

const pushOperator = (
  token: Extract<MathToken, { kind: "operator" }>,
  operators: Array<Operator | "(">,
  output: MathToken[]
) => {
  while (operators.length > 0) {
    // biome-ignore lint/style/useAtIndex: .at() requires newer lib target.
    const top = operators[operators.length - 1];
    if (top === "(") {
      break;
    }
    if (operatorPrecedence[top] < operatorPrecedence[token.value]) {
      break;
    }
    output.push({ kind: "operator", value: operators.pop() as Operator });
  }
  operators.push(token.value);
};

const isUnaryOperatorPosition = (
  previous: "leftParen" | "number" | "operator" | null
): boolean =>
  previous === null || previous === "operator" || previous === "leftParen";

const handleNumberToken = (
  token: Extract<MathToken, { kind: "number" }>,
  output: MathToken[]
): "number" => {
  output.push(token);
  return "number";
};

const handleParenToken = (
  token: Extract<MathToken, { kind: "paren" }>,
  operators: Array<Operator | "(">,
  output: MathToken[]
): "leftParen" | "number" | null => {
  if (token.value === "(") {
    operators.push(token.value);
    return "leftParen";
  }

  if (!flushUntilLeftParen(operators, output)) {
    return null;
  }
  return "number";
};

const handleOperatorToken = (
  token: Extract<MathToken, { kind: "operator" }>,
  previous: "leftParen" | "number" | "operator" | null,
  operators: Array<Operator | "(">,
  output: MathToken[]
): "operator" | null => {
  if (isUnaryOperatorPosition(previous)) {
    if (token.value === "+" || token.value === "-") {
      output.push({ kind: "number", value: 0 });
    } else {
      return null;
    }
  }

  pushOperator(token, operators, output);
  return "operator";
};

const getNextPrevious = (
  token: MathToken,
  previous: "leftParen" | "number" | "operator" | null,
  operators: Array<Operator | "(">,
  output: MathToken[]
): "leftParen" | "number" | "operator" | null => {
  if (token.kind === "number") {
    return handleNumberToken(token, output);
  }
  if (token.kind === "paren") {
    return handleParenToken(token, operators, output);
  }
  return handleOperatorToken(token, previous, operators, output);
};

const toRpn = (tokens: MathToken[]): MathToken[] | null => {
  const output: MathToken[] = [];
  const operators: Array<Operator | "("> = [];
  let previous: "leftParen" | "number" | "operator" | null = null;

  for (const token of tokens) {
    const nextPrevious = getNextPrevious(token, previous, operators, output);

    if (!nextPrevious) {
      return null;
    }

    previous = nextPrevious;
  }

  while (operators.length > 0) {
    const top = operators.pop();
    if (!top || top === "(") {
      return null;
    }
    output.push({ kind: "operator", value: top });
  }

  return output;
};

const operatorHandlers = {
  "+": (left: number, right: number) => left + right,
  "-": (left: number, right: number) => left - right,
  "*": (left: number, right: number) => left * right,
  "/": (left: number, right: number) => left / right,
  "%": (left: number, right: number) => left % right,
} as const;

const evaluateRpn = (tokens: MathToken[]): number | null => {
  const stack: number[] = [];

  for (const token of tokens) {
    if (token.kind === "number") {
      stack.push(token.value);
      continue;
    }

    if (token.kind !== "operator") {
      return null;
    }

    const right = stack.pop();
    const left = stack.pop();
    if (right === undefined || left === undefined) {
      return null;
    }

    const handler = operatorHandlers[token.value];
    const value = handler(left, right);

    if (!Number.isFinite(value)) {
      return null;
    }

    stack.push(value);
  }

  if (stack.length !== 1) {
    return null;
  }

  const [result] = stack;
  return Number.isFinite(result) ? result : null;
};

const buildMathEntry = (query: string): SmartEntry | null => {
  const tokens = tokenizeExpression(query);
  if (!tokens) {
    return null;
  }

  const commandParse = smartCommandSchema.safeParse({
    expression: query,
    kind: "math",
  });
  if (!commandParse.success) {
    return null;
  }

  const rpn = toRpn(tokens);
  if (!rpn) {
    return null;
  }

  const result = evaluateRpn(rpn);
  if (result === null) {
    return null;
  }

  return { content: formatNumber(result, 6), type: "text" };
};

export const buildSmartEntry = (
  query: string,
  timestamp: number
): ClipboardEntry | null => {
  const trimmed = query.trim();
  if (!trimmed) {
    return null;
  }

  const colorEntry = buildColorEntry(trimmed);
  if (colorEntry) {
    return {
      app: "Smart Search",
      content: colorEntry.content,
      timestamp,
      type: colorEntry.type,
    };
  }

  const unitEntry = buildUnitEntry(trimmed);
  if (unitEntry) {
    return {
      app: "Smart Search",
      content: unitEntry.content,
      timestamp,
      type: unitEntry.type,
    };
  }

  const mathEntry = buildMathEntry(trimmed);
  if (!mathEntry) {
    return null;
  }

  return {
    app: "Smart Search",
    content: mathEntry.content,
    timestamp,
    type: mathEntry.type,
  };
};
