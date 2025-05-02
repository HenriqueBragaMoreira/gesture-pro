from fastapi import APIRouter, HTTPException, status, Depends
from typing import List, Optional
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

    Raises 409 if a category with the exact same name (case-sensitive) already exists.
    Raises 500 if the database constraint (potentially case-insensitive) prevents creation.
    """
    # Perform an explicit CASE-SENSITIVE check first.
    exact_match = crud.get_category_by_exact_name(db, name=category.name)
    if exact_match:
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail=f"Category name '{category.name}' already exists (case-sensitive match)."
        )

    # If no exact match, attempt to create the category.
    created_category = crud.create_category(db=db, category=category)

    # If creation fails (returns None), it's likely the DB's constraint (could be case-insensitive)
    # or another integrity error.
    if created_category is None:
         raise HTTPException(
             status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
             detail="Failed to create category. A category with a similar name (case-insensitive) might exist, or another database error occurred."
         )

    return created_category

@router.get("", response_model=schemas.CategoriesListResponse, summary="List categories with pagination")
def list_categories(skip: int = 0, limit: int = 10, name: Optional[str] = None, db: Session = Depends(get_db)):
    """
    Retrieves a list of **categories** from the database with pagination support.

    Includes the total count of categories matching the filter (if any).

    Supports pagination with `skip` and `limit` query parameters.
    Optionally filters by `name` (case-insensitive).
    """
    categories, total_count = crud.get_categories(db, skip=skip, limit=limit, name=name)
    return schemas.CategoriesListResponse(categories=categories, total=total_count)

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

@router.patch("/{category_id}", response_model=schemas.Category, summary="Update category name")
def update_category_name_endpoint(
    category_id: int,
    category_data: schemas.CategoryUpdate, # Use the new schema for the request body
    db: Session = Depends(get_db)
):
    """
    Updates the name of a specific category.

    - **category_id**: The ID of the category to update.
    - **Request Body**: Requires a JSON body with the new `name`.
      ```json
      {
        "name": "New Category Name"
      }
      ```

    Raises:
    - 404: If the category with the specified ID is not found.
    - 409: If the new name already exists for another category.
    - 500: If a database error occurs.
    """
    result = crud.update_category_name(db=db, category_id=category_id, category_update=category_data)

    if isinstance(result, str):
        if result == "NOT_FOUND":
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Category not found")
        elif result == "DUPLICATE_NAME":
            raise HTTPException(status_code=status.HTTP_409_CONFLICT, detail="Category name already exists")
        else: # Handles INTEGRITY_ERROR or UNKNOWN_ERROR
            raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail="Could not update category")

    # If result is not a string, it's the updated category object
    return result

# TODO: Implement PUT /categories/{category_id}
# TODO: Implement DELETE /categories/{category_id} 