import toml from "@iarna/toml";
import { execSync } from "node:child_process";
import { readFileSync, writeFileSync } from "node:fs";
import { join } from "node:path";

// Read package.json
const packageJson = JSON.parse(readFileSync("package.json", "utf8"));
const version = packageJson.version;

// Update Cargo.toml
const cargoTomlPath = join("src-tauri", "Cargo.toml");
const cargoToml = toml.parse(readFileSync(cargoTomlPath, "utf8"));
cargoToml.package.version = version;
writeFileSync(cargoTomlPath, toml.stringify(cargoToml));

// Update Cargo.lock
execSync("cargo generate-lockfile", { cwd: "src-tauri" });
