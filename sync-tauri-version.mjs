import fs from "fs";

const pkg = JSON.parse(fs.readFileSync("package.json", "utf8"));
const version = pkg.version;

// Update Cargo.toml
const cargoPath = "src-tauri/Cargo.toml";
let cargo = fs.readFileSync(cargoPath, "utf8");
cargo = cargo.replace(/version = "[^"]+"/, `version = "${version}"`);
fs.writeFileSync(cargoPath, cargo);

// Update tauri.conf.json
const tauriConfPath = "src-tauri/tauri.conf.json";
let tauriConf = JSON.parse(fs.readFileSync(tauriConfPath, "utf8"));
tauriConf.version = version;
fs.writeFileSync(tauriConfPath, JSON.stringify(tauriConf, null, 2) + "\n");

console.log(`Synced version to ${version} in Cargo.toml and tauri.conf.json`);
