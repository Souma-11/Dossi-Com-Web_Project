const { Pool } = require('pg');
require('dotenv').config();

const pool = new Pool({
  user: process.env.DB_USER || 'postgres',
  host: process.env.DB_HOST || 'localhost',
  database: process.env.DB_NAME || "Dossi'Com",
  password: process.env.DB_PASSWORD,
  port: process.env.DB_PORT || 5432,
});

const connectDB = async () => {
  try {
    const client = await pool.connect();
    console.log("✅ Connecté à PostgreSQL (base Dossi'Com)");
    client.release();
  } catch (error) {
    console.error('❌ Erreur de connexion PostgreSQL :', error.message);
    process.exit(1);
  }
};

connectDB.pool = pool;
connectDB.query = (text, params) => pool.query(text, params);

module.exports = connectDB;