from sqlalchemy.orm import Session
from sqlalchemy.exc import IntegrityError
from . import models, schemas
from decimal import Decimal

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

# ========= Product CRUD ==========

def get_product(db: Session, product_id: int):
    return db.query(models.Product).filter(models.Product.id == product_id).first()

def get_products(db: Session, skip: int = 0, limit: int = 100):
    return db.query(models.Product).offset(skip).limit(limit).all()

def create_product(db: Session, product: schemas.ProductCreate):
    # Ensure price is converted to Decimal for database storage
    db_product = models.Product(**product.model_dump())
    if isinstance(db_product.price, float):
        db_product.price = Decimal(str(db_product.price)) # Convert float to Decimal

    # Optional: Check if category_id exists before trying to insert
    category = get_category(db, product.category_id)
    if not category:
        return None # Indicate category not found

    try:
        db.add(db_product)
        db.commit()
        db.refresh(db_product)
    except IntegrityError: # Could catch other integrity issues too
        db.rollback()
        return None # General failure
    return db_product


def create_multiple_products(db: Session, products: list[schemas.ProductCreate]):
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

def get_sales(db: Session, skip: int = 0, limit: int = 100):
    # Using eager loading to fetch related product data in the same query
    return db.query(models.Sale).options(joinedload(models.Sale.product)).offset(skip).limit(limit).all()

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


from sqlalchemy.orm import joinedload # Import for eager loading 