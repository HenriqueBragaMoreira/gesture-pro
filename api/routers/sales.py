from fastapi import APIRouter, HTTPException, status, Depends
from typing import List
from sqlalchemy.orm import Session

from .. import crud, models, schemas
from ..database import get_db

router = APIRouter(
    prefix="/sales",
    tags=["Sales"]
)

# Removed in-memory storage

@router.get("/", response_model=List[schemas.SaleWithProductInfo], summary="List all sales")
def list_sales(skip: int = 0, limit: int = 100, db: Session = Depends(get_db)):
    """
    Retrieves a list of all **sales** recorded in the database.

    Includes associated product information for each sale.
    Supports pagination with `skip` and `limit` query parameters.
    *Note: Profit is not calculated or included.*
    """
    sales = crud.get_sales(db, skip=skip, limit=limit)
    # The response_model List[schemas.SaleWithProductInfo] handles the conversion
    # Pydantic will automatically map the nested product model data
    return sales

@router.post("/", response_model=schemas.Sale, status_code=status.HTTP_201_CREATED, summary="Record a new sale")
def create_sale(sale: schemas.SaleCreate, db: Session = Depends(get_db)):
    """
    Records a new sale transaction in the database.

    Calculates `total_price` based on product price and quantity.

    - **product_id**: The ID of an existing product being sold.
    - **quantity**: The number of units sold.

    Raises 404 if the product_id does not exist.
    Raises 400 on other database errors.
    """
    db_sale = crud.create_sale(db=db, sale=sale)
    if db_sale is None:
        # Check if product was not found
        product = crud.get_product(db, sale.product_id)
        if not product:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=f"Product with id {sale.product_id} not found")
        else:
            raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Error creating sale in database")
    return db_sale

# TODO: Add GET /sales/{id}, PUT, DELETE endpoints later if needed 