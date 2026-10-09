"""
Database configuration and session management
"""

from sqlalchemy import create_engine
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker, Session
from sqlalchemy.pool import NullPool

from app.core.config import DATABASE_URL

# Connect args differ per backend: SQLite has no server options.
_connect_args = (
    {"check_same_thread": False}
    if DATABASE_URL.startswith("sqlite")
    else {
        "connect_timeout": 10,
        "application_name": "medivault-backend",
    }
)

# Create SQLAlchemy engine
engine = create_engine(
    DATABASE_URL,
    poolclass=NullPool,  # No connection pooling for simplicity in microservices
    pool_pre_ping=True,  # Check connections before using
    connect_args=_connect_args,
)

# Create session factory
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

# Base class for models
Base = declarative_base()

def get_db() -> Session:
    """Get a database session."""
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()
