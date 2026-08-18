# Run application via Docker Compose
# Requires Docker and Docker Compose installed
# Usage: .\run-docker.ps1

Write-Host "Starting services with docker-compose..."

docker-compose up --build
