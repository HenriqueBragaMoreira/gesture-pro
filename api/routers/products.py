from fastapi import APIRouter, HTTPException, status, File, UploadFile, Depends
from typing import List
from sqlalchemy.orm import Session
import csv
import io
from pydantic import ValidationError

from .. import crud, models, schemas
from ..database import get_db

router = APIRouter(
    prefix="/products",
    tags=["Products"]
)

# Removed in-memory storage

@router.get("/", response_model=List[schemas.Product], summary="List all products")
def list_products(skip: int = 0, limit: int = 100, db: Session = Depends(get_db)):
    """
    Retrieves a list of all **products** from the database.

    Supports pagination with `skip` and `limit` query parameters.
    """
    products = crud.get_products(db, skip=skip, limit=limit)
    return products

@router.post("/", response_model=schemas.Product, status_code=status.HTTP_201_CREATED, summary="Create a new product")
def create_product(product: schemas.ProductCreate, db: Session = Depends(get_db)):
    """
    Creates a new product entry in the database.

    - **name**: Name of the product.
    - **description**: Optional description.
    - **price**: Product price.
    - **category_id**: The ID of an existing category this product belongs to.
    - **brand**: Optional brand name.

    Raises 404 if the category_id does not exist.
    Raises 400 on other database errors (e.g., integrity constraints).
    """
    db_product = crud.create_product(db=db, product=product)
    if db_product is None:
        # Determine if it was category not found or other error
        category = crud.get_category(db, product.category_id)
        if not category:
             raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=f"Category with id {product.category_id} not found")
        else:
             raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Error creating product in database")
    return db_product

@router.get("/{product_id}", response_model=schemas.Product, summary="Get a specific product by ID")
def get_product(product_id: int, db: Session = Depends(get_db)):
    """
    Retrieves detailed information for a specific product using its unique ID.

    - **product_id**: The unique identifier of the product to retrieve.

    Raises a 404 error if the product ID is not found.
    """
    db_product = crud.get_product(db, product_id=product_id)
    if db_product is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Product not found")
    return db_product

@router.post("/upload-csv/", summary="Upload products from CSV file")
async def upload_products_csv(file: UploadFile = File(...), db: Session = Depends(get_db)):
    """
    Uploads a CSV file to bulk-add products to the database.

    The CSV file must have the following columns in order:
    `id`, `name`, `description`, `price`, `category_id`, `brand`
    (The `id` column will be ignored)

    - **file**: The CSV file to upload.

    Returns a summary of the operation including number of products added and any errors encountered during validation or database insertion.
    """
    content = await file.read()
    try:
        decoded_content = content.decode('utf-8')
    except UnicodeDecodeError:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="File encoding must be UTF-8")

    parse_errors = [] # Errors during parsing/validation
    products_to_create = []

    csv_reader = csv.reader(io.StringIO(decoded_content))
    header = next(csv_reader, None)
    if not header or len(header) < 6:
         raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Invalid CSV format. Expected 6 columns: id, name, description, price, category_id, brand")

    for i, row in enumerate(csv_reader, start=1):
        if not row or len(row) < 6:
            parse_errors.append({"row": i, "error": "Invalid number of columns (expected 6)"})
            continue
        try:
            product_data = {
                "name": row[1],
                "description": row[2] if len(row[2]) > 0 else None,
                "price": float(row[3]), # Validate as float first
                "category_id": int(row[4]),
                "brand": row[5] if len(row[5]) > 0 else None
            }
            # Validate using Pydantic schema before adding to list
            product_create_schema = schemas.ProductCreate(**product_data)
            products_to_create.append(product_create_schema)

        except (ValueError, IndexError) as e:
            parse_errors.append({"row": i, "error": f"Data type/format error: {e}"})
        except ValidationError as e:
             parse_errors.append({"row": i, "error": f"Validation error: {e}"})
        except Exception as e:
            parse_errors.append({"row": i, "error": f"Unexpected parsing error: {e}"})

    if not products_to_create:
         return {
            "message": "CSV processing complete. No valid products found to add.",
            "parse_errors": parse_errors,
            "db_errors": []
        }

    # Attempt to create products in the database
    created_products, db_errors = crud.create_multiple_products(db=db, products=products_to_create)

    return {
        "message": f"CSV processing complete. Attempted to add {len(products_to_create)} products. Successfully added {len(created_products)}.",
        "parse_errors": parse_errors,
        "db_errors": db_errors
    }

# TODO: Add PUT and DELETE endpoints later if needed 