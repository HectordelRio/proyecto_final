import { useEffect, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { useAuth } from '../state/AuthContext.jsx'
import { apiFetch } from '../utils/apiFetch.js'

export default function Dashboard() {
  const { token, username, role, logout } = useAuth()

  const [me, setMe] = useState(null)
  const [activities, setActivities] = useState([])
  const [employees, setEmployees] = useState([])
  const [users, setUsers] = useState([])
  const [myAssignedActivities, setMyAssignedActivities] = useState([])
  const [message, setMessage] = useState('')
  const [type, setType] = useState('')

  const [title, setTitle] = useState('')
  const [importance, setImportance] = useState('media')
  const [assigneeUserId, setAssigneeUserId] = useState('')

  const employeeOptions = useMemo(() => employees || [], [employees])
  const userOptions = useMemo(() => users || [], [users])

  const effectiveRole = (me && me.role) || role || 'user'

  async function deleteActivity(id) {
    setMessage('')
    setType('')
    try {
      await apiFetch(`/api/activities/${id}`, {
        method: 'DELETE',
        token,
      })
      await loadAll()
      setType('success')
      setMessage('Actividad eliminada')
    } catch (err) {
      setType('error')
      setMessage(err.message || 'Error eliminando actividad')
    }
  }

  async function loadAll() {
    const meData = await apiFetch('/api/auth/me', { token })

    const [employeesData, activitiesData, usersData, myAssignedData] = await Promise.all([
      apiFetch('/api/employees?limit=50&page=1', { token }),
      apiFetch('/api/activities?limit=10&page=1', { token }),
      meData.role === 'admin' ? apiFetch('/api/users', { token }) : Promise.resolve([]),
      apiFetch('/api/activities/assigned/me', { token }),
    ])

    setMe(meData)
    const employeesList = Array.isArray(employeesData) ? employeesData : employeesData.items || []
    const activitiesList = Array.isArray(activitiesData) ? activitiesData : activitiesData.items || []
    setEmployees(employeesList)
    setActivities(activitiesList)
    setUsers(Array.isArray(usersData) ? usersData : [])

    const assignedList = Array.isArray(myAssignedData) ? myAssignedData : myAssignedData.items || []
    setMyAssignedActivities(assignedList)
  }

  useEffect(() => {
    loadAll().catch((err) => {
      setType('error')
      setMessage(err.message || 'Error cargando datos')
    })
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  async function createActivity(e) {
    e.preventDefault()
    setMessage('')
    setType('')
    try {
      // Intentamos resolver el usuario seleccionado a un empleado ya existente
      let resolvedAssigneeId
      if (assigneeUserId) {
        const match = employeeOptions.find((e) => {
          const uid = e && e.userId && (e.userId._id || e.userId)
          return uid && uid === assigneeUserId
        })
        if (match) {
          resolvedAssigneeId = match._id
        }
      }

      await apiFetch('/api/activities', {
        method: 'POST',
        token,
        body: {
          title: title.trim(),
          importance,
          // Si ya tenemos empleado ligado, mandamos directamente assigneeId;
          // si no, dejamos que el backend resuelva assigneeUserId.
          assigneeId: resolvedAssigneeId || undefined,
          assigneeUserId: resolvedAssigneeId ? undefined : (assigneeUserId || undefined),
        },
      })
      setTitle('')
      setAssigneeUserId('')
      await loadAll()
      setType('success')
      setMessage('Actividad creada')
    } catch (err) {
      setType('error')
      setMessage(err.message || 'Error creando actividad')
    }
  }

  return (
    <div className="main-screen" style={{ width: '100%' }}>
      <nav className="navbar">
        <h1>Sistema de Gestión</h1>
        <div className="nav-actions">
          <span className="user-info">Bienvenido: {username} ({effectiveRole})</span>
          {effectiveRole === 'admin' ? (
            <Link className="btn btn-secondary" to="/admin/users">Admin: Usuarios</Link>
          ) : null}
          <button className="btn btn-secondary" onClick={logout}>Cerrar Sesión</button>
        </div>
      </nav>

      <main className="main-content">
        <section className="section">
          <h2>Nueva actividad</h2>
          {effectiveRole === 'admin' ? (
            <>
              <form onSubmit={createActivity}>
                <div className="form-group">
                  <label>Descripción</label>
                  <input value={title} onChange={(e) => setTitle(e.target.value)} required />
                </div>
                <div className="row">
                  <div className="form-group">
                    <label>Importancia</label>
                    <select value={importance} onChange={(e) => setImportance(e.target.value)}>
                      <option value="alta">Alta</option>
                      <option value="media">Media</option>
                      <option value="baja">Baja</option>
                    </select>
                  </div>
                  <div className="form-group">
                    <label>Usuario asignado</label>
                    <select value={assigneeUserId} onChange={(e) => setAssigneeUserId(e.target.value)}>
                      <option value="">Sin asignar</option>
                      {userOptions.map((u) => (
                        <option key={u._id} value={u._id}>{u.username}</option>
                      ))}
                    </select>
                  </div>
                </div>
                <button className="btn btn-primary" type="submit">Agregar actividad</button>
              </form>
              <div className={`message ${type}`}>{message}</div>
            </>
          ) : (
            <p>Solo un administrador puede crear nuevas actividades. Tú puedes marcar tus tareas como terminadas.</p>
          )}
        </section>

        <section className="section">
          <h2>Actividades (últimas 10)</h2>
          <div className="grid">
            {activities.length === 0 ? <div className="card">No hay actividades.</div> : null}
            {activities.map((a) => (
              <div className="card" key={a._id}>
                <p><strong>Actividad:</strong> {a.title}</p>
                <p><strong>Importancia:</strong> {a.importance}</p>
                <p><strong>Asignado a:</strong> {a.assigneeId && a.assigneeId.name ? a.assigneeId.name : 'Sin asignar'}</p>
                <p><Link className="link" to={`/activities/${a._id}`}>Ver detalle</Link></p>
                <ActivityDoneToggle
                  id={a._id}
                  done={a.done}
                  token={token}
                  onChanged={loadAll}
                />
                {effectiveRole === 'admin' ? (
                  <button
                    className="btn btn-secondary"
                    type="button"
                    onClick={() => deleteActivity(a._id)}
                    style={{ marginTop: '0.5rem' }}
                  >
                    Eliminar
                  </button>
                ) : null}
              </div>
            ))}
          </div>
        </section>

        <section className="section">
          <h2>Mis actividades asignadas</h2>
          <div className="grid">
            {myAssignedActivities.length === 0 ? <div className="card">No tienes actividades asignadas.</div> : null}
            {myAssignedActivities.map((a) => (
              <div className="card" key={a._id}>
                <p><strong>Actividad:</strong> {a.title}</p>
                <p><strong>Importancia:</strong> {a.importance}</p>
                <ActivityDoneToggle
                  id={a._id}
                  done={a.done}
                  token={token}
                  onChanged={loadAll}
                />
              </div>
            ))}
          </div>
        </section>

        <section className="section">
          <h2>Usuario actual</h2>
          <div className="card">
            {me ? (
              <>
                <p><strong>Usuario:</strong> {me.username}</p>
                <p><strong>Email:</strong> {me.email}</p>
                <p><strong>Rol:</strong> {me.role}</p>
                <p><strong>ID:</strong> {me._id}</p>
              </>
            ) : (
              <p>Cargando…</p>
            )}
          </div>
        </section>

        <section className="section">
          <h2>Conversión de moneda (API externa)</h2>
          <CurrencyConverter token={token} />
        </section>
      </main>
    </div>
  )
}

function CurrencyConverter({ token }) {
  const [from, setFrom] = useState('USD')
  const [to, setTo] = useState('MXN')
  const [amount, setAmount] = useState('1')
  const [result, setResult] = useState(null)
  const [message, setMessage] = useState('')
  const [type, setType] = useState('')

  async function convert(e) {
    e.preventDefault()
    setMessage('')
    setType('')
    try {
      const q = new URLSearchParams({ from, to, amount }).toString()
      const data = await apiFetch(`/api/external/convert?${q}`, { token })
      setResult(data)
    } catch (err) {
      setResult(null)
      setType('error')
      setMessage(err.message || 'Error consultando API externa')
    }
  }

  return (
    <>
      <form onSubmit={convert}>
        <div className="row">
          <div className="form-group">
            <label>From</label>
            <input value={from} onChange={(e) => setFrom(e.target.value.toUpperCase())} />
          </div>
          <div className="form-group">
            <label>To</label>
            <input value={to} onChange={(e) => setTo(e.target.value.toUpperCase())} />
          </div>
          <div className="form-group">
            <label>Amount</label>
            <input value={amount} onChange={(e) => setAmount(e.target.value)} />
          </div>
        </div>
        <button className="btn btn-secondary" type="submit">Convertir</button>
      </form>
      <div className={`message ${type}`}>{message}</div>
      {result ? (
        <div className="card">
          <p><strong>Tasa:</strong> {result.rate}</p>
          <p><strong>Resultado:</strong> {result.result}</p>
        </div>
      ) : null}
    </>
  )
}

function ActivityDoneToggle({ id, done, token, onChanged }) {
  const [busy, setBusy] = useState(false)
  const [message, setMessage] = useState('')

  async function toggle() {
    setBusy(true)
    setMessage('')
    try {
      await apiFetch(`/api/activities/${id}`, {
        method: 'PUT',
        token,
        body: { done: !done },
      })
      if (onChanged) onChanged()
    } catch (err) {
      setMessage(err.message || 'No se pudo actualizar la actividad')
    } finally {
      setBusy(false)
    }
  }

  return (
    <>
      <button className="btn btn-secondary" type="button" disabled={busy} onClick={toggle}>
        {done ? 'Marcar como pendiente' : 'Marcar como terminada'}
      </button>
      {message && <div className="message error">{message}</div>}
    </>
  )
}
