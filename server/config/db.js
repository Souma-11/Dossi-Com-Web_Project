const { Pool } = require('pg');
require('dotenv').config();

function buildPoolConfig() {
  const fallbackPassword = String(
    process.env.DB_PASSWORD ||
      process.env.DB_PASS ||
      process.env.PGPASSWORD ||
      'postgres'
  );

  if (process.env.DATABASE_URL) {
    try {
      const url = new URL(process.env.DATABASE_URL);
      return {
        host: url.hostname || 'localhost',
        port: Number(url.port) || 5432,
        user: decodeURIComponent(url.username || 'postgres'),
        password: url.password
          ? decodeURIComponent(url.password)
          : fallbackPassword,
        database: url.pathname.replace(/^\//, '') || 'dossicom',
      };
    } catch {
      return { connectionString: process.env.DATABASE_URL };
    }
  }

  return {
    host: process.env.DB_HOST || 'localhost',
    port: Number(process.env.DB_PORT) || 5432,
    user: process.env.DB_USER || 'postgres',
    password: fallbackPassword,
    database: process.env.DB_NAME || 'dossicom',
  };
}

const pool = new Pool(buildPoolConfig());

pool.on('error', (err) => {
  console.error('Erreur inattendue PostgreSQL :', err);
});

async function connectDB() {
  try {
    const client = await pool.connect();
    console.log('✅ Connexion PostgreSQL établie avec succès.');
    client.release();
  } catch (err) {
    console.error('❌ Échec de connexion à PostgreSQL :', err.message);
  }
}

connectDB.query = (...args) => pool.query(...args);
connectDB.connect = () => pool.connect();
connectDB.pool = pool;

module.exports = connectDB;