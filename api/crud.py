from sqlalchemy.orm import Session, joinedload
from sqlalchemy.exc import IntegrityError
from sqlalchemy import func # Import func for SUM and COUNT
from . import models, schemas
from decimal import Decimal
from typing import Optional, List
import logging  # Add logging import at the top if not present
from fastapi import HTTPException, status # Add HTTPException import

# ========= Category CRUD =========

def get_category(db: Session, category_id: int):
    return db.query(models.Category).filter(models.Category.id == category_id).first()

def get_category_by_name(db: Session, name: str):
    return db.query(models.Category).filter(models.Category.name == name).first()

def get_categories(db: Session, skip: int = 0, limit: int = 100):
    return db.query(models.Category).offset(skip).limit(limit).all()

def create_category(db: Session, category: schemas.CategoryCreate):
    db_category = models.Category(name=category.name)
    try:
        db.add(db_category)
        db.commit()
        db.refresh(db_category)
    except IntegrityError: # Catch unique constraint violation
        db.rollback()
        return None # Indicate failure due to duplicate name
    return db_category

def update_category_name(db: Session, category_id: int, category_update: schemas.CategoryUpdate) -> models.Category | str:
    """Updates the name of a specific category."""
    db_category = get_category(db, category_id)
    if not db_category:
        return "NOT_FOUND"

    # Check if the new name already exists for another category
    existing_category = get_category_by_name(db, category_update.name)
    if existing_category and existing_category.id != category_id:
        return "DUPLICATE_NAME"

    # Update the name
    db_category.name = category_update.name

    try:
        db.commit()
        db.refresh(db_category)
        return db_category
    except IntegrityError:
        db.rollback()
        # This might happen due to unforeseen constraints, although duplicate check should cover most.
        return "INTEGRITY_ERROR"
    except Exception as e:
        db.rollback()
        logging.error(f"Unexpected error updating category {category_id}: {e}")
        return "UNKNOWN_ERROR"

# ========= Product CRUD ==========

def get_product(db: Session, product_id: int):
    return db.query(models.Product).options(joinedload(models.Product.category)).filter(models.Product.id == product_id).first()

def get_products(db: Session, skip: int = 0, limit: int = 100, category_name: Optional[str] = None):
    query = db.query(models.Product).options(joinedload(models.Product.category))
    if category_name:
        query = query.join(models.Category).filter(models.Category.name.ilike(f"%{category_name}%")) # Case-insensitive search
    return query.offset(skip).limit(limit).all()

def get_products_count(db: Session, category_name: Optional[str] = None) -> int:
    """Returns the total number of products in the database, optionally filtered by category name."""
    query = db.query(models.Product)
    if category_name:
        query = query.join(models.Category).filter(models.Category.name.ilike(f"%{category_name}%")) # Case-insensitive search
    return query.count()

def create_product(db: Session, product: schemas.ProductCreateInternal):
    # Ensure price is converted to Decimal for database storage
    product_data = product.model_dump()
    # Explicitly remove 'id' if present, although it shouldn't be based on the schema
    product_data.pop('id', None)

    db_product = models.Product(**product_data)

    # We also need to ensure the price conversion still happens
    if isinstance(db_product.price, float):
        db_product.price = Decimal(str(db_product.price))

    # Optional: Check if category_id exists before trying to insert
    category = get_category(db, product.category_id)
    if not category:
        # Return a specific value or raise an exception recognizable by the router
        # For clarity, let's raise a specific internal exception or return a marker
        # Returning a specific marker string that the router will check
        return "CATEGORY_NOT_FOUND"

    try:
        db.add(db_product)
        db.commit()
        db.refresh(db_product)
        return db_product # Return the created product on success
    except IntegrityError as e:
        db.rollback()
        # Log the detailed error for debugging
        logging.error(f"Database integrity error creating product: {e}")
        # Return a specific error marker or raise an internal exception
        # Returning a specific marker string
        return "INTEGRITY_ERROR"
    except Exception as e: # Catch any other unexpected errors during commit
        db.rollback()
        logging.error(f"Unexpected error creating product: {e}")
        # Return a generic error marker
        return "UNKNOWN_ERROR"

def create_multiple_products(db: Session, products: list[schemas.ProductCreateInternal]):
    new_products = []
    errors = []
    for i, product in enumerate(products):
        # Ensure price is converted to Decimal
        db_product_data = product.model_dump()
        if isinstance(db_product_data.get('price'), float):
            db_product_data['price'] = Decimal(str(db_product_data['price']))

        # Check if category exists
        category = get_category(db, product.category_id)
        if not category:
            errors.append({"index": i, "error": f"Category ID {product.category_id} not found"})
            continue

        db_product = models.Product(**db_product_data)
        db.add(db_product)
        new_products.append(db_product)

    try:
        db.commit()
        for p in new_products: # Refresh each individually after commit
            db.refresh(p)
    except IntegrityError as e:
        db.rollback()
        errors.append({"index": "commit", "error": f"Database commit error: {e}"})
        return [], errors # Return empty list and commit error
    except Exception as e:
        db.rollback()
        errors.append({"index": "commit", "error": f"Unexpected commit error: {e}"})
        return [], errors

    return new_products, errors

# ========= Sale CRUD ============

def get_sale(db: Session, sale_id: int):
    # Consider joining product for efficiency if needed immediately
    return db.query(models.Sale).filter(models.Sale.id == sale_id).first()

def get_sales(db: Session, skip: int = 0, limit: int = 100, category_id: Optional[int] = None):
    # Using eager loading to fetch related product data in the same query
    query = db.query(models.Sale).options(joinedload(models.Sale.product).joinedload(models.Product.category))

    # Add filtering by category_id if provided
    if category_id is not None:
        query = query.join(models.Product).filter(models.Product.category_id == category_id)

    return query.offset(skip).limit(limit).all()

def create_sale(db: Session, sale: schemas.SaleCreate):
    # Fetch the product to get the price
    product = get_product(db, sale.product_id)
    if not product:
        return None # Indicate product not found

    # Calculate total_price based on product price and quantity
    # Ensure calculations use Decimal
    total_price_calculated = product.price * Decimal(sale.quantity)

    db_sale = models.Sale(
        product_id=sale.product_id,
        quantity=sale.quantity,
        total_price=total_price_calculated
    )
    try:
        db.add(db_sale)
        db.commit()
        db.refresh(db_sale)
    except IntegrityError: # Could catch other integrity issues
        db.rollback()
        return None
    return db_sale

# ========= Dashboard CRUD ==========

def get_dashboard_summary(db: Session, category_id: Optional[int] = None):
    """Calculates summary statistics for the dashboard, optionally filtered by category_id."""
    # --- Product Count ---
    product_query = db.query(func.count(models.Product.id))
    if category_id is not None:
        product_query = product_query.filter(models.Product.category_id == category_id)
    total_products = product_query.scalar()

    # --- Sales Sums (Join with Product for filtering) ---
    sales_base_query = db.query(models.Sale).join(models.Product)
    if category_id is not None:
        sales_base_query = sales_base_query.filter(models.Product.category_id == category_id)

    # Use the filtered query to calculate sums and average
    total_sales_value = sales_base_query.with_entities(func.coalesce(func.sum(models.Sale.total_price), 0.0)).scalar()
    total_items_sold = sales_base_query.with_entities(func.coalesce(func.sum(models.Sale.quantity), 0)).scalar()
    average_sale_value = sales_base_query.with_entities(func.coalesce(func.avg(models.Sale.total_price), 0.0)).scalar()

    return {
        "registered_products": total_products or 0,
        "total_sales_value": float(total_sales_value), # Cast Decimal result to float
        "total_items_sold": total_items_sold,
        "average_sale_value": float(average_sale_value) # Cast Decimal result to float
    }

def get_all_sales_with_details(db: Session) -> List[models.Sale]:
    """Fetches all sales with related product and category information eagerly loaded."""
    return db.query(models.Sale).options(
        joinedload(models.Sale.product).joinedload(models.Product.category)
    ).order_by(models.Sale.id).all() 