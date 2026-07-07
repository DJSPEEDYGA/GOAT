//! GOAT Royalty App - Tauri Backend
//! Lightweight Rust-based desktop application

#![cfg_attr(not(debug_assertions), windows_subsystem = "windows")]

use tauri::Manager;
use serde::{Deserialize, Serialize};
use std::sync::Mutex;

/// App state for managing global data
struct AppState {
    theme: Mutex<String>,
    user_preferences: Mutex<UserPreferences>,
}

/// User preferences stored locally
#[derive(Debug, Serialize, Deserialize, Default)]
struct UserPreferences {
    notifications_enabled: bool,
    auto_update: bool,
    analytics_enabled: bool,
    theme: String,
}

/// GOAT Tool definition
#[derive(Debug, Serialize, Deserialize)]
struct GoatTool {
    name: String,
    url: String,
    icon: String,
}

/// All available GOAT tools
fn get_goat_tools() -> Vec<GoatTool> {
    vec![
        GoatTool { name: "Fashion Hub".into(), url: "goat-fashion-hub.html".into(), icon: "👗".into() },
        GoatTool { name: "3D Studio".into(), url: "goat-3d-studio.html".into(), icon: "🎬".into() },
        GoatTool { name: "Celebrity Lounge".into(), url: "goat-celebrity-lounge.html".into(), icon: "⭐".into() },
        GoatTool { name: "Entertainment".into(), url: "goat-entertainment.html".into(), icon: "🎭".into() },
        GoatTool { name: "NFT Studio".into(), url: "goat-nft-studio.html".into(), icon: "🖼️".into() },
        GoatTool { name: "Fitness Pro".into(), url: "goat-fitness.html".into(), icon: "💪".into() },
        GoatTool { name: "Health Dashboard".into(), url: "goat-health.html".into(), icon: "❤️".into() },
        GoatTool { name: "Properties".into(), url: "goat-properties.html".into(), icon: "🏠".into() },
        GoatTool { name: "Studio Locator".into(), url: "goat-studio-locator.html".into(), icon: "📍".into() },
        GoatTool { name: "Video Editor".into(), url: "goat-video-enhanced.html".into(), icon: "🎥".into() },
        GoatTool { name: "3D Effects".into(), url: "goat-3d-effects.html".into(), icon: "✨".into() },
        GoatTool { name: "AI Video".into(), url: "goat-ai-video.html".into(), icon: "🤖".into() },
        GoatTool { name: "Social Scheduler".into(), url: "goat-social-scheduler.html".into(), icon: "📱".into() },
        GoatTool { name: "Brand Deals".into(), url: "goat-brand-deals.html".into(), icon: "💼".into() },
        GoatTool { name: "Tour Manager".into(), url: "goat-tour-manager.html".into(), icon: "🎤".into() },
        GoatTool { name: "Analytics".into(), url: "goat-analytics.html".into(), icon: "📊".into() },
        GoatTool { name: "Merch Store".into(), url: "goat-merch-store.html".into(), icon: "🛒".into() },
    ]
}

/// Tauri commands
#[tauri::command]
fn get_tools() -> Vec<GoatTool> {
    get_goat_tools()
}

#[tauri::command]
fn get_app_version() -> String {
    env!("CARGO_PKG_VERSION").to_string()
}

#[tauri::command]
fn get_platform() -> String {
    std::env::consts::OS.to_string()
}

#[tauri::command]
fn get_user_preferences(state: tauri::State<'_, AppState>) -> UserPreferences {
    state.user_preferences.lock().unwrap().clone()
}

#[tauri::command]
fn set_user_preferences(
    preferences: UserPreferences,
    state: tauri::State<'_, AppState>,
) -> Result<(), String> {
    let mut prefs = state.user_preferences.lock().unwrap();
    *prefs = preferences;
    Ok(())
}

#[tauri::command]
fn set_theme(theme: String, state: tauri::State<'_, AppState>) -> Result<(), String> {
    let mut current_theme = state.theme.lock().unwrap();
    *current_theme = theme.clone();
    Ok(())
}

#[tauri::command]
fn get_theme(state: tauri::State<'_, AppState>) -> String {
    state.theme.lock().unwrap().clone()
}

fn main() {
    // Initialize app state
    let state = AppState {
        theme: Mutex::new("dark".to_string()),
        user_preferences: Mutex::new(UserPreferences::default()),
    };

    // Build Tauri application
    tauri::Builder::default()
        .manage(state)
        .setup(|app| {
            // Get main window
            let window = app.get_window("main").unwrap();
            
            // Set up system tray if available
            #[cfg(target_os = "macos")]
            {
                use tauri::SystemTray;
                // Tray setup handled in config
            }
            
            // Log startup
            println!("GOAT Royalty App v{} starting...", env!("CARGO_PKG_VERSION"));
            println!("Platform: {}", std::env::consts::OS);
            
            Ok(())
        })
        .invoke_handler(tauri::generate_handler![
            get_tools,
            get_app_version,
            get_platform,
            get_user_preferences,
            set_user_preferences,
            set_theme,
            get_theme,
        ])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}