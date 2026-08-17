from flask import Flask, jsonify, request
from flask_cors import CORS
import os
import mysql.connector

app = Flask(__name__)
CORS(app)


@app.route('/')
def home():
    return jsonify({
        'message': 'Sales Analytics API is running'
    })


DB_CONFIG = {
    'host': os.environ.get('DB_HOST', '127.0.0.1'),
    'port': int(os.environ.get('DB_PORT', 3306)),
    'user': os.environ.get('DB_USER', 'root'),
    'password': os.environ.get('DB_PASSWORD', 'root'),
    'database': os.environ.get('DB_NAME', 'sales_analytics'),
    'autocommit': True,
}


def get_conn():
    return mysql.connector.connect(**DB_CONFIG)


def apply_filters(base_where, params):
    from_date = request.args.get('from')
    to_date = request.args.get('to')
    category = request.args.get('category')

    if from_date:
        base_where.append("s.sold_on >= %s")
        params.append(from_date)

    if to_date:
        base_where.append("s.sold_on <= %s")
        params.append(to_date)

    if category and category != "All":
        base_where.append("c.name = %s")
        params.append(category)


@app.route('/api/kpis')
def kpis():
    conn = get_conn()
    cur = conn.cursor(dictionary=True)

    cur.execute("""
        SELECT
            SUM(total_amount) AS total_revenue,
            COUNT(*) AS total_orders
        FROM sales
    """)

    row = cur.fetchone()

    total_revenue = float(row['total_revenue'] or 0)
    total_orders = int(row['total_orders'] or 0)
    avg_order = total_revenue / total_orders if total_orders else 0

    cur.execute("""
        SELECT
            p.name,
            SUM(s.quantity) AS units_sold
        FROM sales s
        JOIN products p ON s.product_id = p.id
        GROUP BY p.id, p.name
        ORDER BY units_sold DESC
        LIMIT 1
    """)

    best = cur.fetchone()

    best_product = {
        'name': best['name'],
        'units_sold': int(best['units_sold'])
    } if best else {
        'name': None,
        'units_sold': 0
    }

    cur.close()
    conn.close()

    return jsonify({
        'total_revenue': total_revenue,
        'total_orders': total_orders,
        'average_order_value': round(avg_order, 2),
        'best_selling_product': best_product
    })

@app.route('/api/sales/monthly')
def monthly():
    where = []
    params = []

    apply_filters(where, params)

    where_clause = (
        'WHERE ' + ' AND '.join(where)
        if where else ''
    )

    query = f"""
        SELECT
            DATE_FORMAT(s.sold_on, '%b %Y') AS month,
            SUM(s.total_amount) AS revenue
        FROM sales s
        JOIN products p ON s.product_id = p.id
        JOIN categories c ON p.category_id = c.id
        {where_clause}
        GROUP BY
            DATE_FORMAT(s.sold_on, '%b %Y'),
            YEAR(s.sold_on),
            MONTH(s.sold_on)
        ORDER BY
            YEAR(s.sold_on),
            MONTH(s.sold_on)
    """

    conn = get_conn()
    cur = conn.cursor(dictionary=True)

    cur.execute(query, tuple(params))

    rows = []

    for row in cur.fetchall():
        rows.append({
            'month': row['month'],
            'revenue': float(row['revenue'] or 0)
        })

    cur.close()
    conn.close()

    return jsonify(rows)


@app.route('/api/sales/by-category')
def by_category():
    where = []
    params = []

    apply_filters(where, params)

    where_clause = 'WHERE ' + ' AND '.join(where) if where else ''

    query = f"""
        SELECT
            c.name AS category,
            SUM(s.total_amount) AS revenue
        FROM sales s
        JOIN products p ON s.product_id = p.id
        JOIN categories c ON p.category_id = c.id
        {where_clause}
        GROUP BY c.name
        ORDER BY revenue DESC
    """

    conn = get_conn()
    cur = conn.cursor(dictionary=True)

    cur.execute(query, tuple(params))

    rows = []

    for row in cur.fetchall():
        rows.append({
            'category': row['category'],
            'revenue': float(row['revenue'] or 0)
        })

    cur.close()
    conn.close()

    return jsonify(rows)


@app.route('/api/sales/by-region')
def by_region():
    where = []
    params = []

    apply_filters(where, params)

    where_clause = 'WHERE ' + ' AND '.join(where) if where else ''

    query = f"""
        SELECT
            s.region,
            SUM(s.total_amount) AS revenue
        FROM sales s
        JOIN products p ON s.product_id = p.id
        JOIN categories c ON p.category_id = c.id
        {where_clause}
        GROUP BY s.region
        ORDER BY revenue DESC
    """

    conn = get_conn()
    cur = conn.cursor(dictionary=True)

    cur.execute(query, tuple(params))

    rows = []

    for row in cur.fetchall():
        rows.append({
            'region': row['region'],
            'revenue': float(row['revenue'] or 0)
        })

    cur.close()
    conn.close()

    return jsonify(rows)


@app.route('/api/sales/top-products')
def top_products():
    where = []
    params = []

    apply_filters(where, params)

    where_clause = 'WHERE ' + ' AND '.join(where) if where else ''

    query = f"""
        SELECT
            p.id,
            p.name,
            c.name AS category,
            SUM(s.quantity) AS units_sold,
            SUM(s.total_amount) AS revenue
        FROM sales s
        JOIN products p ON s.product_id = p.id
        JOIN categories c ON p.category_id = c.id
        {where_clause}
        GROUP BY p.id, p.name, c.name
        ORDER BY revenue DESC
        LIMIT 5
    """

    conn = get_conn()
    cur = conn.cursor(dictionary=True)

    cur.execute(query, tuple(params))

    rows = []

    for row in cur.fetchall():
        rows.append({
            'id': row['id'],
            'name': row['name'],
            'category': row['category'],
            'units_sold': int(row['units_sold'] or 0),
            'revenue': float(row['revenue'] or 0)
        })

    cur.close()
    conn.close()

    return jsonify(rows)


@app.route('/api/sales/filter')
def sales_filter():
    where = []
    params = []

    apply_filters(where, params)

    where_clause = 'WHERE ' + ' AND '.join(where) if where else ''

    query = f"""
        SELECT
            SUM(s.total_amount) AS revenue,
            COUNT(*) AS orders,
            SUM(s.quantity) AS units
        FROM sales s
        JOIN products p ON s.product_id = p.id
        JOIN categories c ON p.category_id = c.id
        {where_clause}
    """

    conn = get_conn()
    cur = conn.cursor(dictionary=True)

    cur.execute(query, tuple(params))

    row = cur.fetchone()

    revenue = float(row['revenue'] or 0)
    orders = int(row['orders'] or 0)
    avg_order = revenue / orders if orders else 0

    cur.close()
    conn.close()

    return jsonify({
        'revenue': revenue,
        'orders': orders,
        'units': int(row['units'] or 0),
        'average_order_value': round(avg_order, 2)
    })


if __name__ == '__main__':
    app.run(
        host='0.0.0.0',
        port=5000,
        debug=True
    )