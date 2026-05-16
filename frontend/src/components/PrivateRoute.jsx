import { Navigate } from 'react-router-dom'
import useAuthStore from '../store/authStore'

export default function PrivateRoute({ children }) {
  const { user, loading } = useAuthStore()
  if (loading) return (
    <div className="loading-full">
      <div className="spinner" />
    </div>
  )
  return user ? children : <Navigate to="/login" replace />
}
