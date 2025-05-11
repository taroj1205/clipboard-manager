#[cfg(target_os = "windows")]
use tauri::command;

#[cfg(target_os = "windows")]
#[command]
pub async fn ocr_image(image_path: String) -> Result<String, String> {
    match win_ocr::ocr(&image_path) {
        Ok(text) => Ok(text),
        Err(e) => Err(format!("OCR failed: {}", e)),
    }
}

// On non-Windows platforms, provide a stub that always errors
#[cfg(not(target_os = "windows"))]
#[tauri::command]
pub async fn ocr_image(_image_path: String) -> Result<String, String> {
    Err("OCR is only supported on Windows.".to_string())
}
