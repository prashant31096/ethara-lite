# Ethara Lite ⚡

A streamlined, lightweight, production-ready version of Ethara built with pure Django and Vite React.

**Key Features:**
- No Docker required (runs directly on host)
- SQLite database (zero configuration)
- Backend: Django + Django REST Framework + Simple JWT
- Frontend: React + Vite + Zustand (Proxy to Django)
- Glassmorphism UI with beautiful purple aesthetics

---

## 1. Backend Setup

```bash
cd backend
python -m venv venv
source venv/bin/activate
pip install -r requirements.txt
python manage.py migrate

# Create a super admin user
python manage.py createsuperuser

# Start the Django server (defaults to port 8000)
python manage.py runserver
```

## 2. Frontend Setup

In a new terminal window:

```bash
cd frontend
npm install

# Start the Vite development server
npm run dev
```

Visit `http://localhost:5173` in your browser.

---

## Production Deployment

### Backend (Railway / Render / Heroku)
1. Set up a new Web Service pointing to the `backend` folder.
2. The `Procfile` is already configured (`web: gunicorn core.wsgi --bind 0.0.0.0:$PORT --workers 2`).
3. Set environment variables:
   - `SECRET_KEY`
   - `DEBUG=False`
   - `ALLOWED_HOSTS=your-app.up.railway.app`
   - `CORS_ALLOWED_ORIGINS=https://your-frontend.vercel.app`

### Frontend (Vercel / Netlify / GitHub Pages)
1. Point a new project to the `frontend` directory.
2. Build command: `npm run build`
3. Publish directory: `dist`
4. Make sure to update the `api/axios.js` base URL to point to your live backend domain instead of `/api/auth` if they are hosted on different domains.
