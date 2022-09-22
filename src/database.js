const { Pool } = require('pg')
const connectionString = process.env.CONNECTION_STRING;

const pool = new Pool({
  connectionString,
  ssl: true,
  idleTimeoutMillis: 0,
  connectionTimeoutMillis: 0
});

const isSessionOpen = async () => {
  try {
    const res = await pool.query(`
      select 
        cf.variable_value,
        cf.last_changed 
      from 
        config_flags cf 
      where
        cf.variable_name = 'session_open';
    `);
    let data = JSON.stringify(res.rows[0]);
    return data;
  } catch (err) {
    console.log(err.stack)
  }
}

module.exports = {
  isSessionOpen
}
