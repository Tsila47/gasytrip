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
  ssl: {rejectUnauthorized: false},       // évite les décalages DATETIME entre Node et MySQL
});

// Test de connexion au démarrage
pool.getConnection()
  .then(conn => {
    console.log("✓ MySQL connecté :", process.env.DB_NAME);
    conn.release();
  })
  .catch(err => {
    console.error("✗ Échec connexion MySQL :", err.message);
    process.exit(1);   // arrête le serveur si la DB est inaccessible
  });