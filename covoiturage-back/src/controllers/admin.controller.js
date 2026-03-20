import { pool } from "../config/db.js";

export async function listUsers(req, res) {
  try {
    const [rows] = await pool.execute(
      `SELECT id, name, email, phone, role, is_active
       FROM users
       ORDER BY created_at DESC`
    );
    return res.json({ users: rows });
  } catch {
    return res.status(500).json({ message: "Erreur serveur (list users)." });
  }
}

export async function setUserActive(req, res) {
  try {
    const { id } = req.params;

    const [rows] = await pool.execute(
      `SELECT id, is_active FROM users WHERE id = ? LIMIT 1`,
      [id]
    );
    if (rows.length === 0)
      return res.status(404).json({ message: "Utilisateur introuvable." });

    // Toggle : actif → désactiver, désactivé → réactiver
    const newStatus = rows[0].is_active === 1 ? 0 : 1;

    await pool.execute(
      `UPDATE users SET is_active = ? WHERE id = ?`,
      [newStatus, id]
    );

    return res.json({
      message: newStatus === 1 ? "Utilisateur réactivé." : "Utilisateur désactivé.",
      is_active: newStatus,
    });
  } catch {
    return res.status(500).json({ message: "Erreur serveur (toggle user)." });
  }
}

export async function listRidesAdmin(req, res) {
  try {
    const [rows] = await pool.execute(
      `SELECT
         r.id,
         r.departure_city,
         r.arrival_city,
         r.departure_datetime,
         r.price,
         r.seats_total,
         r.seats_available,
         r.status,
         u.name AS driver_name,
         v.plate AS vehicle_plate
       FROM rides r
       JOIN users u ON u.id = r.driver_id
       JOIN vehicles v ON v.id = r.vehicle_id
       ORDER BY r.departure_datetime DESC`
    );
    return res.json({ rides: rows });
  } catch {
    return res.status(500).json({ message: "Erreur serveur (list rides)." });
  }
}

export async function cancelRideAdmin(req, res) {
  const { id: rideId } = req.params;
  const conn = await pool.getConnection();
  try {
    await conn.beginTransaction();

    const [rideRows] = await conn.execute(
      `SELECT id, status FROM rides WHERE id = ? FOR UPDATE`,
      [rideId]
    );
    if (rideRows.length === 0) {
      await conn.rollback();
      return res.status(404).json({ message: "Trajet introuvable." });
    }
    if (rideRows[0].status !== "OPEN") {
      await conn.rollback();
      return res.status(409).json({ message: "Trajet déjà traité (pas OPEN)." });
    }

    await conn.execute(
      `UPDATE bookings SET status = 'CANCELLED'
       WHERE ride_id = ? AND status = 'CONFIRMED'`,
      [rideId]
    );
    await conn.execute(
      `UPDATE rides SET status = 'CANCELLED', seats_available = seats_total
       WHERE id = ?`,
      [rideId]
    );

    await conn.commit();
    return res.json({ message: "Trajet annulé (admin)." });
  } catch {
    await conn.rollback();
    return res.status(500).json({ message: "Erreur serveur lors de l'annulation (admin)." });
  } finally {
    conn.release();
  }
}

export async function listBookingsAdmin(req, res) {
  try {
    const [rows] = await pool.execute(
      `SELECT
         b.id,
         b.status,
         b.seats_booked,
         b.created_at,
         r.id AS ride_id,
         r.departure_city,
         r.arrival_city,
         r.departure_datetime,
         p.name AS passenger_name,
         d.name AS driver_name
       FROM bookings b
       JOIN rides r ON r.id = b.ride_id
       JOIN users p ON p.id = b.passenger_id
       JOIN users d ON d.id = r.driver_id
       ORDER BY b.created_at DESC`
    );
    return res.json({ bookings: rows });
  } catch {
    return res.status(500).json({ message: "Erreur serveur (list bookings)." });
  }
}