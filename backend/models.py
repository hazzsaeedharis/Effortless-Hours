from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy import Column, Integer, String, Date, Time, DateTime, Float
from sqlalchemy import create_engine
import datetime
from sqlalchemy.orm import sessionmaker
import os

Base = declarative_base()

class WorkLog(Base):
    __tablename__ = "work_logs"
    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(String, nullable=True)  # Optional, for multi-user support
    project_id = Column(String, nullable=False)
    project_type = Column(String, nullable=True)
    task = Column(String, nullable=False)
    subtask = Column(String, nullable=True)
    description = Column(String, nullable=True)
    work_date = Column(Date, nullable=False)
    work_start_time = Column(Time, nullable=True)
    work_end_time = Column(Time, nullable=True)
    hours_logged = Column(Float, nullable=True)
    entry_timestamp = Column(DateTime, default=datetime.datetime.utcnow)
    last_modified = Column(DateTime, default=datetime.datetime.utcnow, onupdate=datetime.datetime.utcnow)
    status = Column(String, nullable=True)  # e.g., submitted, draft, etc.

# --- Table creation utility ---
# Update the connection string as needed for your Postgres setup
DATABASE_URL = (
    f"postgresql+psycopg2://{os.getenv('POSTGRES_USER')}:{os.getenv('POSTGRES_PASSWORD')}"
    f"@localhost:5432/{os.getenv('POSTGRES_DB')}"
)
engine = create_engine(DATABASE_URL)

def create_tables():
    Base.metadata.create_all(bind=engine)

if __name__ == "__main__":
    create_tables()

# Session = sessionmaker(bind=engine)
# session = Session()

# Add a new log
# new_log = WorkLog(project_id="123", task="Task A", work_date=datetime.date.today())
# session.add(new_log)
# session.commit()

# Query logs
# logs = session.query(WorkLog).all() 