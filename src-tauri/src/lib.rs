// Prevents additional console window on Windows in release.
#![cfg_attr(not(debug_assertions), windows_subsystem = "windows")]

mod commands;

use tauri::Manager;

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    tauri::Builder::default()
        .plugin(tauri_plugin_opener::init())
        .plugin(tauri_plugin_shell::init())
        .plugin(tauri_plugin_fs::init())
        .plugin(tauri_plugin_dialog::init())
        .setup(|app| {
            #[cfg(debug_assertions)]
            {
                let window = app.get_webview_window("main").unwrap();
                window.open_devtools();
            }
            let _ = app;
            Ok(())
        })
        .invoke_handler(tauri::generate_handler![
            commands::open_app,
            commands::open_url,
            commands::set_volume,
            commands::notify,
            commands::shutdown,
            commands::lock,
            commands::system_info,
            commands::clipboard_write,
            commands::clipboard_read,
            commands::open_folder,
            commands::type_text,
            commands::list_running_apps,
            commands::run_command,
        ])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
