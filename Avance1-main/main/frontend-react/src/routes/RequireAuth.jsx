import { Navigate, Outlet, useLocation } from 'react-router-dom'
import { useAuth } from '../state/AuthContext.jsx'

export default function RequireAuth() {
  const { loading, isAuthenticated } = useAuth()
  const location = useLocation()

  if (loading) {
    return (
      <div className="auth-screen">
        <div className="auth-box">
          <h1>Cargando…</h1>
        </div>
      </div>
    )
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace state={{ from: location.pathname }} />
  }

  return <Outlet />
}
