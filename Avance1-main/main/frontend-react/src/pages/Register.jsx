import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { apiFetch } from '../utils/apiFetch.js'

export default function Register() {
  const navigate = useNavigate()
  const [username, setUsername] = useState('')
  const [email, setEmail] = useState('')
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
      await apiFetch('/api/auth/register', {
        method: 'POST',
        body: { username: username.trim(), email: email.trim(), password },
      })
      setType('success')
      setMessage('Registro exitoso. Ahora inicia sesión.')
      setTimeout(() => navigate('/login', { replace: true }), 900)
    } catch (err) {
      setType('error')
      setMessage(err.message || 'Error en registro')
    } finally {
      setBusy(false)
    }
  }

  return (
    <div className="container">
      <div className="auth-screen">
        <div className="auth-box">
          <h1>Crear Cuenta</h1>
          <form onSubmit={onSubmit}>
            <div className="form-group">
              <label>Usuario</label>
              <input value={username} onChange={(e) => setUsername(e.target.value)} required />
            </div>
            <div className="form-group">
              <label>Email</label>
              <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} required />
            </div>
            <div className="form-group">
              <label>Contraseña</label>
              <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} required />
            </div>
            <button className="btn btn-primary" type="submit" disabled={busy}>
              {busy ? 'Registrando…' : 'Registrarse'}
            </button>
          </form>
          <p className="toggle-text">
            ¿Ya tienes cuenta? <Link className="link" to="/login">Inicia Sesión</Link>
          </p>
          <div className={`message ${type}`}>{message}</div>
        </div>
      </div>
    </div>
  )
}
