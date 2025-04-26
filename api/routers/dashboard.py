from fastapi import APIRouter, Depends
from typing import List
from sqlalchemy.orm import Session

from .. import crud, models, schemas # Use relative imports
from ..database import get_db # Use relative import

router = APIRouter(
    tags=["Dashboard"]
)

# Define a response model for the combined data
# Note: We need SaleWithProductInfo here as crud.get_sales returns that structure
class DashboardData(schemas.BaseModel):
    products: List[schemas.Product]
    sales_with_info: List[schemas.SaleWithProductInfo] # Renamed for clarity

@router.get("/dashboard/", response_model=DashboardData, summary="Get combined product and sales data")
def get_dashboard_data(db: Session = Depends(get_db)):
    """
    Retrieves a consolidated view of all products and sales from the database.

    - **products**: A list of all products.
    - **sales_with_info**: A list of all sales, including associated product details.

    *Note: Does not include pagination. Profit is not calculated.*
    """
    # Fetch all products and sales (consider pagination for large datasets)
    products = crud.get_products(db, limit=1000) # Set a reasonable limit
    sales = crud.get_sales(db, limit=1000) # Set a reasonable limit

    # The response_model handles the Pydantic conversion
    return DashboardData(products=products, sales_with_info=sales) 