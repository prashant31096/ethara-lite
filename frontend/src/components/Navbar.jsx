import { Link, useNavigate, useLocation } from 'react-router-dom'
import useAuthStore from '../store/authStore'

export default function Navbar() {
  const { user, logout } = useAuthStore()
  const navigate = useNavigate()
  const location = useLocation()

  const handleLogout = () => {
    logout()
    navigate('/login')
  }

  const initials = user
    ? ((user.first_name?.[0] || '') + (user.last_name?.[0] || '')) || user.username?.[0]?.toUpperCase()
    : '?'

  const isActive = (path) => location.pathname === path

  return (
    <nav className="navbar">
      <div className="navbar-inner">
        {/* Brand */}
        <Link to="/dashboard" className="navbar-brand">
          <span className="brand-icon">⚡</span>
          <span className="brand-name">Ethara<span className="brand-lite">Lite</span></span>
        </Link>

        {/* Nav Links */}
        <div className="navbar-links">
          <Link to="/dashboard" className={`nav-link ${isActive('/dashboard') ? 'active' : ''}`}>
            Dashboard
          </Link>
          <Link to="/projects" className={`nav-link ${isActive('/projects') ? 'active' : ''}`}>
            Projects
          </Link>
          {user?.is_admin && (
            <Link to="/admin" className={`nav-link ${isActive('/admin') ? 'active' : ''}`}>
              Admin Panel
            </Link>
          )}
        </div>

        {/* User area */}
        <div className="navbar-user">
          <Link to="/dashboard" className="avatar-btn" title={user?.username}>
            <div
              className="avatar"
              style={{ background: user?.profile?.avatar_color || '#7c3aed' }}
            >
              {initials}
            </div>
          </Link>
          <div className="user-info">
            <span className="user-name">{user?.first_name || user?.username}</span>
            <span className="user-role">{user?.is_admin ? '★ Admin' : 'User'}</span>
          </div>
          <button className="btn btn-ghost btn-sm" onClick={handleLogout} id="logout-btn">
            Logout
          </button>
        </div>
      </div>
    </nav>
  )
}
