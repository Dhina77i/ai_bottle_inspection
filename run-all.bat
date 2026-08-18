@echo off
REM Launch backend and frontend in separate cmd windows
REM Usage: run-all.bat
start "SeeWise Backend" cmd /k "%~dp0run-backend.bat"
start "SeeWise Frontend" cmd /k "%~dp0run-frontend.bat"
echo Launched backend and frontend in new windows.
pause