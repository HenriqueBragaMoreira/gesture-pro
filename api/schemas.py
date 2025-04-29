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
class ProductBaseApiInput(BaseModel):
    # Base schema for API input, accepting price as string
    name: str
    description: Optional[str] = None
    price: str
    brand: Optional[str] = None

class ProductCreateApiInput(ProductBaseApiInput):
    # Schema for creating a product via API
    category_id: int

class ProductBaseDb(BaseModel):
    # Base schema for internal use / DB interaction, using float price
    name: str
    description: Optional[str] = None
    price: float
    brand: Optional[str] = None

class ProductCreateInternal(ProductBaseDb):
    # Schema for passing data to the CRUD layer
    category_id: int

class Product(ProductBaseDb):
    # Schema for API output, inheriting float price from ProductBaseDb
    id: int
    category: Category

    class Config:
        from_attributes = True

# Schema for the paginated list response
class ProductListResponse(BaseModel):
    products: List[Product]
    totalProducts: int


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