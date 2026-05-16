import { Link } from 'react-router-dom'
import useAuthStore from '../store/authStore'
import Navbar from '../components/Navbar'

export default function AccessDenied() {
  const { user } = useAuthStore()
  return (
    <div className="page-layout">
      <Navbar />
      <main className="main-content" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div className="card" style={{ textAlign: 'center', maxWidth: 400, padding: '48px 32px' }}>
          <div style={{ fontSize: 56, marginBottom: 16 }}>🚫</div>
          <h1 className="page-title" style={{ fontSize: 28, marginBottom: 8 }}>Access Denied</h1>
          <p style={{ color: 'var(--text-secondary)', marginBottom: 24 }}>
            You don't have permission to view this page.
          </p>
          <Link to="/dashboard" className="btn btn-primary">← Back to Dashboard</Link>
        </div>
      </main>
    </div>
  )
}
