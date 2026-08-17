# Sales Analytics Dashboard

This project is a full-stack demo: React (Vite) frontend, Flask backend, MySQL data.

Quick start

1. Backend

```bash
python -m venv .venv
.venv/Scripts/activate
pip install -r sales-dashboard/backend/requirements.txt
# configure DB creds via env vars if needed
python sales-dashboard/backend/seed.py
set DB_HOST=127.0.0.1
set DB_USER=root
set DB_PASSWORD=yourpass
set DB_NAME=sales_analytics
python sales-dashboard/backend/app.py
```

2. Frontend

```bash
cd sales-dashboard/frontend
npm install
npm run dev
```

Filters: use the date range and category dropdown at top, click Apply to refresh all charts.

Notes
- Seed script creates the `sales_analytics` database and inserts sample data.
- Backend endpoints are under `/api/*` and support `?from=YYYY-MM-DD&to=YYYY-MM-DD&category=Name`.

If you want, I can run the seed and start the backend here, or create a short screen recording guide.
