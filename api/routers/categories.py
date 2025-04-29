from fastapi import APIRouter, HTTPException, status, Depends
from typing import List
from sqlalchemy.orm import Session

from .. import crud, models, schemas # Use relative imports
from ..database import get_db # Use relative import

router = APIRouter(
    prefix="/categories", # Define prefix here
    tags=["Categories"]
)

# Removed in-memory storage

@router.post("", response_model=schemas.Category, status_code=status.HTTP_201_CREATED, summary="Create a new category")
def create_category(category: schemas.CategoryCreate, db: Session = Depends(get_db)):
    """
    Creates a new category.

    - **name**: The name for the new category.

    Raises 400 if category name already exists.
    """
    db_category = crud.get_category_by_name(db, name=category.name)
    if db_category:
        raise HTTPException(status_code=400, detail="Category name already registered")
    created_category = crud.create_category(db=db, category=category)
    if created_category is None: # Should not happen if check above passes, but good practice
         raise HTTPException(status_code=400, detail="Error creating category, possibly duplicate name race condition")
    return created_category

@router.get("", response_model=List[schemas.Category], summary="List all categories")
def list_categories(skip: int = 0, limit: int = 100, db: Session = Depends(get_db)):
    """
    Retrieves a list of all **categories** from the database.

    Supports pagination with `skip` and `limit` query parameters.
    """
    categories = crud.get_categories(db, skip=skip, limit=limit)
    return categories

@router.get("/{category_id}", response_model=schemas.Category, summary="Get a specific category by ID")
def get_category(category_id: int, db: Session = Depends(get_db)):
    """
    Retrieves details for a specific category by its ID.

    - **category_id**: The ID of the category to retrieve.

    Raises 404 if not found.
    """
    db_category = crud.get_category(db, category_id=category_id)
    if db_category is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Category not found")
    return db_category

# TODO: Implement PUT /categories/{category_id}
# TODO: Implement DELETE /categories/{category_id} 