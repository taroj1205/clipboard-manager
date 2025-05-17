import { readFileSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import toml from "@iarna/toml";

// Read package.json
const packageJson = JSON.parse(readFileSync("package.json", "utf8"));
const version = packageJson.version;

// Update tauri.conf.json
const tauriConfigPath = join("src-tauri", "tauri.conf.json");
const tauriConfig = JSON.parse(readFileSync(tauriConfigPath, "utf8"));
tauriConfig.version = version;
writeFileSync(tauriConfigPath, `${JSON.stringify(tauriConfig, null, 2)}\n`);

// Update Cargo.toml
const cargoTomlPath = join("src-tauri", "Cargo.toml");
const cargoToml = toml.parse(readFileSync(cargoTomlPath, "utf8"));
cargoToml.package.version = version;
writeFileSync(cargoTomlPath, toml.stringify(cargoToml));
