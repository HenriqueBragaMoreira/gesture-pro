from fastapi import FastAPI
# Import database components
from . import models
from .database import engine, Base

# Create database tables if they don't exist
# This is okay for development, but for production consider using Alembic migrations
Base.metadata.create_all(bind=engine)

app = FastAPI(
    title="GesturePro API",
    description="API for managing categories, products, and sales for GesturePro.",
    version="0.1.0",
)

@app.get("/")
def read_root():
    return {"message": "Welcome to GesturePro API"}

# Include routers
from api.routers import categories, products, sales, dashboard # Use relative imports
app.include_router(categories.router)
app.include_router(products.router)
app.include_router(sales.router)
app.include_router(dashboard.router) 