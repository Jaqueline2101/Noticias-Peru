from flask import Flask, jsonify, request
from flask_cors import CORS
import subprocess
import os
import sys
import json
import time

app = Flask(__name__)
CORS(app)

STATUS_FILE = 'scraper_status.json'
STOP_FLAG = 'stop_scraper.flag'

@app.route('/run-scraper', methods=['POST'])
def run_scraper():
    try:
        data = request.get_json() or {}
        date_arg = data.get('date')
        
        cmd = [sys.executable, 'scraper_noticieros_2025.py']
        if date_arg == 'hoy':
            cmd.append('--hoy')
        elif date_arg:
            cmd.extend(['--date', date_arg])

        # Ejecutar en segundo plano (sin esperar)
        subprocess.Popen(
            cmd, 
            cwd=os.path.dirname(os.path.abspath(__file__)),
            creationflags=subprocess.CREATE_NO_WINDOW if os.name == 'nt' else 0
        )
        
        return jsonify({
            "status": "success", 
            "message": "Scraper iniciado en segundo plano"
        })
            
    except Exception as e:
        return jsonify({
            "status": "error", 
            "message": str(e)
        }), 500

@app.route('/scraper-status', methods=['GET'])
def get_status():
    try:
        if os.path.exists(STATUS_FILE):
            with open(STATUS_FILE, 'r') as f:
                data = json.load(f)
            return jsonify(data)
        else:
            return jsonify({"status": "idle", "progress": 0, "message": "Esperando..."})
    except Exception as e:
        return jsonify({"status": "error", "message": str(e)}), 500

@app.route('/stop-scraper', methods=['POST'])
def stop_scraper():
    try:
        # Crear flag de parada
        with open(STOP_FLAG, 'w') as f:
            f.write("STOP")
        return jsonify({"status": "success", "message": "Solicitud de parada enviada"})
    except Exception as e:
        return jsonify({"status": "error", "message": str(e)}), 500

@app.route('/health', methods=['GET'])
def health():
    return jsonify({"status": "ok"})

if __name__ == '__main__':
    print("Iniciando servidor API del Scraper en puerto 5000...")
    print("Ruta del scraper:", os.path.abspath('scraper_noticieros_2025.py'))
    app.run(debug=True, host='0.0.0.0', port=5000)
