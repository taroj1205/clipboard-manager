use tauri::{AppHandle, Emitter, Manager};
use tauri_plugin_clipboard::Clipboard;

#[tauri::command]
pub fn start_monitor(app_handle: AppHandle) -> Result<(), String> {
    let clipboard = app_handle.state::<Clipboard>();
    clipboard
        .start_monitor(app_handle.clone())
        .map_err(|e| e.to_string())?;
    app_handle
        .emit("plugin:clipboard://clipboard-monitor/status", true)
        .map_err(|e| e.to_string())?;
    println!("Clipboard monitor started");
    Ok(())
}
