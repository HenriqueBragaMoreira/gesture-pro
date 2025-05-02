-- Table: categories
CREATE TABLE categories (
    id SERIAL PRIMARY KEY,  -- Auto-incrementing integer primary key
    name VARCHAR(255) UNIQUE NOT NULL, -- Category name, must be unique and cannot be empty
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP, -- Add created_at
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP -- Add updated_at
);

-- Table: products
CREATE TABLE products (
    id SERIAL PRIMARY KEY, -- Auto-incrementing integer primary key
    name VARCHAR(255) NOT NULL, -- Product name, cannot be empty
    description TEXT, -- Product description, can be empty
    price DECIMAL(10, 2) NOT NULL CHECK (price >= 0), -- Product price, must be non-negative
    category_id INT NOT NULL, -- Foreign key linking to the categories table
    brand VARCHAR(100), -- Product brand, can be empty
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP, -- Add created_at
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP, -- Add updated_at
    FOREIGN KEY (category_id) REFERENCES categories (id) ON DELETE RESTRICT -- Ensure category exists, prevent deleting categories with products
);

-- Table: sales
CREATE TABLE sales (
    id SERIAL PRIMARY KEY, -- Auto-incrementing integer primary key
    product_id INT NOT NULL, -- Foreign key linking to the products table
    quantity INT NOT NULL CHECK (quantity > 0), -- Quantity sold, must be positive
    total_price DECIMAL(12, 2) NOT NULL CHECK (total_price >= 0), -- Total price for this sale item, must be non-negative
    date TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP, -- Date and time of the sale, defaults to the time of insertion
    FOREIGN KEY (product_id) REFERENCES products (id) ON DELETE RESTRICT -- Ensure product exists, prevent deleting products with sales history
);

-- Optional: Add indexes for frequently queried columns, especially foreign keys
CREATE INDEX idx_products_category_id ON products (category_id);
CREATE INDEX idx_sales_product_id ON sales (product_id);
CREATE INDEX idx_sales_date ON sales (date); 