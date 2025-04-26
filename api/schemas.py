from pydantic import BaseModel
from typing import List, Optional
from datetime import datetime

# ========= Category Schemas =========
class CategoryBase(BaseModel):
    name: str

class CategoryCreate(CategoryBase):
    pass

class Category(CategoryBase):
    id: int

    class Config:
        from_attributes = True # Changed from orm_mode = True in Pydantic v2


# ========= Product Schemas =========
class ProductBase(BaseModel):
    name: str
    description: Optional[str] = None
    price: float
    category_id: int
    brand: Optional[str] = None

class ProductCreate(ProductBase):
    pass

class Product(ProductBase):
    id: int

    class Config:
        from_attributes = True


# ========= Sale Schemas =========
class SaleBase(BaseModel):
    product_id: int
    quantity: int

class SaleCreate(SaleBase):
    pass

class Sale(SaleBase):
    id: int
    total_price: float # or Decimal, if preferred for precision in API response
    date: datetime # Import datetime if not already imported

    class Config:
        from_attributes = True

# ========= Combined Schema for Listing Sales with Product Info and Profit =========
class SaleWithProductInfo(Sale):
    product: Product 
    # Note: Profit calculation logic needs adjustment as purchase_price/sale_price removed 