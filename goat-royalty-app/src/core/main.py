"""
GOAT Royalty App - Main Entry Point
===================================
Standalone desktop application entry.
No login required - all tools ready to use.
"""

import sys
import os
import asyncio
import threading
import webbrowser
from pathlib import Path

# Add parent directory to path
sys.path.insert(0, str(Path(__file__).parent.parent.parent))

# Qt imports for GUI
try:
    from PyQt5.QtWidgets import (
        QApplication, QMainWindow, QWidget, QVBoxLayout, 
        QHBoxLayout, QPushButton, QLabel, QSystemTrayIcon,
        QMenu, QAction, QMessageBox
    )
    from PyQt5.QtCore import Qt, QThread, pyqtSignal, QSize
    from PyQt5.QtGui import QIcon, QFont, QPixmap
    from PyQt5.QtWebEngineWidgets import QWebEngineView, QWebEngineProfile
    QT_AVAILABLE = True
except ImportError:
    QT_AVAILABLE = False
    print("PyQt5 not available. Running in headless mode.")

# Import app
from core.app import app as fastapi_app
import uvicorn


class ServerThread(QThread):
    """Thread to run FastAPI server"""
    started_signal = pyqtSignal(int)
    
    def __init__(self, port=8000):
        super().__init__()
        self.port = port
    
    def run(self):
        """Run the FastAPI server"""
        config = uvicorn.Config(
            fastapi_app,
            host="127.0.0.1",
            port=self.port,
            log_level="error"
        )
        server = uvicorn.Server(config)
        self.started_signal.emit(self.port)
        asyncio.run(server.serve())


class GOATWindow(QMainWindow):
    """Main GOAT Application Window"""
    
    def __init__(self):
        super().__init__()
        
        self.setWindowTitle("GOAT - All-in-One AI App")
        self.setMinimumSize(1400, 900)
        self.resize(1600, 1000)
        
        # Set window icon
        icon_path = Path(__file__).parent.parent.parent / "assets" / "goat.ico"
        if icon_path.exists():
            self.setWindowIcon(QIcon(str(icon_path)))
        
        # Create central widget
        central_widget = QWidget()
        self.setCentralWidget(central_widget)
        layout = QVBoxLayout(central_widget)
        layout.setContentsMargins(0, 0, 0, 0)
        
        # Create web view
        self.web_view = QWebEngineView()
        
        # Enable local storage and other features
        profile = QWebEngineProfile.defaultProfile()
        profile.setPersistentCookiesPolicy(QWebEngineProfile.AllowPersistentCookies)
        
        # Load the frontend
        self.load_frontend()
        
        layout.addWidget(self.web_view)
        
        # Create system tray icon
        self.create_tray_icon()
        
        # Start server
        self.server_thread = ServerThread(port=8000)
        self.server_thread.started_signal.connect(self.on_server_started)
        self.server_thread.start()
    
    def load_frontend(self):
        """Load the frontend HTML"""
        frontend_path = Path(__file__).parent.parent / "frontend" / "index.html"
        if frontend_path.exists():
            self.web_view.setUrl(f"file://{frontend_path}")
        else:
            # Fallback to embedded HTML
            self.web_view.setHtml(self.get_embedded_html())
    
    def on_server_started(self, port):
        """Called when server starts"""
        print(f"Server started on port {port}")
        # Refresh the web view to connect to the API
        self.web_view.page().runJavaScript(f"window.API_URL = 'http://127.0.0.1:{port}';")
    
    def create_tray_icon(self):
        """Create system tray icon"""
        icon_path = Path(__file__).parent.parent.parent / "assets" / "goat.ico"
        
        if icon_path.exists():
            tray_icon = QSystemTrayIcon(QIcon(str(icon_path)), self)
        else:
            tray_icon = QSystemTrayIcon(self)
        
        tray_menu = QMenu()
        
        show_action = QAction("Show GOAT", self)
        show_action.triggered.connect(self.show)
        tray_menu.addAction(show_action)
        
        hide_action = QAction("Hide", self)
        hide_action.triggered.connect(self.hide)
        tray_menu.addAction(hide_action)
        
        tray_menu.addSeparator()
        
        quit_action = QAction("Quit", self)
        quit_action.triggered.connect(self.close)
        tray_menu.addAction(quit_action)
        
        tray_icon.setContextMenu(tray_menu)
        tray_icon.setToolTip("GOAT - All-in-One AI App")
        tray_icon.show()
        
        self.tray_icon = tray_icon
    
    def closeEvent(self, event):
        """Handle close event"""
        reply = QMessageBox.question(
            self, 
            "GOAT",
            "Are you sure you want to quit GOAT?",
            QMessageBox.Yes | QMessageBox.No,
            QMessageBox.No
        )
        
        if reply == QMessageBox.Yes:
            # Stop the server
            if self.server_thread:
                self.server_thread.terminate()
            event.accept()
        else:
            event.ignore()
    
    def get_embedded_html(self):
        """Return embedded HTML if frontend file not found"""
        return """
        <!DOCTYPE html>
        <html>
        <head>
            <title>GOAT</title>
            <style>
                body { 
                    font-family: 'Inter', sans-serif; 
                    background: linear-gradient(135deg, #1a1a2e 0%, #16213e 50%, #0f0f23 100%);
                    color: white;
                    display: flex;
                    justify-content: center;
                    align-items: center;
                    height: 100vh;
                    margin: 0;
                }
                .container { text-align: center; }
                .logo { font-size: 80px; }
                h1 { font-size: 48px; margin: 20px 0; }
                p { color: #a1a1aa; }
                .tagline { 
                    font-style: italic; 
                    color: #a855f7;
                    font-size: 18px;
                    margin-top: 30px;
                }
            </style>
        </head>
        <body>
            <div class="container">
                <div class="logo">🐐</div>
                <h1>GOAT</h1>
                <p>All-in-One AI-Powered Royalty App</p>
                <p class="tagline">"IF YOU CAN THINK IT! You CAN DO IT IN THE APP"</p>
                <p style="margin-top: 40px; color: #666;">Loading...</p>
            </div>
        </body>
        </html>
        """


def run_headless():
    """Run in headless mode (no GUI)"""
    print("🐐 GOAT - Running in headless mode")
    print("=" * 50)
    print("Server starting on http://127.0.0.1:8000")
    print("API docs available at http://127.0.0.1:8000/docs")
    print("=" * 50)
    
    uvicorn.run(
        fastapi_app,
        host="0.0.0.0",
        port=8000,
        log_level="info"
    )


def main():
    """Main entry point"""
    print("""
    ╔════════════════════════════════════════════════════════════╗
    ║                                                            ║
    ║     ██████╗  ██████╗ ███████╗     ██████╗ ██████╗  ██████╗ ║
    ║    ██╔════╝ ██╔═══██╗██╔════╝    ██╔════╝ ██╔══██╗██╔═══██╗║
    ║    ██║      ██║   ██║█████╗      ██║      ██████╔╝██║   ██║║
    ║    ██║      ██║   ██║██╔══╝      ██║      ██╔═══╝ ██║   ██║║
    ║    ╚██████╗ ╚██████╔╝███████╗    ╚██████╗ ██║     ╚██████╔╝║
    ║     ╚═════╝  ╚═════╝ ╚══════╝     ╚═════╝ ╚═╝      ╚═════╝ ║
    ║                                                            ║
    ║        All-in-One AI-Powered Royalty App                   ║
    ║        "IF YOU CAN THINK IT! You CAN DO IT IN THE APP"     ║
    ║                                                            ║
    ╚════════════════════════════════════════════════════════════╝
    """)
    
    if QT_AVAILABLE:
        # Run with GUI
        app = QApplication(sys.argv)
        app.setApplicationName("GOAT")
        app.setApplicationVersion("1.0.0")
        
        # Set style
        app.setStyle("Fusion")
        
        # Create and show window
        window = GOATWindow()
        window.show()
        
        # Open browser as fallback
        webbrowser.open("http://127.0.0.1:8000")
        
        sys.exit(app.exec_())
    else:
        # Run headless
        run_headless()


if __name__ == "__main__":
    main()