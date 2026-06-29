#!/usr/bin/env python3
"""
GOAT Royalty App - Portable HTTP Server
Serves the application on localhost:3333
"""

import http.server
import socketserver
import json
import os
import sys
from pathlib import Path
from urllib.parse import parse_qs, urlparse
import mimetypes

# Configuration
PORT = 3333
HOST = 'localhost'

# Get the directory where this script is located
SCRIPT_DIR = Path(__file__).parent.absolute()
DATA_DIR = SCRIPT_DIR / 'data'
CHAT_DATA_DIR = SCRIPT_DIR / 'chat_data'

# Ensure chat data directory exists
CHAT_DATA_DIR.mkdir(exist_ok=True)

class GOATHandler(http.server.SimpleHTTPRequestHandler):
    """Custom handler for GOAT Royalty App"""
    
    def __init__(self, *args, **kwargs):
        super().__init__(*args, directory=str(SCRIPT_DIR), **kwargs)
    
    def do_GET(self):
        """Handle GET requests"""
        parsed = urlparse(self.path)
        
        # API endpoints
        if parsed.path == '/api/catalog':
            self.handle_catalog_api(parsed)
        elif parsed.path == '/api/stats':
            self.handle_stats_api()
        elif parsed.path == '/api/chat-history':
            self.handle_chat_history()
        else:
            # Serve static files
            super().do_GET()
    
    def do_POST(self):
        """Handle POST requests"""
        parsed = urlparse(self.path)
        
        if parsed.path == '/api/chat':
            self.handle_chat_post()
        elif parsed.path == '/api/save-chat':
            self.handle_save_chat()
        else:
            self.send_error(404, "Not Found")
    
    def handle_catalog_api(self, parsed):
        """Return catalog data"""
        query = parse_qs(parsed.query)
        search = query.get('q', [''])[0].lower()
        
        try:
            # Load catalog data
            catalog_file = DATA_DIR / 'artist-catalog.json'
            if catalog_file.exists():
                with open(catalog_file, 'r') as f:
                    data = json.load(f)
                
                # Search if query provided
                if search:
                    filtered = []
                    for item in data:
                        if isinstance(item, dict):
                            text = json.dumps(item).lower()
                            if search in text:
                                filtered.append(item)
                    data = filtered[:100]  # Limit results
                
                self.send_json(data)
            else:
                self.send_json({'error': 'Catalog not found'}, 404)
        except Exception as e:
            self.send_json({'error': str(e)}, 500)
    
    def handle_stats_api(self):
        """Return catalog statistics"""
        try:
            stats = {
                'total_entries': 5954,
                'artists': ['Waka Flocka Flame', 'Fastassman Publishing', 'Harvey Miller'],
                'catalogs': [
                    {'name': 'Waka Flocka Catalog', 'entries': 2847},
                    {'name': 'Fastassman Publishing', 'entries': 1892},
                    {'name': 'Harvey Miller Works', 'entries': 1215}
                ],
                'last_updated': '2024-04-18',
                'version': '2.0.0'
            }
            self.send_json(stats)
        except Exception as e:
            self.send_json({'error': str(e)}, 500)
    
    def handle_chat_history(self):
        """Return chat history"""
        try:
            history_file = CHAT_DATA_DIR / 'history.json'
            if history_file.exists():
                with open(history_file, 'r') as f:
                    history = json.load(f)
            else:
                history = []
            self.send_json(history)
        except Exception as e:
            self.send_json({'error': str(e)}, 500)
    
    def handle_chat_post(self):
        """Handle chat message"""
        try:
            content_length = int(self.headers.get('Content-Length', 0))
            body = self.rfile.read(content_length)
            data = json.loads(body)
            
            message = data.get('message', '')
            # In demo mode, return a simulated response
            response = self.generate_response(message)
            
            self.send_json({'response': response})
        except Exception as e:
            self.send_json({'error': str(e)}, 500)
    
    def handle_save_chat(self):
        """Save chat to history"""
        try:
            content_length = int(self.headers.get('Content-Length', 0))
            body = self.rfile.read(content_length)
            data = json.loads(body)
            
            history_file = CHAT_DATA_DIR / 'history.json'
            
            # Load existing history
            if history_file.exists():
                with open(history_file, 'r') as f:
                    history = json.load(f)
            else:
                history = []
            
            # Add new entry
            history.append({
                'timestamp': data.get('timestamp'),
                'user': data.get('user'),
                'assistant': data.get('assistant')
            })
            
            # Keep only last 100 conversations
            history = history[-100:]
            
            with open(history_file, 'w') as f:
                json.dump(history, f, indent=2)
            
            self.send_json({'success': True})
        except Exception as e:
            self.send_json({'error': str(e)}, 500)
    
    def generate_response(self, message):
        """Generate AI response (demo mode)"""
        msg_lower = message.lower()
        
        if 'waka' in msg_lower:
            return "I found 2,847 entries for Waka Flocka Flame in the catalog. This includes his complete discography with tracks like 'No Hands', 'Hard in da Paint', 'Grove St. Party', and many more. Would you like me to show specific ISRC codes or royalty splits?"
        elif 'catalog' in msg_lower or 'search' in msg_lower:
            return "I can search through 5,954 catalog entries including works from Waka Flocka Flame, Fastassman Publishing, and Harvey Miller. What specific song, artist, or ISRC code are you looking for?"
        elif 'royalty' in msg_lower or 'split' in msg_lower:
            return "The royalty calculator can help you determine splits. I have access to publishing data for multiple catalogs. Which artist's royalty information would you like to calculate?"
        elif 'hello' in msg_lower or 'hi' in msg_lower:
            return "Hello! I'm your GOAT Royalty AI Assistant. I have access to 5,954 catalog entries and can help you search songs, check ISRC codes, calculate royalties, and manage your music catalog. What would you like to know?"
        else:
            return f"I understand you're asking about '{message}'. I can help you search the catalog, check artist information, or calculate royalties. Try asking about specific artists like Waka Flocka Flame or use voice control by clicking the microphone button."
    
    def send_json(self, data, status=200):
        """Send JSON response"""
        self.send_response(status)
        self.send_header('Content-Type', 'application/json')
        self.send_header('Access-Control-Allow-Origin', '*')
        self.end_headers()
        self.wfile.write(json.dumps(data).encode())
    
    def log_message(self, format, *args):
        """Custom logging"""
        print(f"[GOAT] {args[0]}")


def main():
    """Start the server"""
    print(f"""
╔══════════════════════════════════════════════════════════════╗
║     🐐 GOAT ROYALTY APP - USB EDITION 🐐                     ║
║              Portable HTTP Server                            ║
╚══════════════════════════════════════════════════════════════╝

Serving on: http://{HOST}:{PORT}
Catalog entries: 5,954+

Press Ctrl+C to stop the server.
""")
    
    with socketserver.TCPServer((HOST, PORT), GOATHandler) as httpd:
        try:
            httpd.serve_forever()
        except KeyboardInterrupt:
            print("\n[GOAT] Server stopped.")


if __name__ == '__main__':
    main()