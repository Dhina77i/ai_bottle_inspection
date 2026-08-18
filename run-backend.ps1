# Run backend (PowerShell)
# Usage: Open PowerShell, cd to this directory, then: .\run-backend.ps1

Push-Location "backend"

# Create and activate virtualenv if missing, then install requirements
if (-not (Test-Path -Path .\.venv)) {
    python -m venv .venv
}

$venvPython = Join-Path -Path (Get-Location) -ChildPath ".\.venv\Scripts\python.exe"
$venvPip = Join-Path -Path (Get-Location) -ChildPath ".\.venv\Scripts\pip.exe"

# Install requirements if pip present and requirements.txt exists
if ((Test-Path $venvPip) -and (Test-Path "requirements.txt")) {
    & $venvPip install -r requirements.txt
}

# Start backend using uvicorn
Write-Host "Starting backend on http://0.0.0.0:8000"
& $venvPython -m uvicorn app:app --reload --host 0.0.0.0 --port 8000

Pop-Location
