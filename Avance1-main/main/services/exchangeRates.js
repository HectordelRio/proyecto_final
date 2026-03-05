const CACHE_TTL_MS = 10 * 60 * 1000;

const cache = new Map();

function now() {
  return Date.now();
}

async function fetchRates(base) {
  const url = `https://open.er-api.com/v6/latest/${encodeURIComponent(base)}`;
  const response = await fetch(url, {
    method: 'GET',
    headers: { 'Accept': 'application/json' },
  });

  if (!response.ok) {
    const text = await response.text().catch(() => '');
    const err = new Error(`Error consultando API externa (${response.status})`);
    err.statusCode = 502;
    err.details = text;
    throw err;
  }

  const data = await response.json();
  if (!data || data.result !== 'success' || !data.rates) {
    const err = new Error('Respuesta inválida de API externa');
    err.statusCode = 502;
    throw err;
  }

  return {
    base: data.base_code || base,
    time_last_update_unix: data.time_last_update_unix,
    rates: data.rates,
  };
}

async function getRates(base) {
  const key = String(base || '').toUpperCase();
  if (!key) {
    const err = new Error('base es requerido');
    err.statusCode = 400;
    throw err;
  }

  const cached = cache.get(key);
  if (cached && cached.expiresAt > now()) {
    return cached.value;
  }

  const value = await fetchRates(key);
  cache.set(key, { value, expiresAt: now() + CACHE_TTL_MS });
  return value;
}

module.exports = {
  getRates,
  _cache: cache,
};
