export async function apiFetch(path, { method = 'GET', body, token } = {}) {
  const headers = {
    Accept: 'application/json',
  }

  if (body !== undefined) {
    headers['Content-Type'] = 'application/json'
  }

  if (token) {
    headers.Authorization = `Bearer ${token}`
  }

  const res = await fetch(path, {
    method,
    headers,
    body: body !== undefined ? JSON.stringify(body) : undefined,
  })

  const text = await res.text()
  const data = text ? safeJson(text) : null

  if (!res.ok) {
    const msg = (data && data.error) || `HTTP ${res.status}`
    const err = new Error(msg)
    err.status = res.status
    err.data = data
    throw err
  }

  return data
}

function safeJson(text) {
  try {
    return JSON.parse(text)
  } catch {
    return { _raw: text }
  }
}
