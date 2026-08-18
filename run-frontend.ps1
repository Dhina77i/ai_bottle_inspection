# Run frontend (PowerShell)
# Usage: Open PowerShell, cd to this directory, then: .\run-frontend.ps1

Push-Location "frontend"

# Install dependencies if node_modules missing
if (-not (Test-Path -Path "node_modules")) {
    npm install
}

Write-Host "Starting frontend dev server (Vite) on http://localhost:5173"
npm run dev -- --host 0.0.0.0

Pop-Location
