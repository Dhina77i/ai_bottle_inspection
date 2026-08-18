# Run both backend and frontend in separate PowerShell windows
# Usage: .\run-all.ps1

$scriptDir = (Get-Location).Path

# Start backend in new PowerShell window
Start-Process -FilePath "powershell.exe" -ArgumentList "-NoExit", "-Command", "Set-Location -Path '$scriptDir'; .\run-backend.ps1"

# Start frontend in new PowerShell window
Start-Process -FilePath "powershell.exe" -ArgumentList "-NoExit", "-Command", "Set-Location -Path '$scriptDir'; .\run-frontend.ps1"

Write-Host "Launched backend and frontend in separate windows. Check the new windows for logs."