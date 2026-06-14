use serde::{Deserialize, Serialize};

#[derive(Serialize, Deserialize)]
pub struct CommandResult {
    pub ok: bool,
    pub message: String,
    pub data: Option<serde_json::Value>,
}

impl CommandResult {
    fn ok(message: impl Into<String>) -> Self {
        Self {
            ok: true,
            message: message.into(),
            data: None,
        }
    }
    fn err(message: impl Into<String>) -> Self {
        Self {
            ok: false,
            message: message.into(),
            data: None,
        }
    }
    fn with_data(mut self, data: serde_json::Value) -> Self {
        self.data = Some(data);
        self
    }
}

/// Open a desktop application by name. Resolves the binary via `which` and
/// spawns it cross-platform. On Windows also tries `cmd /c start` so that
/// shell-resolvable names like "Brave" or "Spotify" launch correctly.
#[tauri::command]
pub async fn open_app(name: String) -> CommandResult {
    // First try resolving a binary
    if let Ok(path) = which::which(&name) {
        match std::process::Command::new(path).spawn() {
            Ok(_) => return CommandResult::ok(format!("Launched {}", name)),
            Err(e) => return CommandResult::err(format!("Failed to launch: {}", e)),
        }
    }
    // Fallback: use OS shell to launch by display name
    let result = launch_by_name(&name);
    match result {
        Ok(_) => CommandResult::ok(format!("Launched {}", name)),
        Err(e) => CommandResult::err(format!("Could not find '{}': {}", name, e)),
    }
}

#[cfg(target_os = "windows")]
fn launch_by_name(name: &str) -> std::io::Result<()> {
    std::process::Command::new("cmd")
        .args(["/C", "start", "", name])
        .spawn()
        .map(|_| ())
}

#[cfg(target_os = "macos")]
fn launch_by_name(name: &str) -> std::io::Result<()> {
    std::process::Command::new("open")
        .args(["-a", name])
        .spawn()
        .map(|_| ())
}

#[cfg(target_os = "linux")]
fn launch_by_name(name: &str) -> std::io::Result<()> {
    // Try common launchers; if they fail, the user gets a clear message
    for launcher in ["gtk-launch", "gio", "xdg-open"] {
        if which::which(launcher).is_ok() {
            let res = std::process::Command::new(launcher)
                .arg(name)
                .spawn();
            if res.is_ok() {
                return Ok(());
            }
        }
    }
    Err(std::io::Error::new(
        std::io::ErrorKind::NotFound,
        format!("No app launcher found or '{}' is not installed", name),
    ))
}

#[tauri::command]
pub async fn open_url(app: tauri::AppHandle, url: String) -> CommandResult {
    use tauri_plugin_opener::OpenerExt;
    match app.opener().open_url(url.clone(), None::<&str>) {
        Ok(_) => CommandResult::ok(format!("Opened {}", url)),
        Err(e) => CommandResult::err(format!("Failed to open: {}", e)),
    }
}

#[tauri::command]
pub async fn set_volume(level: u8) -> CommandResult {
    let level = level.min(100);
    #[cfg(target_os = "linux")]
    {
        // amixer / pactl
        if which::which("pactl").is_ok() {
            let _v = (level as f32 * 655.35) as u32;
            let _ = std::process::Command::new("pactl")
                .args(["set-sink-volume", "@DEFAULT_SINK@", &format!("{}%", level)])
                .spawn();
            return CommandResult::ok(format!("Volume set to {}%", level));
        }
        if which::which("amixer").is_ok() {
            let _ = std::process::Command::new("amixer")
                .args(["set", "Master", &format!("{}%", level)])
                .spawn();
            return CommandResult::ok(format!("Volume set to {}%", level));
        }
    }
    #[cfg(target_os = "macos")]
    {
        let _ = std::process::Command::new("osascript")
            .args(["-e", &format!("set volume output volume {}", level)])
            .spawn();
        return CommandResult::ok(format!("Volume set to {}%", level));
    }
    #[cfg(target_os = "windows")]
    {
        // PowerShell COM
        let script = format!(
            "$obj = New-Object -ComObject WScript.Shell; 1 | Out-Null; (Get-AudioDevice).Volume = {}",
            level as f32 / 100.0
        );
        let _ = std::process::Command::new("powershell")
            .args(["-Command", &script])
            .spawn();
        return CommandResult::ok(format!("Volume set to {}%", level));
    }
    #[allow(unreachable_code)]
    CommandResult::err("Volume control not supported on this OS")
}

#[tauri::command]
pub async fn notify(title: String, body: String) -> CommandResult {
    match notify_rust::Notification::new()
        .summary(&title)
        .body(&body)
        .show()
    {
        Ok(_) => CommandResult::ok("Notification shown"),
        Err(e) => CommandResult::err(format!("Notification failed: {}", e)),
    }
}

#[tauri::command]
pub async fn shutdown() -> CommandResult {
    #[cfg(target_os = "linux")]
    {
        let _ = std::process::Command::new("shutdown").arg("-h").arg("now").spawn();
    }
    #[cfg(target_os = "macos")]
    {
        let _ = std::process::Command::new("osascript")
            .args(["-e", "tell application \"System Events\" to shut down"])
            .spawn();
    }
    #[cfg(target_os = "windows")]
    {
        let _ = std::process::Command::new("shutdown")
            .args(["/s", "/t", "0"])
            .spawn();
    }
    CommandResult::ok("Shutdown initiated")
}

#[tauri::command]
pub async fn lock() -> CommandResult {
    #[cfg(target_os = "linux")]
    {
        for c in ["loginctl", "xdg-screensaver", "gnome-screensaver-command", "dm-tool"] {
            if which::which(c).is_ok() {
                let arg = match c {
                    "loginctl" => "lock-session",
                    "xdg-screensaver" => "lock",
                    "gnome-screensaver-command" => "-l",
                    "dm-tool" => "lock",
                    _ => "lock",
                };
                let _ = std::process::Command::new(c).arg(arg).spawn();
                return CommandResult::ok("Locked");
            }
        }
    }
    #[cfg(target_os = "macos")]
    {
        let _ = std::process::Command::new("pmset")
            .args(["displaysleepnow"])
            .spawn();
        return CommandResult::ok("Screen locked");
    }
    #[cfg(target_os = "windows")]
    {
        let _ = std::process::Command::new("rundll32.exe")
            .args(["user32.dll,LockWorkStation"])
            .spawn();
        return CommandResult::ok("Locked");
    }
    #[allow(unreachable_code)]
    CommandResult::err("Lock not supported on this OS")
}

#[tauri::command]
pub async fn system_info() -> CommandResult {
    use sysinfo::System;
    let sys = System::new();
    let info = serde_json::json!({
        "os": std::env::consts::OS,
        "arch": std::env::consts::ARCH,
        "hostname": System::host_name(),
        "cpus": sys.cpus().len(),
        "uptime_secs": System::uptime(),
    });
    CommandResult::ok("OK").with_data(info)
}

/// Copy text to the system clipboard.
#[tauri::command]
pub async fn clipboard_write(text: String) -> CommandResult {
    match arboard::Clipboard::new() {
        Ok(mut cb) => match cb.set_text(text) {
            Ok(_) => CommandResult::ok("Copied to clipboard"),
            Err(e) => CommandResult::err(format!("Clipboard write failed: {}", e)),
        },
        Err(e) => CommandResult::err(format!("Clipboard init failed: {}", e)),
    }
}

/// Read the system clipboard (text only).
#[tauri::command]
pub async fn clipboard_read() -> CommandResult {
    match arboard::Clipboard::new() {
        Ok(mut cb) => match cb.get_text() {
            Ok(text) => CommandResult::ok("OK").with_data(serde_json::json!({ "text": text })),
            Err(e) => CommandResult::err(format!("Clipboard read failed: {}", e)),
        },
        Err(e) => CommandResult::err(format!("Clipboard init failed: {}", e)),
    }
}

/// Open a folder in the OS file manager.
#[tauri::command]
pub async fn open_folder(app: tauri::AppHandle, path: String) -> CommandResult {
    use tauri_plugin_opener::OpenerExt;
    match app.opener().open_path(path.clone(), None::<&str>) {
        Ok(_) => CommandResult::ok(format!("Opened {}", path)),
        Err(e) => CommandResult::err(format!("Failed: {}", e)),
    }
}

/// Type text into the currently focused window (best-effort, desktop only).
/// On Linux uses `xdotool`; on macOS uses `osascript` keystroke; on Windows
/// uses PowerShell SendKeys.
#[tauri::command]
pub async fn type_text(text: String) -> CommandResult {
    #[cfg(target_os = "linux")]
    {
        if which::which("xdotool").is_ok() {
            let r = std::process::Command::new("xdotool")
                .args(["type", "--", &text])
                .spawn();
            return match r {
                Ok(_) => CommandResult::ok("Typed text"),
                Err(e) => CommandResult::err(format!("xdotool failed: {}", e)),
            };
        }
        return CommandResult::err("xdotool not installed");
    }
    #[cfg(target_os = "macos")]
    {
        let r = std::process::Command::new("osascript")
            .args(["-e", &format!("tell application \"System Events\" to keystroke \"{}\"", text.replace('"', "\\\""))])
            .spawn();
        return match r {
            Ok(_) => CommandResult::ok("Typed text"),
            Err(e) => CommandResult::err(format!("osascript failed: {}", e)),
        };
    }
    #[cfg(target_os = "windows")]
    {
        // SendKeys-style invocation
        let script = format!(
            "$w = New-Object -ComObject WScript.Shell; $w.AppActivate((Get-Process | Where-Object {{$_.MainWindowTitle}} | Select-Object -First 1).Id); Start-Sleep -Milliseconds 150; $w.SendKeys([System.Web.HttpUtility]::HtmlDecode(\"{}\"))",
            text.replace('"', "`\"")
        );
        let r = std::process::Command::new("powershell")
            .args(["-Command", &script])
            .spawn();
        return match r {
            Ok(_) => CommandResult::ok("Typed text"),
            Err(e) => CommandResult::err(format!("SendKeys failed: {}", e)),
        };
    }
    #[allow(unreachable_code)]
    CommandResult::err("type_text not supported on this OS")
}

/// Execute a shell command and return stdout + stderr.
/// This is the main desktop-control power tool — lets MIRA run arbitrary commands.
#[tauri::command]
pub async fn run_command(command: String) -> CommandResult {
    #[cfg(target_os = "windows")]
    let output = std::process::Command::new("cmd")
        .args(["/C", &command])
        .output();
    #[cfg(not(target_os = "windows"))]
    let output = std::process::Command::new("sh")
        .args(["-c", &command])
        .output();

    match output {
        Ok(out) => {
            let stdout = String::from_utf8_lossy(&out.stdout).to_string();
            let stderr = String::from_utf8_lossy(&out.stderr).to_string();
            let combined = if stderr.is_empty() { stdout.clone() } else { format!("{}{}", stdout, stderr) };
            if out.status.success() {
                CommandResult::ok(combined.trim().to_string())
                    .with_data(serde_json::json!({ "stdout": stdout, "stderr": stderr, "exit_code": 0 }))
            } else {
                let code = out.status.code().unwrap_or(-1);
                CommandResult {
                    ok: false,
                    message: combined.trim().to_string(),
                    data: Some(serde_json::json!({ "stdout": stdout, "stderr": stderr, "exit_code": code })),
                }
            }
        }
        Err(e) => CommandResult::err(format!("Command failed to start: {}", e)),
    }
}

/// List the top N running user-facing processes (best-effort, no admin needed).
#[tauri::command]
pub async fn list_running_apps(limit: Option<usize>) -> CommandResult {
    let limit = limit.unwrap_or(15);
    #[cfg(target_os = "linux")]
    {
        let r = std::process::Command::new("ps")
            .args(["-eo", "comm=", "--sort=-pcpu"])
            .output();
        return match r {
            Ok(out) => {
                let s = String::from_utf8_lossy(&out.stdout);
                let list: Vec<String> = s
                    .lines()
                    .filter(|l| !l.trim().is_empty())
                    .map(|l| l.trim().to_string())
                    .take(limit)
                    .collect();
                CommandResult::ok("OK").with_data(serde_json::json!({ "apps": list }))
            }
            Err(e) => CommandResult::err(format!("ps failed: {}", e)),
        };
    }
    #[cfg(target_os = "macos")]
    {
        let r = std::process::Command::new("ps")
            .args(["-axco", "comm"])
            .output();
        return match r {
            Ok(out) => {
                let s = String::from_utf8_lossy(&out.stdout);
                let list: Vec<String> = s
                    .lines()
                    .filter(|l| !l.trim().is_empty())
                    .map(|l| l.trim().to_string())
                    .take(limit)
                    .collect();
                CommandResult::ok("OK").with_data(serde_json::json!({ "apps": list }))
            }
            Err(e) => CommandResult::err(format!("ps failed: {}", e)),
        };
    }
    #[cfg(target_os = "windows")]
    {
        let r = std::process::Command::new("powershell")
            .args(["-Command", "Get-Process | Where-Object {$_.MainWindowTitle} | Select-Object -First 15 ProcessName"])
            .output();
        return match r {
            Ok(out) => {
                let s = String::from_utf8_lossy(&out.stdout);
                let list: Vec<String> = s
                    .lines()
                    .filter(|l| !l.trim().is_empty() && !l.contains("----"))
                    .map(|l| l.trim().to_string())
                    .take(limit)
                    .collect();
                CommandResult::ok("OK").with_data(serde_json::json!({ "apps": list }))
            }
            Err(e) => CommandResult::err(format!("Get-Process failed: {}", e)),
        };
    }
    #[allow(unreachable_code)]
    CommandResult::err("list_running_apps not supported on this OS")
}
