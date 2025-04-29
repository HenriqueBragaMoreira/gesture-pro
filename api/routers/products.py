from fastapi import APIRouter, HTTPException, status, File, UploadFile, Depends
from typing import List, Optional
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

@router.get("", response_model=schemas.ProductListResponse, summary="List all products")
def list_products(skip: int = 0, limit: int = 100, category: Optional[str] = None, db: Session = Depends(get_db)):
    """
    Retrieves a list of all **products** from the database with pagination support and total count.

    Supports pagination with `skip` and `limit` query parameters.
    Optionally filters by `category` name (case-insensitive).

    Returns:
        - `products`: A list of product objects.
        - `totalProducts`: The total number of products available (respecting the filter).
    """
    products = crud.get_products(db, skip=skip, limit=limit, category_name=category)
    total_products = crud.get_products_count(db, category_name=category)
    return {"products": products, "totalProducts": total_products}

@router.post("", response_model=schemas.Product, status_code=status.HTTP_201_CREATED, summary="Create a new product")
def create_product(product_input: schemas.ProductCreateApiInput, db: Session = Depends(get_db)):
    """
    Creates a new product entry in the database.
    Accepts price as a string (e.g., "20.00") and converts it to float.

    - **name**: Name of the product.
    - **description**: Optional description.
    - **price**: Product price (as string).
    - **category_id**: The ID of an existing category this product belongs to.
    - **brand**: Optional brand name.

    Raises 404 if the category_id does not exist.
    Raises 400 on other database errors (e.g., integrity constraints, invalid price format).
    """
    try:
        # Convert price string to float
        price_float = float(product_input.price)
    except ValueError:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Invalid format for price: '{product_input.price}'. Must be a valid number string."
        )

    # Create the internal data structure for the CRUD operation
    product_data_for_crud = schemas.ProductCreateInternal(
        name=product_input.name,
        description=product_input.description,
        price=price_float, # Use the converted float price
        category_id=product_input.category_id,
        brand=product_input.brand
    )

    result = crud.create_product(db=db, product=product_data_for_crud)

    if isinstance(result, str):
        if result == "CATEGORY_NOT_FOUND":
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail=f"Category with id {product_input.category_id} not found"
            )
        elif result == "INTEGRITY_ERROR":
            # The specific error is logged in crud.py
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Database integrity error. Check logs for details (e.g., duplicate name, constraint violation)."
            )
        else: # UNKNOWN_ERROR or any other string
             raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail="An unexpected error occurred while creating the product. Check server logs."
            )

    # If result is not a string, it must be the db_product object
    return result

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

@router.post("/upload-csv", summary="Upload products from CSV file")
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
                "price": row[3],
                "category_id": int(row[4]),
                "brand": row[5] if len(row[5]) > 0 else None
            }
            # Instead, let's build the list assuming product_data is correct for now
            # The crud.create_multiple_products might need adjustment or data conversion before call
            products_to_create.append(product_data) # Append dict directly for now

        except (ValueError, IndexError) as e:
            parse_errors.append({"row": i, "error": f"Data type/format error: {e}"})
        except ValidationError as e:
             parse_errors.append({"row": i, "error": f"Validation error: {e}"})
        except Exception as e:
            parse_errors.append({"row": i, "error": f"Unexpected parsing error: {e}"})

    if not products_to_create:
         # If all rows failed parsing/validation, return 400
         raise HTTPException(
             status_code=status.HTTP_400_BAD_REQUEST,
             detail="CSV processing failed. No valid products found to add. Check parse_errors.",
             # We might need a way to pass headers or custom body here if we want to include parse_errors
             # For now, let's just return the detail message. The logs would have more info.
             # Alternatively, return a standard JSON response with status 400:
             # return JSONResponse(status_code=status.HTTP_400_BAD_REQUEST,
             #                     content={"message": "CSV processing failed...", "parse_errors": parse_errors, "db_errors": []})
         )

    # Attempt to create products in the database
    # *** IMPORTANT: crud.create_multiple_products likely expects a list of Pydantic models
    #     with float price. The list 'products_to_create' currently contains dicts.
    #     This needs conversion before calling.
    # TODO: Convert items in products_to_create to schemas.ProductCreateInternal before calling crud
    # Example conversion (needs error handling):
    internal_products = [
        schemas.ProductCreateInternal(**p_data) for p_data in products_to_create
    ]
    created_products, db_errors = crud.create_multiple_products(db=db, products=internal_products)

    # If no products were created AND there were database errors, return 400
    if not created_products and db_errors:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"CSV processed, but no products could be added due to database errors (e.g., categories not found). Attempted: {len(products_to_create)}. Check logs or db_errors in response for details.",
            # Consider adding db_errors to the response if possible with HTTPException or use JSONResponse
        )

    # If we reach here, either some products were created or there were no db_errors
    # Return 200 OK, potentially indicating partial success if db_errors exist
    return {
        "message": f"CSV processing complete. Attempted to add {len(products_to_create)} products. Successfully added {len(created_products)}.",
        "parse_errors": parse_errors,
        "db_errors": db_errors
    }

# TODO: Add PUT and DELETE endpoints later if needed 