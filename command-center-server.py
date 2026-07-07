#!/usr/bin/env python3
"""
GOAT Force Command Center Server
Backend API for controlling GOAT Force applications
"""

import subprocess
import psutil
import json
import os
from flask import Flask, jsonify, request
from flask_cors import CORS
import time

app = Flask(__name__)
CORS(app)

# GOAT Force applications configuration
GOAT_APPS = {
    'leadership': [
        'THE GOAT — SUPREME COMMANDER',
        'THE GOAT — GOAT Force Supreme Commander',
        'THE GOAT',
        'Ms. Money Penny — BOSS LADY',
        'Ms. Money Penny',
        'Ms Money Penny — 🐐👑 The GOAT Royalty Store by Life Imitates Art Inc..'
    ],
    'core': [
        'Dr. Devin — WHAT\'S UP DOC',
        'Dr. Devin — GOAT Force AI',
        'Dr. Devin',
        'Sir Codex — SENTINEL',
        'Sir Codex',
        'Nexus — ORACLE',
        'Nexus',
        'Lexi — THE SPARK',
        'Lexi',
        'Ms. Vanessa — ICON',
        'Master Oscar — DEALMAKER',
        'Master Oscar'
    ],
    'specialized': [
        'GONBRAZY — STUDIO BOSS',
        'Wooh Da Kid — TONY STARKS',
        'Hannah Miller — AMIGO KEEPER'
    ],
    'utilities': [
        'GOAT Force Command Hub',
        'GOAT Royalty App',
        'Ms Money Penny — AI Tools & Runtimes'
    ]
}

def is_app_running(app_name):
    """Check if a GOAT Force app is running"""
    try:
        for proc in psutil.process_iter(['pid', 'name', 'cmdline']):
            try:
                if proc.info['cmdline']:
                    cmdline = ' '.join(proc.info['cmdline'])
                    if app_name in cmdline and '.app' in cmdline:
                        return True
            except (psutil.NoSuchProcess, psutil.AccessDenied, psutil.ZombieProcess):
                continue
        return False
    except Exception as e:
        print(f"Error checking app status: {e}")
        return False

def get_running_apps():
    """Get list of all running GOAT Force apps"""
    running_apps = []
    try:
        for proc in psutil.process_iter(['pid', 'name', 'cmdline']):
            try:
                if proc.info['cmdline']:
                    cmdline = ' '.join(proc.info['cmdline'])
                    if '.app' in cmdline and any(app in cmdline for apps in GOAT_APPS.values() for app in apps):
                        # Extract app name from cmdline
                        for app in [app for apps in GOAT_APPS.values() for app in apps]:
                            if app in cmdline:
                                running_apps.append(app)
                                break
            except (psutil.NoSuchProcess, psutil.AccessDenied, psutil.ZombieProcess):
                continue
    except Exception as e:
        print(f"Error getting running apps: {e}")
    
    return list(set(running_apps))  # Remove duplicates

def start_app(app_path):
    """Start a GOAT Force application"""
    try:
        if os.path.exists(app_path):
            subprocess.Popen(['open', app_path])
            return True, f"Started {app_path}"
        else:
            return False, f"App not found: {app_path}"
    except Exception as e:
        return False, f"Error starting app: {str(e)}"

def stop_app(app_name):
    """Stop a GOAT Force application"""
    try:
        killed = False
        for proc in psutil.process_iter(['pid', 'name', 'cmdline']):
            try:
                if proc.info['cmdline']:
                    cmdline = ' '.join(proc.info['cmdline'])
                    if app_name in cmdline and '.app' in cmdline:
                        proc.terminate()
                        killed = True
            except (psutil.NoSuchProcess, psutil.AccessDenied, psutil.ZombieProcess):
                continue
        
        if killed:
            return True, f"Stopped {app_name}"
        else:
            return False, f"App not running: {app_name}"
    except Exception as e:
        return False, f"Error stopping app: {str(e)}"

@app.route('/api/status', methods=['GET'])
def get_status():
    """Get status of all GOAT Force applications"""
    running_apps = get_running_apps()
    status = {}
    
    for category, apps in GOAT_APPS.items():
        status[category] = {}
        for app in apps:
            status[category][app] = {
                'running': app in running_apps,
                'path': f"/Applications/{app}.app"
            }
    
    return jsonify(status)

@app.route('/api/start-app', methods=['POST'])
def start_application():
    """Start a specific application"""
    data = request.json
    app_path = data.get('path')
    
    if not app_path:
        return jsonify({'success': False, 'message': 'App path required'}), 400
    
    success, message = start_app(app_path)
    return jsonify({'success': success, 'message': message})

@app.route('/api/stop-app', methods=['POST'])
def stop_application():
    """Stop a specific application"""
    data = request.json
    app_name = data.get('name')
    
    if not app_name:
        return jsonify({'success': False, 'message': 'App name required'}), 400
    
    success, message = stop_app(app_name)
    return jsonify({'success': success, 'message': message})

@app.route('/api/start-all', methods=['POST'])
def start_all_apps():
    """Start all GOAT Force applications"""
    results = []
    all_apps = [app for apps in GOAT_APPS.values() for app in apps]
    
    for app in all_apps:
        app_path = f"/Applications/{app}.app"
        success, message = start_app(app_path)
        results.append({'app': app, 'success': success, 'message': message})
        time.sleep(0.5)  # Brief delay between launches
    
    return jsonify({'results': results})

@app.route('/api/stop-all', methods=['POST'])
def stop_all_apps():
    """Stop all GOAT Force applications"""
    results = []
    running_apps = get_running_apps()
    
    for app in running_apps:
        success, message = stop_app(app)
        results.append({'app': app, 'success': success, 'message': message})
        time.sleep(0.5)  # Brief delay between stops
    
    return jsonify({'results': results})

@app.route('/api/system-stats', methods=['GET'])
def get_system_stats():
    """Get system statistics"""
    try:
        cpu_percent = psutil.cpu_percent(interval=1)
        memory = psutil.virtual_memory()
        disk = psutil.disk_usage('/')
        
        running_apps = get_running_apps()
        total_apps = len([app for apps in GOAT_APPS.values() for app in apps])
        
        return jsonify({
            'cpu_percent': cpu_percent,
            'memory_percent': memory.percent,
            'memory_used': f"{memory.used / (1024**3):.1f} GB",
            'memory_total': f"{memory.total / (1024**3):.1f} GB",
            'disk_percent': disk.percent,
            'disk_used': f"{disk.used / (1024**3):.1f} GB",
            'disk_total': f"{disk.total / (1024**3):.1f} GB",
            'running_apps': len(running_apps),
            'total_apps': total_apps,
            'stopped_apps': total_apps - len(running_apps)
        })
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/api/intel-status', methods=['GET'])
def get_intel_status():
    """Check Intel Server status"""
    try:
        import requests
        response = requests.get('http://localhost:5500/health', timeout=5)
        if response.status_code == 200:
            return jsonify({'online': True, 'data': response.json()})
        else:
            return jsonify({'online': False})
    except:
        return jsonify({'online': False})

@app.route('/api/ollama-status', methods=['GET'])
def get_ollama_status():
    """Check Ollama Server status"""
    try:
        import requests
        response = requests.get('http://localhost:11434/api/tags', timeout=5)
        if response.status_code == 200:
            return jsonify({'online': True, 'models': response.json().get('models', [])})
        else:
            return jsonify({'online': False})
    except:
        return jsonify({'online': False})

if __name__ == '__main__':
    print("🐐 GOAT Force Command Center Server Starting...")
    print("📡 API Server: http://localhost:8080")
    print("🎛️  Command Center: Open goat-command-center.html")
    
    app.run(host='0.0.0.0', port=8080, debug=True)