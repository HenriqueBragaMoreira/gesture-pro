import csv
from sqlalchemy import create_engine, Column, Integer, String, Float, Date, ForeignKey
from sqlalchemy.orm import sessionmaker, relationship, declarative_base
from sqlalchemy.exc import IntegrityError
from datetime import datetime
import os

# --- Configuration ---
# DATABASE_URL = "sqlite:///database.db" # Original SQLite URL
DATABASE_URL = "postgresql://docker:docker@localhost:5432/docker"
# CSV_DIR = os.path.dirname(__file__) # Assumes CSVs are in the same directory as the script
SCRIPT_DIR = os.path.dirname(os.path.abspath(__file__))
DATA_DIR = os.path.join(SCRIPT_DIR, '..', 'data') # Go up one level, then into 'data'
CATEGORIES_CSV = os.path.join(DATA_DIR, 'categories.csv')
PRODUCTS_CSV = os.path.join(DATA_DIR, 'products.csv')
SALES_CSV = os.path.join(DATA_DIR, 'sales.csv')

# --- SQLAlchemy Setup ---
engine = create_engine(DATABASE_URL, echo=True) # Set echo=True for debugging SQL
Base = declarative_base()
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

# --- Database Models ---
class Category(Base):
    __tablename__ = "categories"
    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, unique=True, index=True)
    products = relationship("Product", back_populates="category")

class Product(Base):
    __tablename__ = "products"
    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, index=True)
    description = Column(String)
    price = Column(Float)
    category_id = Column(Integer, ForeignKey("categories.id"))
    brand = Column(String)
    category = relationship("Category", back_populates="products")
    sales = relationship("Sale", back_populates="product")

class Sale(Base):
    __tablename__ = "sales"
    id = Column(Integer, primary_key=True, index=True)
    product_id = Column(Integer, ForeignKey("products.id"))
    quantity = Column(Integer)
    total_price = Column(Float)
    date = Column(Date)
    product = relationship("Product", back_populates="sales")


# --- Seeding Functions ---
def seed_categories(session, filename=CATEGORIES_CSV):
    print(f"Seeding categories from {filename}...")
    count = 0
    with open(filename, mode='r', encoding='utf-8') as csvfile:
        reader = csv.DictReader(csvfile)
        for row in reader:
            try:
                category = Category(
                    id=int(row['id']),
                    name=row['name']
                )
                session.add(category)
                session.flush() # Flush to check for potential errors like duplicate IDs early
                count += 1
            except IntegrityError:
                session.rollback() # Rollback the specific failed insert
                print(f"  Skipping duplicate category ID: {row['id']}")
            except ValueError as e:
                session.rollback()
                print(f"  Skipping row due to data error: {row} - {e}")
            except Exception as e:
                session.rollback()
                print(f"  An unexpected error occurred for row {row}: {e}")
    session.commit() # Commit all successful inserts
    print(f"-> Categories seeded: {count}")

def seed_products(session, filename=PRODUCTS_CSV):
    print(f"Seeding products from {filename}...")
    count = 0
    with open(filename, mode='r', encoding='utf-8') as csvfile:
        reader = csv.DictReader(csvfile)
        for row in reader:
            try:
                product = Product(
                    id=int(row['id']),
                    name=row['name'],
                    description=row['description'],
                    price=float(row['price']),
                    category_id=int(row['category_id']),
                    brand=row['brand']
                )
                # Verify category exists
                if not session.get(Category, product.category_id):
                    print(f"  Skipping product ID {product.id}: Category ID {product.category_id} not found.")
                    continue

                session.add(product)
                session.flush()
                count += 1
            except IntegrityError:
                session.rollback()
                print(f"  Skipping duplicate product ID: {row['id']}")
            except ValueError as e:
                session.rollback()
                print(f"  Skipping row due to data error: {row} - {e}")
            except Exception as e:
                session.rollback()
                print(f"  An unexpected error occurred for row {row}: {e}")
    session.commit()
    print(f"-> Products seeded: {count}")

def seed_sales(session, filename=SALES_CSV):
    print(f"Seeding sales from {filename}...")
    count = 0
    with open(filename, mode='r', encoding='utf-8') as csvfile:
        reader = csv.DictReader(csvfile)
        for row in reader:
            try:
                sale = Sale(
                    id=int(row['id']),
                    product_id=int(row['product_id']),
                    quantity=int(row['quantity']),
                    total_price=float(row['total_price']),
                    date=datetime.strptime(row['date'], '%Y-%m-%d').date() # Parse date string
                )
                # Verify product exists
                if not session.get(Product, sale.product_id):
                     print(f"  Skipping sale ID {sale.id}: Product ID {sale.product_id} not found.")
                     continue

                session.add(sale)
                session.flush()
                count += 1
            except IntegrityError:
                session.rollback()
                print(f"  Skipping duplicate sale ID: {row['id']}")
            except ValueError as e:
                session.rollback()
                print(f"  Skipping row due to data error: {row} - {e}")
            except Exception as e:
                session.rollback()
                print(f"  An unexpected error occurred for row {row}: {e}")
    session.commit()
    print(f"-> Sales seeded: {count}")

# --- Main Execution ---
if __name__ == "__main__":
    print("Setting up database...")
    # Drop existing tables if they exist and recreate - useful for development seeding
    # Comment out these lines if you want to add data incrementally
    # Base.metadata.drop_all(bind=engine)
    # print("Existing tables dropped.")
    Base.metadata.create_all(bind=engine)
    print("Tables created (if they didn't exist).")

    db_session = SessionLocal()
    try:
        # Seed in order of dependency: Categories -> Products -> Sales
        seed_categories(db_session)
        seed_products(db_session)
        seed_sales(db_session)
        print("Database seeding completed successfully!")

        # --- Verification Query ---
        print("Verifying data insertion...")
        category_count = db_session.query(Category).count()
        product_count = db_session.query(Product).count()
        sale_count = db_session.query(Sale).count()
        print(f"  Categories found in DB session: {category_count}")
        print(f"  Products found in DB session: {product_count}")
        print(f"  Sales found in DB session: {sale_count}")
        # --- End Verification ---

    except Exception as e:
        print(f"An error occurred during seeding: {e}")
        db_session.rollback()
    finally:
        db_session.close()
        print("Database session closed.") 