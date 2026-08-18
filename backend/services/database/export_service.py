import csv
from pathlib import Path


class ExportService:
    """Handles data export"""

    @staticmethod
    def export_to_csv(data: list, filename: str):
        """Export data to CSV"""
        csv_path = Path(f"./backend/reports/{filename}")
        csv_path.parent.mkdir(parents=True, exist_ok=True)

        with open(csv_path, 'w', newline='') as f:
            if data:
                writer = csv.DictWriter(f, fieldnames=data[0].keys())
                writer.writeheader()
                writer.writerows(data)
        return csv_path
