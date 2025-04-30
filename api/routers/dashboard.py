from fastapi import APIRouter, Depends
from fastapi.responses import StreamingResponse # Import StreamingResponse
from typing import List, Optional # Optional might be needed
from sqlalchemy.orm import Session
from datetime import datetime # Import datetime
from collections import defaultdict # Import defaultdict for grouping
from decimal import Decimal # Import Decimal
import csv # Import csv
import io # Import io

from .. import crud, models, schemas # Use relative imports
from ..database import get_db # Use relative import

router = APIRouter(
    tags=["Dashboard"]
)

# Use the updated response model
@router.get("/dashboard", response_model=schemas.DashboardSummary, summary="Get KPIs and detailed sales data grouped by month, optionally filtered by Category ID")
def get_dashboard_data_with_sales(
    db: Session = Depends(get_db),
    category_id: Optional[int] = None # Add category_id query parameter
):
    """
    Retrieves key performance indicators (KPIs) and detailed sales information.
    Optionally filters all returned data by the specified **category_id**.

    - **category_id** (Query Parameter, Optional): ID of the category to filter by.
    - **registered_products**: Total number of products (filtered if category_id is provided).
    - **total_sales_value**: Sum of 'total_price' for sales (filtered if category_id is provided).
    - **total_items_sold**: Sum of 'quantity' for sales (filtered if category_id is provided).
    - **average_sale_value**: Average 'total_price' across sales (filtered if category_id is provided).
    - **sales_by_month**: List of monthly sales summaries (filtered if category_id is provided, limited results).
    """
    # Fetch summary data, passing category_id
    summary_data = crud.get_dashboard_summary(db, category_id=category_id)

    # Fetch detailed sales data, passing category_id
    sales_details = crud.get_sales(db, limit=1000, category_id=category_id)

    # Group sales by month
    sales_grouped_by_month = defaultdict(lambda: {"total_value": Decimal("0.0"), "total_items": 0, "details": []})

    for sale in sales_details:
        month_abbr = sale.date.strftime('%b') # Get month abbreviation (e.g., 'Jan')
        month_group = sales_grouped_by_month[month_abbr]
        
        month_group["total_value"] += sale.total_price
        month_group["total_items"] += sale.quantity
        month_group["details"].append(sale) # Append the original Sale object (or SaleWithProductInfo if needed)

    # Convert grouped data into the list of MonthlySalesSummary objects
    monthly_summaries = []
    for month, data in sales_grouped_by_month.items():
        monthly_summaries.append(
            schemas.MonthlySalesSummary(
                month=month,
                monthly_total_sales_value=data["total_value"],
                monthly_total_items_sold=data["total_items"],
                sales_details=data["details"] # Pass the list of detailed sales
            )
        )
        
    # Sort monthly summaries if needed, e.g., by month order (optional)
    # This requires converting month abbreviations back to sortable format
    try:
        monthly_summaries.sort(key=lambda x: datetime.strptime(x.month, '%b'))
    except ValueError: # Handle cases where month name might be incorrect (shouldn't happen with strftime)
        pass # Or log a warning

    # Combine overall summary results with monthly grouped sales
    return {
        "registered_products": summary_data["registered_products"],
        "total_sales_value": summary_data["total_sales_value"], # Overall total
        "total_items_sold": summary_data["total_items_sold"],       # Overall total
        "average_sale_value": summary_data["average_sale_value"],   # Overall average
        "sales_by_month": monthly_summaries # Use the processed list of monthly summaries
    }

@router.get("/export-csv/sales_with_products", summary="Export all sales data with product details as CSV")
def export_sales_data_csv(db: Session = Depends(get_db)):
    """
    Exports all sales data, including related product and category information,
    as a CSV file suitable for download.
    """
    sales_data = crud.get_all_sales_with_details(db)

    output = io.StringIO()
    writer = csv.writer(output)

    # Define header row based on combined data
    header = [
        'sale_id', 'product_id', 'product_name', 'product_description',
        'product_price', 'product_brand', 'category_id', 'category_name',
        'quantity', 'total_price', 'date'
    ]
    writer.writerow(header)

    # Write data rows
    for sale in sales_data:
        if sale.product and sale.product.category: # Ensure related objects exist
            row = [
                sale.id,
                sale.product_id,
                sale.product.name,
                sale.product.description,
                sale.product.price, # This is Decimal from DB
                sale.product.brand,
                sale.product.category.id,
                sale.product.category.name,
                sale.quantity,
                sale.total_price, # This is Decimal from DB
                sale.date.strftime('%Y-%m-%d') if sale.date else '' # Format date
            ]
            writer.writerow(row)
        # else: Log or handle sales with missing product/category info if necessary

    output.seek(0)
    return StreamingResponse(
        output,
        media_type="text/csv",
        headers={ "Content-Disposition": "attachment; filename=sales_with_products.csv" }
    ) 