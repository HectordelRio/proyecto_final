import { Navigate } from 'react-router-dom'
import { useAuth } from '../state/AuthContext.jsx'

export default function RequireRole({ role, children }) {
  const { role: currentRole } = useAuth()
  if (!role) return children
  if (currentRole !== role) return <Navigate to="/" replace />
  return children
}
