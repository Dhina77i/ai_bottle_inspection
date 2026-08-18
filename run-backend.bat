@echo off
REM Run backend (Windows .bat)
REM Usage: double-click or run from terminal: run-backend.bat
pushd "%~dp0backend"
if not exist ".venv" (
  python -m venv .venv
)
call .venv\Scripts\activate.bat
if exist requirements.txt (
  pip install -r requirements.txt
)
echo Starting backend on http://0.0.0.0:8000
python -m uvicorn app:app --reload --host 0.0.0.0 --port 8000
popd
pause