const { Pool } = require('pg');

const connectionString = process.env.CONNECTION_STRING;

const pgPool = new Pool({
  keepAlive: true,
  connectionString,
  ssl: true,
  idleTimeoutMillis: 0,
  connectionTimeoutMillis: 0
});

const keepPoolAlive = async (pool) => {
  const res = await pool.query('select now()');
}

const getConnectionPool = () => {
  return pgPool;
}

module.exports = {
  getConnectionPool,
  keepPoolAlive
}
