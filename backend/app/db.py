from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from .config import settings
kwargs = {"connect_args": {"check_same_thread": False}} if settings.database_url.startswith("sqlite") else {}
engine = create_engine(settings.database_url, **kwargs)
SessionLocal = sessionmaker(bind=engine, autoflush=False)
def db():
    session = SessionLocal()
    try: yield session
    finally: session.close()

