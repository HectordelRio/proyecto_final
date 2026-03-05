import { useState } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { useAuth } from '../state/AuthContext.jsx'

export default function Login() {
  const { login } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()

  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [message, setMessage] = useState('')
  const [type, setType] = useState('')
  const [busy, setBusy] = useState(false)

  async function onSubmit(e) {
    e.preventDefault()
    setMessage('')
    setType('')
    setBusy(true)
    try {
      await login(username.trim(), password)
      const target = (location.state && location.state.from) || '/' 
      navigate(target, { replace: true })
    } catch (err) {
      setType('error')
      setMessage(err.message || 'Error en login')
    } finally {
      setBusy(false)
    }
  }

  return (
    <div className="container">
      <div className="auth-screen">
        <div className="auth-box">
          <h1>Iniciar Sesión</h1>
          <form onSubmit={onSubmit}>
            <div className="form-group">
              <label>Usuario</label>
              <input value={username} onChange={(e) => setUsername(e.target.value)} required />
            </div>
            <div className="form-group">
              <label>Contraseña</label>
              <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} required />
            </div>
            <button className="btn btn-primary" type="submit" disabled={busy}>
              {busy ? 'Ingresando…' : 'Iniciar Sesión'}
            </button>
          </form>
          <p className="toggle-text">
            ¿No tienes cuenta? <Link className="link" to="/register">Regístrate</Link>
          </p>
          <div className={`message ${type}`}>{message}</div>
        </div>
      </div>
    </div>
  )
}
