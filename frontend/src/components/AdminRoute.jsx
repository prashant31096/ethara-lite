import { Navigate } from 'react-router-dom'
import useAuthStore from '../store/authStore'

export default function AdminRoute({ children }) {
  const { user, loading } = useAuthStore()
  if (loading) return (
    <div className="loading-full">
      <div className="spinner" />
    </div>
  )
  if (!user) return <Navigate to="/login" replace />
  if (!user.is_admin) return <Navigate to="/access-denied" replace />
  return children
}
