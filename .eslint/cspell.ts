import type { Linter } from "eslint";
import cspellPlugin from "@cspell/eslint-plugin";
import cspellJson from "../cspell.json";
import { sharedFiles } from "./shared";

export const cspellConfig: Linter.Config = {
  name: "eslint/cspell",
  files: sharedFiles,
  plugins: { "@cspell": cspellPlugin },
  rules: {
    "@cspell/spellchecker": [
      "warn",
      {
        cspell: {},
        configFile: new URL("../cspell.json", import.meta.url).toString(),
      },
    ],
  },
  ignores: cspellJson.ignorePaths,
};
