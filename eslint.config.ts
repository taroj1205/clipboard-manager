import type { TSESLint } from "@typescript-eslint/utils";
import prettierConfig from "eslint-config-prettier";
import tseslint from "typescript-eslint";
import {
  baseConfig,
  cspellConfig,
  importConfigArray,
  jsLanguageOptionFactory,
  languageOptionFactory,
  perfectionistConfig,
  reactConfig,
  reactHooksConfig,
  testingLibraryConfig,
  typescriptConfig,
  vitestConfig,
} from "./.eslint";

const ignoresConfig: TSESLint.FlatConfig.Config = {
  name: "eslint/ignores",
  ignores: [
    "**/dist/**",
    "**/node_modules/**",
    "**/build/**",
    "src-tauri/gen/**",
    "src-tauri/target/**",
  ],
};

const jsLanguageOptionConfig = jsLanguageOptionFactory();
const tsLanguageOptionConfig = languageOptionFactory(true);

const config: TSESLint.FlatConfig.ConfigArray = tseslint.config(
  ignoresConfig,
  jsLanguageOptionConfig,
  tsLanguageOptionConfig,
  baseConfig,
  typescriptConfig,
  ...importConfigArray,
  perfectionistConfig,
  cspellConfig,
  reactConfig,
  reactHooksConfig,
  vitestConfig,
  testingLibraryConfig,
  prettierConfig
);

export default config;
