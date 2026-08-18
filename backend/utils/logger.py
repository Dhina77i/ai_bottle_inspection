import logging
from pathlib import Path

# Create logs directory
Path("./logs").mkdir(exist_ok=True)

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s - %(name)s - %(levelname)s - %(message)s",
    handlers=[
        logging.FileHandler("./logs/app.log"),
        logging.StreamHandler(),
    ],
)

logger = logging.getLogger(__name__)
