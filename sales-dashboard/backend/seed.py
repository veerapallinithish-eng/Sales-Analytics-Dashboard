import mysql.connector
import os
import random
from datetime import date, timedelta

DB_CONFIG = {
    'host': os.environ.get('DB_HOST', '127.0.0.1'),
    'port': int(os.environ.get('DB_PORT', 3306)),
    'user': os.environ.get('DB_USER', 'root'),
    'password': os.environ.get('DB_PASSWORD', 'rootpython app.py'),
}

DB_NAME = os.environ.get('DB_NAME', 'sales_analytics')

CATEGORIES = ['Electronics', 'Clothing', 'Food', 'Books', 'Sports']
PRODUCTS = {
    'Electronics': ['Smartphone', 'Laptop', 'Headphones', 'Camera'],
    'Clothing': ['T-Shirt', 'Jeans', 'Jacket'],
    'Food': ['Coffee', 'Chocolate', 'Pasta'],
    'Books': ['Novel', 'Cookbook', 'Children Book'],
    'Sports': ['Football', 'Tennis Racket', 'Running Shoes']
}
REGIONS = ['North', 'South', 'East', 'West']

def connect(root_db=False):
    cfg = DB_CONFIG.copy()
    if not root_db:
        cfg['database'] = DB_NAME
    return mysql.connector.connect(**cfg)

def create_database():
    conn = connect(root_db=True)
    cur = conn.cursor()
    cur.execute(f"CREATE DATABASE IF NOT EXISTS {DB_NAME}")
    cur.close()
    conn.close()

def create_tables():
    conn = connect()
    cur = conn.cursor()
    cur.execute("""
    CREATE TABLE IF NOT EXISTS categories (
        id INT AUTO_INCREMENT PRIMARY KEY,
        name VARCHAR(50) NOT NULL
    )
    """)
    cur.execute("""
    CREATE TABLE IF NOT EXISTS products (
        id INT AUTO_INCREMENT PRIMARY KEY,
        name VARCHAR(100) NOT NULL,
        category_id INT NOT NULL,
        price DECIMAL(10,2) NOT NULL,
        FOREIGN KEY (category_id) REFERENCES categories(id)
    )
    """)
    cur.execute("""
    CREATE TABLE IF NOT EXISTS sales (
        id INT AUTO_INCREMENT PRIMARY KEY,
        product_id INT NOT NULL,
        quantity INT NOT NULL,
        total_amount DECIMAL(10,2) NOT NULL,
        sold_on DATE NOT NULL,
        region VARCHAR(50) NOT NULL,
        FOREIGN KEY (product_id) REFERENCES products(id)
    )
    """)
    cur.close()
    conn.close()

def seed():
    conn = connect()
    cur = conn.cursor()
    # categories
    cur.execute("DELETE FROM sales")
    cur.execute("DELETE FROM products")
    cur.execute("DELETE FROM categories")
    cur.execute("ALTER TABLE categories AUTO_INCREMENT = 1")
    cur.execute("ALTER TABLE products AUTO_INCREMENT = 1")
    cur.execute("ALTER TABLE sales AUTO_INCREMENT = 1")

    cat_ids = {}
    for name in CATEGORIES:
        cur.execute("INSERT INTO categories (name) VALUES (%s)", (name,))
        cat_ids[name] = cur.lastrowid

    prod_ids = []
    for cat, items in PRODUCTS.items():
        for item in items:
            price = round(random.uniform(5, 1200), 2)
            cur.execute("INSERT INTO products (name, category_id, price) VALUES (%s, %s, %s)", (item, cat_ids[cat], price))
            prod_ids.append({'id': cur.lastrowid, 'price': price, 'category': cat})

    # generate 120 sales over last 12 months
    today = date.today()
    start_date = today - timedelta(days=365)
    for _ in range(120):
        prod = random.choice(prod_ids)
        qty = random.randint(1, 5)
        sold_on = start_date + timedelta(days=random.randint(0, 365))
        region = random.choice(REGIONS)
        total_amount = round(prod['price'] * qty, 2)
        cur.execute("INSERT INTO sales (product_id, quantity, total_amount, sold_on, region) VALUES (%s,%s,%s,%s,%s)",
                    (prod['id'], qty, total_amount, sold_on, region))

    conn.commit()
    cur.close()
    conn.close()
    print('Seeding complete')

if __name__ == '__main__':
    create_database()
    create_tables()
    seed()
