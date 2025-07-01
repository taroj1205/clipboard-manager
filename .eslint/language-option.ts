import type { TSESLint } from "@typescript-eslint/utils";
import globals from "globals";
import { parser } from "typescript-eslint";
import { jsFiles, tsFiles } from "./shared";

export const languageOptionFactory = (
  project: TSESLint.ParserOptions["project"] = true,
  config: TSESLint.FlatConfig.Config = {}
): TSESLint.FlatConfig.Config => {
  const { languageOptions = {}, ...rest } = config;
  return {
    name: "eslint/language-options-typescript",
    files: tsFiles,
    languageOptions: {
      parser,
      ...languageOptions,
      globals: {
        ...globals.browser,
        ...globals.node,
        ...globals.es2015,
        ...languageOptions.globals,
      },
      parserOptions: {
        ecmaVersion: 10,
        sourceType: "module",
        ...languageOptions.parserOptions,
        project,
      },
    },
    ...rest,
  };
};

export const jsLanguageOptionFactory = (config: TSESLint.FlatConfig.Config = {}): TSESLint.FlatConfig.Config => {
  const { languageOptions = {}, ...rest } = config;
  return {
    name: "eslint/language-options-javascript",
    files: jsFiles,
    languageOptions: {
      ...languageOptions,
      globals: {
        ...globals.browser,
        ...globals.node,
        ...globals.es2015,
        ...languageOptions.globals,
      },
      parserOptions: {
        ecmaVersion: 10,
        sourceType: "module",
        ...languageOptions.parserOptions,
      },
    },
    ...rest,
  };
};
