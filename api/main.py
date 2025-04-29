from fastapi import FastAPI
# Import CORS middleware
from fastapi.middleware.cors import CORSMiddleware
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

# CORS Middleware Configuration
# WARNING: Allowing all origins ('*') is suitable for development.
# For production, replace '*' with the specific origin(s) of your frontend.
origins = [
    "*", # Allow all origins for development
    # e.g., "http://localhost:3000", "https://your-frontend-domain.com"
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"], # Allows all methods (GET, POST, PUT, DELETE, etc.)
    allow_headers=["*"], # Allows all headers
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