import subprocess
import sys
import os

BACKEND_DIR = os.path.join(os.path.dirname(__file__), 'backend')
FRONTEND_DIR = os.path.join(os.path.dirname(__file__), 'frontend')

backend_cmd = [sys.executable, '-m', 'uvicorn', 'main:app', '--reload', '--port', '8001']
frontend_cmd = ['npm', 'run', 'dev']

backend_proc = subprocess.Popen(backend_cmd, cwd=BACKEND_DIR)
frontend_proc = subprocess.Popen(frontend_cmd, cwd=FRONTEND_DIR)

try:
    backend_proc.wait()
    frontend_proc.wait()
except KeyboardInterrupt:
    print('Shutting down...')
    backend_proc.terminate()
    frontend_proc.terminate()
    backend_proc.wait()
    frontend_proc.wait() 