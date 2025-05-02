from sqlalchemy.orm import Session, joinedload
from sqlalchemy.exc import IntegrityError
from sqlalchemy import func, select
from . import models, schemas
from decimal import Decimal
from typing import Optional, List, Tuple
import logging
from fastapi import HTTPException, status

# ========= Category CRUD =========

def get_category(db: Session, category_id: int):
    return db.query(models.Category).filter(models.Category.id == category_id).first()

def get_category_by_name(db: Session, name: str):
    return db.query(models.Category).filter(func.lower(models.Category.name) == func.lower(name)).first()

def get_category_by_exact_name(db: Session, name: str):
    return db.query(models.Category).filter(models.Category.name == name).first()

def get_categories(db: Session, skip: int = 0, limit: int = 10, name: Optional[str] = None) -> Tuple[List[models.Category], int]:
    query = select(models.Category)
    count_query = select(func.count()).select_from(models.Category)

    if name:
        search = f"%{name}%"
        query = query.filter(models.Category.name.ilike(search))
        count_query = count_query.filter(models.Category.name.ilike(search))

    total_count = db.execute(count_query).scalar_one_or_none() or 0

    query = query.order_by(models.Category.id).offset(skip).limit(limit)

    categories = db.execute(query).scalars().all()

    return categories, total_count

def create_category(db: Session, category: schemas.CategoryCreate):
    db_category = models.Category(name=category.name)
    try:
        db.add(db_category)
        db.commit()
        db.refresh(db_category)
        return db_category
    except IntegrityError:
        db.rollback()
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail=f"Category with name '{category.name}' already exists."
        )
    except Exception as e:
        db.rollback()
        logging.error(f"Unexpected error creating category: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="An unexpected error occurred while creating the category."
        )

def update_category_name(db: Session, category_id: int, category_update: schemas.CategoryUpdate) -> models.Category:
    db_category = get_category(db, category_id)
    if not db_category:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Category with ID {category_id} not found."
        )

    existing_category = get_category_by_name(db, category_update.name)
    if existing_category and existing_category.id != category_id:
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail=f"Category name '{category_update.name}' already exists."
        )

    db_category.name = category_update.name

    try:
        db.commit()
        db.refresh(db_category)
        return db_category
    except IntegrityError:
        db.rollback()
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Database integrity error while updating category."
        )
    except Exception as e:
        db.rollback()
        logging.error(f"Unexpected error updating category {category_id}: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="An unexpected error occurred while updating the category."
        )

# ========= Product CRUD ==========

def get_product(db: Session, product_id: int):
    return db.query(models.Product).options(joinedload(models.Product.category)).filter(models.Product.id == product_id).first()

def get_products(db: Session, skip: int = 0, limit: int = 100, category_name: Optional[str] = None, name: Optional[str] = None):
    query = db.query(models.Product).options(joinedload(models.Product.category))
    if category_name:
        query = query.join(models.Category).filter(models.Category.name.ilike(f"%{category_name}%"))
    if name:
        query = query.filter(models.Product.name.ilike(f"%{name}%"))
    return query.offset(skip).limit(limit).all()

def get_products_count(db: Session, category_name: Optional[str] = None, name: Optional[str] = None) -> int:
    query = db.query(models.Product)
    if category_name:
        query = query.join(models.Category).filter(models.Category.name.ilike(f"%{category_name}%"))
    if name:
        query = query.filter(models.Product.name.ilike(f"%{name}%"))
    return query.count()

def create_product(db: Session, product: schemas.ProductCreateInternal) -> models.Product:
    product_data = product.model_dump()
    product_data.pop('id', None)

    try:
        if 'price' in product_data:
            product_data['price'] = Decimal(str(product_data['price']))
    except Exception as decimal_conv_error:
        raise HTTPException(
            status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
            detail=f"Invalid price format: {product_data.get('price')}. Error: {decimal_conv_error}"
        )

    category = get_category(db, product.category_id)
    if not category:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Category with ID {product.category_id} not found."
        )

    db_product = models.Product(**product_data)

    try:
        logging.info(f"Attempting to add product to session: {db_product.__dict__}")
        db.add(db_product)
        logging.info("Attempting to commit transaction...")
        db.commit()
        logging.info("Commit successful. Refreshing product...")
        db.refresh(db_product)
        logging.info(f"Product created successfully: ID {db_product.id}")
        return db_product
    except IntegrityError as e:
        db.rollback()
        logging.error(f"Database integrity error during commit for product data {product_data}: {e}")
        if hasattr(e, 'orig') and e.orig:
            logging.error(f"Original DBAPIError: {e.orig}")

        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Could not create product. Ensure category ID {product.category_id} exists and data is valid. Check logs for details."
        )
    except Exception as e:
        db.rollback()
        logging.error(f"Unexpected error creating product with data {product_data}: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="An unexpected error occurred while creating the product. Check logs for details."
        )

def create_multiple_products(db: Session, products: list[schemas.ProductCreateInternal]):
    new_products = []
    errors = []
    for i, product in enumerate(products):
        db_product_data = product.model_dump()
        db_product_data.pop('id', None)

        if isinstance(db_product_data.get('price'), float):
            db_product_data['price'] = Decimal(str(db_product_data['price']))

        category = get_category(db, product.category_id)
        if not category:
            errors.append({"index": i, "error": f"Category ID {product.category_id} not found"})
            continue

        db_product = models.Product(**db_product_data)
        db.add(db_product)
        new_products.append(db_product)

    if not new_products and errors:
        return [], errors
    elif not new_products and not errors:
        return [], []

    try:
        db.commit()
        for p in new_products:
            try:
                db.refresh(p)
            except Exception as refresh_exc:
                errors.append({"index": "refresh", "product_id": p.id, "error": f"Failed to refresh product: {refresh_exc}"})
    except IntegrityError as e:
        db.rollback()
        errors.append({"index": "commit", "error": f"Database commit integrity error: {e}. No products were created."})
        return [], errors
    except Exception as e:
        db.rollback()
        errors.append({"index": "commit", "error": f"Unexpected commit error: {e}. No products were created."})
        return [], errors

    return new_products, errors

# ========= Sale CRUD ============

def get_sale(db: Session, sale_id: int):
    return db.query(models.Sale).filter(models.Sale.id == sale_id).first()

def get_sales(db: Session, skip: int = 0, limit: int = 100, category_id: Optional[int] = None):
    query = db.query(models.Sale).options(joinedload(models.Sale.product).joinedload(models.Product.category))

    if category_id is not None:
        query = query.join(models.Product).filter(models.Product.category_id == category_id)

    return query.offset(skip).limit(limit).all()

def create_sale(db: Session, sale: schemas.SaleCreate):
    product = get_product(db, sale.product_id)
    if not product:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Product with ID {sale.product_id} not found."
        )

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
        return db_sale
    except IntegrityError as e:
        db.rollback()
        logging.error(f"Database integrity error creating sale: {e}")
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Could not create sale due to database integrity issue."
        )
    except Exception as e:
        db.rollback()
        logging.error(f"Unexpected error creating sale: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="An unexpected error occurred while creating the sale."
        )

# ========= Dashboard CRUD ==========

def get_dashboard_summary(db: Session, category_id: Optional[int] = None):
    product_query = db.query(func.count(models.Product.id))
    if category_id is not None:
        product_query = product_query.filter(models.Product.category_id == category_id)
    total_products = product_query.scalar()

    sales_base_query = db.query(models.Sale).join(models.Product)
    if category_id is not None:
        sales_base_query = sales_base_query.filter(models.Product.category_id == category_id)

    total_sales_value = sales_base_query.with_entities(func.coalesce(func.sum(models.Sale.total_price), 0.0)).scalar()
    total_items_sold = sales_base_query.with_entities(func.coalesce(func.sum(models.Sale.quantity), 0)).scalar()
    average_sale_value = sales_base_query.with_entities(func.coalesce(func.avg(models.Sale.total_price), 0.0)).scalar()

    return {
        "registered_products": total_products or 0,
        "total_sales_value": float(total_sales_value),
        "total_items_sold": total_items_sold,
        "average_sale_value": float(average_sale_value)
    }

def get_all_sales_with_details(db: Session) -> List[models.Sale]:
    return db.query(models.Sale).options(
        joinedload(models.Sale.product).joinedload(models.Product.category)
    ).order_by(models.Sale.id).all() 