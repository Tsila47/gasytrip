import mysql from "mysql2/promise";
import dotenv from "dotenv";

dotenv.config();

export const pool = mysql.createPool({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  port: process.env.DB_PORT || 3306,
  waitForConnections: true,
  connectionLimit: 10,
  timezone: "+00:00",
  ssl: { rejectUnauthorized: false },
  enableKeepAlive: true,
  keepAliveInitialDelay: 10000,
});

// Test de connexion au démarrage — non bloquant
pool.getConnection()
  .then(conn => {
    console.log("✓ MySQL connecté :", process.env.DB_NAME);
    conn.release();
  })
  .catch(err => {
    // On log l'erreur mais on ne tue pas le serveur
    console.error("⚠️ MySQL non disponible au démarrage :", err.message);
  });