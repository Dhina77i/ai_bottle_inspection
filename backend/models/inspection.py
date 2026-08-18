from sqlalchemy import Column, Integer, String

from database.db import Base


class Inspection(Base):
    __tablename__ = "inspections"

    id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    timestamp = Column(String, nullable=False)
    source = Column(String, nullable=False)
    total_bottles = Column(Integer, default=0)
    passed = Column(Integer, default=0)
    failed = Column(Integer, default=0)
    proper_fill = Column(Integer, default=0)
    under_fill = Column(Integer, default=0)
    over_fill = Column(Integer, default=0)
    label_ok = Column(Integer, default=0)
    label_torn = Column(Integer, default=0)
    label_missing = Column(Integer, default=0)
    video_path = Column(String, nullable=True)
