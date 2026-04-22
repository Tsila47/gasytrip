import { pool } from "../config/db.js";

export async function getPublicUserProfile(req, res) {
  try {
    const { id } = req.params;

    const [users] = await pool.execute(
      `SELECT id, name, photo_url, created_at
       FROM users
       WHERE id = ? AND is_active = 1
       LIMIT 1`,
      [id]
    );

    if (users.length === 0) {
      return res.status(404).json({ message: "Conducteur introuvable." });
    }

    const [rideStatsRows] = await pool.execute(
      `SELECT
         COUNT(*) AS rides_count,
         COALESCE(SUM(GREATEST(r.seats_total - r.seats_available, 0)), 0) AS passengers_count
       FROM rides r
       WHERE r.driver_id = ? AND r.status <> 'CANCELLED'`,
      [id]
    );

    const [recentRidesRows] = await pool.execute(
      `SELECT
         r.id,
         r.departure_city,
         r.arrival_city,
         r.departure_datetime,
         r.price,
         r.seats_total,
         r.seats_available,
         r.status
       FROM rides r
       WHERE r.driver_id = ? AND r.status <> 'CANCELLED'
       ORDER BY r.departure_datetime DESC
       LIMIT 5`,
      [id]
    );

    const [ratingTableRows] = await pool.execute(
      `SELECT COUNT(*) AS table_count
       FROM information_schema.tables
       WHERE table_schema = DATABASE() AND table_name = 'ratings'`
    );

    let averageRating = null;
    let ratingsCount = 0;
    if (Number(ratingTableRows[0]?.table_count) > 0) {
      const [ratingRows] = await pool.execute(
        `SELECT AVG(rt.rating) AS average_rating, COUNT(*) AS ratings_count
         FROM ratings rt
         JOIN rides r ON r.id = rt.ride_id
         WHERE r.driver_id = ?`,
        [id]
      );
      averageRating =
        ratingRows[0]?.average_rating !== null && ratingRows[0]?.average_rating !== undefined
          ? Number(ratingRows[0].average_rating)
          : null;
      ratingsCount = Number(ratingRows[0]?.ratings_count) || 0;
    }

    return res.json({
      user: {
        id: users[0].id,
        name: users[0].name,
        photo_url: users[0].photo_url ?? null,
        member_since: users[0].created_at,
        is_driver: Number(rideStatsRows[0].rides_count) > 0,
      },
      stats: {
        rides_count: Number(rideStatsRows[0].rides_count) || 0,
        passengers_count: Number(rideStatsRows[0].passengers_count) || 0,
        average_rating: averageRating,
        ratings_count: ratingsCount,
      },
      recent_rides: recentRidesRows,
    });
  } catch (err) {
    return res.status(500).json({ message: "Erreur serveur lors de la récupération du profil public." });
  }
}
