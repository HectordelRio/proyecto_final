import { Navigate, Route, Routes } from 'react-router-dom'
import Login from './pages/Login.jsx'
import Register from './pages/Register.jsx'
import Dashboard from './pages/Dashboard.jsx'
import ActivityDetail from './pages/ActivityDetail.jsx'
import AdminUsers from './pages/AdminUsers.jsx'
import RequireAuth from './routes/RequireAuth.jsx'
import RequireRole from './routes/RequireRole.jsx'

export default function App() {
  return (
    <Routes>
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />

      <Route element={<RequireAuth />}>
        <Route path="/" element={<Dashboard />} />
        <Route path="/activities/:id" element={<ActivityDetail />} />
        <Route
          path="/admin/users"
          element={
            <RequireRole role="admin">
              <AdminUsers />
            </RequireRole>
          }
        />
      </Route>

      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  )
}
