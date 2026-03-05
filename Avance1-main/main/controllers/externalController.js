const { getRates } = require('../services/exchangeRates');

function toNumber(value) {
  const n = Number(value);
  return Number.isFinite(n) ? n : null;
}

async function rates(req, res) {
  const base = String(req.query.base || 'USD').toUpperCase();
  const data = await getRates(base);
  return res.json(data);
}

async function convert(req, res) {
  const from = String(req.query.from || '').toUpperCase();
  const to = String(req.query.to || '').toUpperCase();
  const amount = toNumber(req.query.amount);

  if (!from || !to) {
    return res.status(400).json({ error: 'from y to son requeridos' });
  }

  if (amount === null) {
    return res.status(400).json({ error: 'amount inválido' });
  }

  const { rates } = await getRates(from);
  const rate = rates[to];
  if (!rate) {
    return res.status(400).json({ error: 'Moneda destino no soportada' });
  }

  const result = amount * rate;
  return res.json({ from, to, amount, rate, result });
}

module.exports = {
  rates,
  convert,
};
