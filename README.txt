================================================================================
                                 ETHARA LITE
================================================================================

Ethara Lite is a streamlined, professional task and project management 
application designed to help teams organize workflows, assign workers, and 
track project statuses efficiently. 

The application utilizes a decoupled architecture, separating the client-side 
user interface from the server-side API, ensuring high performance, scalability, 
and a seamless user experience.

--------------------------------------------------------------------------------
1. PROJECT OVERVIEW
--------------------------------------------------------------------------------

Key Features:
* Role-Based Access Control: Secure authentication system with support for both 
  Admin and Standard User roles.
* Project Tracking: Create, update, and monitor the status of various projects.
* Worker Assignment: Admins and project managers can dynamically assign team 
  members to specific projects.
* User Profiles: Support for team member profiles, designations, and dynamic 
  avatar generation.
* RESTful API: Fully documented backend API handling business logic securely.

--------------------------------------------------------------------------------
2. TECHNOLOGY STACK
--------------------------------------------------------------------------------

Frontend (Client):
* React.js (Bootstrapped with Vite)
* Axios for HTTP client requests
* Hosted on: Vercel (https://ethara-lite.vercel.app)

Backend (API Server):
* Python / Django Rest Framework
* SQLite (Local) / PostgreSQL (Production ready)
* Hosted on: Railway (https://ethara-lite-production.up.railway.app)

--------------------------------------------------------------------------------
3. LOCAL DEVELOPMENT SETUP
--------------------------------------------------------------------------------

Prerequisites:
- Python 3.10+
- Node.js 18+ & npm
- Git

A. Backend Setup (Django)
1. Navigate to the backend directory:
   cd backend
2. Create and activate a virtual environment:
   python -m venv venv
   (Windows): .\venv\Scripts\activate
   (Mac/Linux): source venv/bin/activate
3. Install Python dependencies:
   pip install -r requirements.txt
4. Run database migrations:
   python manage.py migrate
5. Start the development server:
   python manage.py runserver
   (The backend will be available at http://127.0.0.1:8000)

B. Frontend Setup (React/Vite)
1. Navigate to the frontend directory:
   cd frontend
2. Install Node modules:
   npm install
3. Configure Environment Variables:
   Create a .env file in the frontend folder and add:
   VITE_API_BASE_URL=http://127.0.0.1:8000/api
4. Start the development server:
   npm run dev
   (The frontend will be available at http://localhost:5173)

--------------------------------------------------------------------------------
4. DEPLOYMENT ARCHITECTURE
--------------------------------------------------------------------------------

The application is fully containerized and cloud-ready. 
- The backend is configured to use Gunicorn and is deployed seamlessly via 
  Railway using the specified Procfile/Start Command.
- The frontend is configured for Single Page Application (SPA) routing using a 
  vercel.json configuration file.

--------------------------------------------------------------------------------
5. LICENSE & USAGE
--------------------------------------------------------------------------------
This project is proprietary and intended for authorized team use. 

================================================================================
