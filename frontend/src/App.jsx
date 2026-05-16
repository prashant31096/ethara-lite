import { BrowserRouter, Routes, Route, Navigate, useLocation } from 'react-router-dom'
import { useEffect } from 'react'
import PrivateRoute  from './components/PrivateRoute'
import AdminRoute    from './components/AdminRoute'
import LoginPage     from './pages/LoginPage'
import RegisterPage  from './pages/RegisterPage'
import UserPanel     from './pages/UserPanel'
import AdminPanel    from './pages/AdminPanel'
import ProjectsPage  from './pages/ProjectsPage'
import AccessDenied  from './pages/AccessDenied'
import useAuthStore  from './store/authStore'

function RouteTransition({ children }) {
  const location = useLocation()
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }, [location.pathname])
  return (
    <div key={location.pathname} className="page-enter">
      {children}
    </div>
  )
}

function AppRoutes() {
  const { fetchMe } = useAuthStore()
  useEffect(() => { fetchMe() }, [])

  return (
    <BrowserRouter>
      <RouteTransition>
        <Routes>
          {/* Public */}
          <Route path="/login"    element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />

          {/* User */}
          <Route path="/dashboard" element={
            <PrivateRoute><UserPanel /></PrivateRoute>
          } />
          
          <Route path="/projects" element={
            <PrivateRoute><ProjectsPage /></PrivateRoute>
          } />

          {/* Admin */}
          <Route path="/admin" element={
            <AdminRoute><AdminPanel /></AdminRoute>
          } />

          {/* 403 & fallbacks */}
          <Route path="/access-denied" element={<AccessDenied />} />
          <Route path="/"  element={<Navigate to="/dashboard" replace />} />
          <Route path="*"  element={<Navigate to="/dashboard" replace />} />
        </Routes>
      </RouteTransition>
    </BrowserRouter>
  )
}

export default AppRoutes
