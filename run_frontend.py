import subprocess
import os

FRONTEND_DIR = os.path.join(os.path.dirname(__file__), 'frontend')
frontend_cmd = ['npm', 'run', 'dev']

frontend_proc = subprocess.Popen(frontend_cmd, cwd=FRONTEND_DIR)

try:
    frontend_proc.wait()
except KeyboardInterrupt:
    print('Shutting down frontend...')
    frontend_proc.terminate()
    frontend_proc.wait() 