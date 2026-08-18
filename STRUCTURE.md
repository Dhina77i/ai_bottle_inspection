# AI Water Bottle Inspection System - Restructured

## Project Structure

This project has been restructured to follow a comprehensive, scalable architecture with clear separation of concerns.

### Backend Structure (`backend/`)
- **routes/**: API route handlers
- **controllers/**: Business logic controllers
- **services/**: Core services organized by domain
  - `yolo/`: YOLO model and inference services
  - `stream/`: Streaming and video services
  - `video/`: Video processing utilities
  - `dashboard/`: Dashboard statistics and analytics
  - `database/`: Database operations and exports
- **websocket/**: WebSocket connection management
- **utils/**: Utility functions and helpers
- **models/**: Pydantic data models
- **database/**: Database files and migrations
- **uploads/**: Video and frame storage
- **static/**: Static files and streams

### Frontend Structure (`frontend/src/`)
- **components/**: Reusable React components
  - `dashboard/`: Dashboard-specific components
  - `inference/`: Video inference components
  - `layout/`: Layout components (Navbar, Sidebar, etc.)
  - `common/`: Common UI components
  - `history/`: History and records components
- **pages/**: Page components for routing
- **services/**: API and service clients
- **hooks/**: Custom React hooks
- **context/**: React context for state management
- **utils/**: Utility functions and constants
- **styles/**: CSS stylesheets

## Getting Started

1. Backend is running on `http://localhost:8000`
2. Frontend is running on `http://localhost:5173`

## API Endpoints

### Inference
- POST `/api/inference/upload` - Upload video for inference
- GET `/api/inference/results/{session_id}` - Get inference results

### Analytics
- GET `/api/analytics/dashboard` - Get dashboard analytics
- GET `/api/analytics/stats` - Get detailed statistics

### History
- GET `/api/history` - Get inspection history
- GET `/api/history/{id}` - Get inspection detail
- DELETE `/api/history/{id}` - Delete inspection

### Stream
- POST `/api/stream/start` - Start stream
- POST `/api/stream/stop` - Stop stream
- GET `/api/stream/status` - Get stream status

### WebSocket
- WS `/ws/live` - Live data streaming
