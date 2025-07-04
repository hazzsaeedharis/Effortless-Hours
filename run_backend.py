import subprocess
import sys
import os

BACKEND_DIR = os.path.join(os.path.dirname(__file__), 'backend')
backend_cmd = [sys.executable, '-m', 'uvicorn', 'main:app', '--reload', '--port', '8001']

backend_proc = subprocess.Popen(backend_cmd, cwd=BACKEND_DIR)

try:
    backend_proc.wait()
except KeyboardInterrupt:
    print('Shutting down backend...')
    backend_proc.terminate()
    backend_proc.wait() 