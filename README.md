# AI Water Bottle Inspection Web Application

Full-stack inspection dashboard for uploaded video inference and live webcam inspection using trained YOLOv8 weights.

## Model Weights

Place your trained model at:

```bash
backend/weights/best.pt
```

Or set `YOLO_WEIGHTS` in `backend/.env`. The backend starts even if the weights are missing and reports the model status through `/health` and the dashboard.

## Backend Setup

```bash
cd backend
copy .env.example .env
pip install -r requirements.txt
uvicorn app:app --reload
```

Backend runs on `http://localhost:8000`.

## Frontend Setup

```bash
cd frontend
copy .env.example .env
npm install
npm run dev
```

Frontend runs on `http://localhost:5173`.

## Docker

```bash
docker compose up --build
```

## Features

- Upload MP4, AVI, MOV, or MKV inspection videos.
- Run YOLOv8 inference with bounding boxes, class labels, confidence scores, FPS, and pass/fail counts.
- Stream webcam frames over WebSocket for live prediction updates.
- Store inspection results in SQLite.
- Analytics dashboard with statistics cards, pass/fail pie chart, defect bar chart, and trend line chart.
- Searchable history with source filters, pagination, per-inspection CSV reports, global CSV export, processed video download, screenshot capture, fullscreen live view, toasts, and dark/light mode.

## API

- `POST /upload-video`
- `GET /start-camera`
- `GET /stop-camera`
- `GET /analytics`
- `GET /history`
- `GET /history/{inspection_id}/report`
- `GET /export-csv`
- `GET /health`
- `WS /ws/live`

## Detection Classes

- `bottle`
- `proper_fill`
- `under_fill`
- `over_fill`
- `label_ok`
- `label_torn`
- `label_missing`

Pass criteria: a bottle is counted as pass only when both `proper_fill` and `label_ok` are detected. Otherwise it is counted as failed.
