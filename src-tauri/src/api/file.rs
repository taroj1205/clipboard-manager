use base64::{engine::general_purpose, Engine as _};
use once_cell::sync::Lazy;
use std::env;
use std::fs;
use std::fs::File;
use std::io::Write;
use std::path::Path;
#[tauri::command]
pub fn write_file(path: String, data: String) -> Result<String, String> {
    if let Some(parent) = Path::new(&path).parent() {
        fs::create_dir_all(parent).map_err(|e| e.to_string())?;
    }
    let mut file = File::create(&path).map_err(|e| e.to_string())?;
    if path.ends_with(".png") {
        // Decode base64 and write as binary for PNG files
        let decoded = general_purpose::STANDARD
            .decode(&data)
            .map_err(|e| e.to_string())?;
        file.write_all(&decoded).map_err(|e| e.to_string())?;
    } else {
        // Write as text for other files
        file.write_all(data.as_bytes()).map_err(|e| e.to_string())?;
    }
    Ok(path.to_string())
}

#[tauri::command]
pub fn read_file(path: String) -> Result<String, String> {
    // create parent directories if they don't exist
    if let Some(parent) = Path::new(&path).parent() {
        fs::create_dir_all(parent).map_err(|e| e.to_string())?;
    }
    let data = fs::read_to_string(&path).map_err(|e| e.to_string())?;
    Ok(data)
}
