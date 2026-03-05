import { useEffect, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { useAuth } from '../state/AuthContext.jsx'
import { apiFetch } from '../utils/apiFetch.js'

export default function ActivityDetail() {
  const { token, role } = useAuth()
  const { id } = useParams()

  const [me, setMe] = useState(null)
  const [activity, setActivity] = useState(null)
  const [users, setUsers] = useState([])
  const [employees, setEmployees] = useState([])

  const [editTitle, setEditTitle] = useState('')
  const [editImportance, setEditImportance] = useState('media')
  const [editDone, setEditDone] = useState(false)
  const [editAssigneeUserId, setEditAssigneeUserId] = useState('')
  const [assigneeTouched, setAssigneeTouched] = useState(false)
  const [saving, setSaving] = useState(false)

  const [message, setMessage] = useState('')
  const [type, setType] = useState('')

  useEffect(() => {
    let cancelled = false

    async function load() {
      setMessage('')
      setType('')
      try {
        const meData = await apiFetch('/api/auth/me', { token })
        const activityData = await apiFetch(`/api/activities/${id}`, { token })

        if (cancelled) return

        setMe(meData)
        setActivity(activityData)
        setEditTitle(activityData.title || '')
        setEditImportance(activityData.importance || 'media')
        setEditDone(!!activityData.done)

        const effectiveRole = (meData && meData.role) || role || 'user'
        if (effectiveRole !== 'admin') {
          return
        }

        const [usersData, employeesData] = await Promise.all([
          apiFetch('/api/users', { token }),
          apiFetch('/api/employees?limit=200&page=1', { token }),
        ])

        if (cancelled) return

        const employeesList = Array.isArray(employeesData) ? employeesData : employeesData.items || []
        setUsers(Array.isArray(usersData) ? usersData : [])
        setEmployees(employeesList)

        const assigneeEmployeeId =
          activityData.assigneeId && (activityData.assigneeId._id || activityData.assigneeId)

        if (assigneeEmployeeId) {
          const emp = employeesList.find((e) => String(e._id) === String(assigneeEmployeeId))
          const uid = emp && emp.userId && (emp.userId._id || emp.userId)
          if (uid) {
            setEditAssigneeUserId(String(uid))
          }
        }
      } catch (err) {
        if (cancelled) return
        setType('error')
        setMessage(err.message || 'Error cargando actividad')
      }
    }

    load()
    return () => {
      cancelled = true
    }
  }, [id, token])

  async function save(e) {
    e.preventDefault()
    setSaving(true)
    setMessage('')
    setType('')
    try {
      const effectiveRole = ((me && me.role) || role || 'user')
      if (effectiveRole !== 'admin') {
        throw new Error('No autorizado')
      }

      const body = {
        title: String(editTitle || '').trim(),
        importance: editImportance,
        done: !!editDone,
      }

      if (assigneeTouched) {
        body.assigneeUserId = editAssigneeUserId
      }

      const updated = await apiFetch(`/api/activities/${id}`, {
        method: 'PUT',
        token,
        body,
      })

      setActivity(updated)
      setType('success')
      setMessage('Actividad actualizada')
      setAssigneeTouched(false)
    } catch (err) {
      setType('error')
      setMessage(err.message || 'No se pudo actualizar la actividad')
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="main-screen" style={{ width: '100%' }}>
      <nav className="navbar">
        <h1>Detalle de actividad</h1>
        <div className="nav-actions">
          <Link className="btn btn-secondary" to="/">Volver</Link>
        </div>
      </nav>
      <main className="main-content">
        <section className="section">
          <div className={`message ${type}`}>{message}</div>
          {activity ? (
            <>
              <div className="card">
                <p><strong>ID:</strong> {activity._id}</p>
                <p><strong>Título:</strong> {activity.title}</p>
                <p><strong>Importancia:</strong> {activity.importance}</p>
                <p><strong>Hecha:</strong> {activity.done ? 'Sí' : 'No'}</p>
                <p><strong>Asignado a:</strong> {activity.assigneeId && activity.assigneeId.name ? activity.assigneeId.name : 'Sin asignar'}</p>
              </div>

              {((me && me.role) || role) === 'admin' ? (
                <div className="card" style={{ marginTop: '1rem' }}>
                  <h3>Editar actividad</h3>
                  <form onSubmit={save}>
                    <div className="form-group">
                      <label>Título</label>
                      <input value={editTitle} onChange={(e) => setEditTitle(e.target.value)} required />
                    </div>

                    <div className="row">
                      <div className="form-group">
                        <label>Importancia</label>
                        <select value={editImportance} onChange={(e) => setEditImportance(e.target.value)}>
                          <option value="alta">Alta</option>
                          <option value="media">Media</option>
                          <option value="baja">Baja</option>
                        </select>
                      </div>

                      <div className="form-group">
                        <label>Usuario asignado</label>
                        <select
                          value={editAssigneeUserId}
                          onChange={(e) => {
                            setEditAssigneeUserId(e.target.value)
                            setAssigneeTouched(true)
                          }}
                        >
                          <option value="">Sin asignar</option>
                          {users.map((u) => (
                            <option key={u._id} value={u._id}>{u.username}</option>
                          ))}
                        </select>
                        {employees.length === 0 && users.length === 0 ? (
                          <small>Cargando usuarios…</small>
                        ) : null}
                      </div>
                    </div>

                    <div className="form-group">
                      <label>
                        <input
                          type="checkbox"
                          checked={editDone}
                          onChange={(e) => setEditDone(e.target.checked)}
                          style={{ marginRight: '0.5rem' }}
                        />
                        Hecha
                      </label>
                    </div>

                    <button className="btn btn-primary" type="submit" disabled={saving}>
                      {saving ? 'Guardando…' : 'Guardar cambios'}
                    </button>
                  </form>
                </div>
              ) : null}
            </>
          ) : (
            <p>Cargando…</p>
          )}
        </section>
      </main>
    </div>
  )
}
