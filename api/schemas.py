from pydantic import BaseModel
from typing import List, Optional
from datetime import datetime

# ========= Category Schemas =========
class CategoryBase(BaseModel):
    name: str

class CategoryCreate(CategoryBase):
    pass

# Schema for full category details (used in GET /categories)
class Category(CategoryBase):
    id: int
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True

# NEW: Schema for nested category representation (ID and Name only)
class CategoryNested(BaseModel):
    id: int
    name: str

    class Config:
        from_attributes = True

class CategoryUpdate(BaseModel):
    name: str

# Schema for the paginated list response for categories
class CategoriesListResponse(BaseModel):
    categories: List[Category] # Uses the full Category schema
    total: int


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
    id: int
    category: CategoryNested # CHANGED: Use CategoryNested here

    class Config:
        from_attributes = True

# Schema for the paginated list response
class ProductListResponse(BaseModel):
    products: List[Product] # Will now use Product schema with CategoryNested
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

# ========= Schema for Monthly Aggregated Sales =========
class MonthlySalesSummary(BaseModel):
    month: str  # Ex: "Jan", "Feb"
    monthly_total_sales_value: float
    monthly_total_items_sold: int
    sales_details: List[SaleWithProductInfo] # Detailed sales for this month

    class Config:
        from_attributes = True

# ========= Dashboard Schema =========
class DashboardSummary(BaseModel):
    registered_products: int
    total_sales_value: Optional[float] = 0.0 # Overall total
    total_items_sold: Optional[int] = 0    # Overall total
    average_sale_value: Optional[float] = 0.0 # Overall average
    sales_by_month: List[MonthlySalesSummary] # Changed from sales_with_info to sales_by_month

    class Config:
        from_attributes = True # For potential future use with ORM objects 