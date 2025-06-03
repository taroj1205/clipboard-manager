import toml from "@iarna/toml";
import { execSync } from "node:child_process";
import { readFileSync, writeFileSync } from "node:fs";
import { join } from "node:path";

try {
  // Read package.json to get the new version
  const packageJson = JSON.parse(readFileSync("package.json", "utf8"));
  const version = packageJson.version;

  console.log(`Syncing version ${version} to Cargo files...`);

  // Update Cargo.toml
  const cargoTomlPath = join("src-tauri", "Cargo.toml");
  const cargoToml = toml.parse(readFileSync(cargoTomlPath, "utf8"));
  cargoToml.package.version = version;
  writeFileSync(cargoTomlPath, toml.stringify(cargoToml));
  console.log(`Updated ${cargoTomlPath}`);

  // Update Cargo.lock
  execSync("cargo generate-lockfile", { cwd: "src-tauri" });
  console.log("Updated Cargo.lock");

  console.log("Cargo version sync completed successfully!");
} catch (error) {
  console.error("Error syncing Cargo version:", error.message);
  process.exit(1);
}
