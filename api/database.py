from sqlalchemy import create_engine
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker
import os
from dotenv import load_dotenv

# Load environment variables from .env file located in the same directory (or parent)
load_dotenv()

DATABASE_URL = os.getenv("DATABASE_URL")

if DATABASE_URL is None:
    raise Exception("DATABASE_URL environment variable not set.")

# Create the SQLAlchemy engine
# connect_args is often needed for SQLite, kept empty here for PostgreSQL
engine = create_engine(
    DATABASE_URL, connect_args={}
)

# Create a SessionLocal class
# Each instance of SessionLocal will be a database session. The class itself is not a database session yet.
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

# Create a Base class
# We will inherit from this class to create each of the database models (ORM models)
Base = declarative_base()

# Dependency to get DB session in path operations
def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close() 