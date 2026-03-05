import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { useAuth } from '../state/AuthContext.jsx'
import { apiFetch } from '../utils/apiFetch.js'

export default function AdminUsers() {
  const { token } = useAuth()
  const [users, setUsers] = useState([])
  const [message, setMessage] = useState('')
  const [type, setType] = useState('')

  useEffect(() => {
    apiFetch('/api/users', { token })
      .then((data) => setUsers(Array.isArray(data) ? data : []))
      .catch((err) => {
        setType('error')
        setMessage(err.message || 'Error cargando usuarios')
      })
  }, [token])

  return (
    <div className="main-screen" style={{ width: '100%' }}>
      <nav className="navbar">
        <h1>Admin: Usuarios</h1>
        <div className="nav-actions">
          <Link className="btn btn-secondary" to="/">Volver</Link>
        </div>
      </nav>
      <main className="main-content">
        <section className="section">
          <div className={`message ${type}`}>{message}</div>
          <div className="grid">
            {users.map((u) => (
              <div className="card" key={u._id}>
                <p><strong>Usuario:</strong> {u.username}</p>
                <p><strong>Email:</strong> {u.email}</p>
                <p><strong>Rol:</strong> {u.role}</p>
              </div>
            ))}
          </div>
        </section>
      </main>
    </div>
  )
}
