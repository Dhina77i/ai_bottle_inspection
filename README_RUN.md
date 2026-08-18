Run the SeeWise application (dev) - quick guide

1) Using PowerShell scripts (Windows)
- Open an elevated PowerShell or normal PowerShell in project root:
  .\run-all.ps1
  This opens two windows: backend (uvicorn) and frontend (vite dev server).

- To run individually:
  .\run-backend.ps1   # starts backend on http://localhost:8000
  .\run-frontend.ps1  # starts frontend dev server on http://localhost:5173

2) Using Docker Compose
- Ensure Docker and docker-compose are installed
- Run:
  .\run-docker.ps1   # runs `docker-compose up --build`

3) Manual commands (if you prefer)
Backend:
  cd backend
  python -m venv .venv
  .\.venv\Scripts\activate
  pip install -r requirements.txt
  uvicorn app:app --reload --host 0.0.0.0 --port 8000

Frontend:
  cd frontend
  npm install
  npm run dev -- --host 0.0.0.0

4) Verification
- Backend health: http://localhost:8000/health
- Frontend: http://localhost:5173

Notes:
- These scripts assume Windows PowerShell. For macOS/Linux, use equivalent shell commands.
- If "pwsh" (PowerShell Core) is required in CI, install from https://aka.ms/powershell
