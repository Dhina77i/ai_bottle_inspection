import os
import logging
from dotenv import load_dotenv

load_dotenv()

# Basic logging for backend operations and download errors
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger("backend")

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from database.db import init_db
from routes.api import router as legacy_router
from routes.inference_routes import router as inference_router
from routes.analytics_routes import router as analytics_router
from routes.history_routes import router as history_router
from routes.stream_routes import router as stream_router
from routes.users_routes import router as users_router

app = FastAPI(title=os.getenv("APP_NAME", "AI Water Bottle Inspection"), version="1.0.0")

raw_origins = os.getenv("CORS_ORIGINS")
if raw_origins:
    origins = [o.strip() for o in raw_origins.split(",") if o.strip()]
else:
    origins = [
        "http://localhost:5173",
        "http://127.0.0.1:5173",
        "http://localhost:5174",
        "http://127.0.0.1:5174",
        "http://localhost:5175",
        "http://127.0.0.1:5175",
    ]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
    expose_headers=["Content-Disposition"],
)


@app.on_event("startup")
def startup() -> None:
    init_db()


# Include all routers
app.include_router(inference_router)
app.include_router(analytics_router)
app.include_router(history_router)
app.include_router(stream_router)
app.include_router(legacy_router)
app.include_router(users_router)

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=int(os.getenv("PORT", 8000)), log_level="info")
