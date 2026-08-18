@echo off
REM Run frontend (Windows .bat)
REM Usage: double-click or run from terminal: run-frontend.bat
pushd "%~dp0frontend"
if not exist node_modules (
  npm install
)
echo Starting frontend dev server (Vite) on http://localhost:5173
npm run dev -- --host 0.0.0.0
popd
pause