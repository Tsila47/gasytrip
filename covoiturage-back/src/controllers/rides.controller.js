import { pool } from "../config/db.js";

function parseDateTime(value) {
  if (!value) return null;
  const d = new Date(value);
  return Number.isNaN(d.getTime()) ? null : value;
}

export async function listRides(req, res) {
  try {
    const {
      departure_city,
      arrival_city,
      departure_datetime,
      price_max,
      seats_min,
      driver_id,
    } = req.query;

    const conditions = ["r.status = 'OPEN'"];
    const params = [];

    // Toujours proposer des trajets à venir (plus propre pour l'UI)
    conditions.push("r.departure_datetime >= NOW()");

    if (departure_city) {
      conditions.push("r.departure_city = ?");
      params.push(departure_city);
    }
    if (arrival_city) {
      conditions.push("r.arrival_city = ?");
      params.push(arrival_city);
    }
    if (departure_datetime) {
      // Filtre simple: départ après la date/heure fournie
      conditions.push("r.departure_datetime >= ?");
      params.push(departure_datetime);
    }
    if (price_max) {
      conditions.push("r.price <= ?");
      params.push(price_max);
    }
    if (seats_min) {
      conditions.push("r.seats_available >= ?");
      params.push(seats_min);
    }
    if (driver_id) {
      conditions.push("r.driver_id = ?");
      params.push(driver_id);
    }

    const where = conditions.length ? `WHERE ${conditions.join(" AND ")}` : "";

    const sql = `
      SELECT
        r.id,
        r.departure_city,
        r.arrival_city,
        r.departure_datetime,
        r.price,
        r.seats_total,
        r.seats_available,
        r.description,
        u.name AS driver_name,
        v.brand AS vehicle_brand,
        v.model AS vehicle_model,
        v.plate AS vehicle_plate
      FROM rides r
      JOIN users u ON u.id = r.driver_id
      JOIN vehicles v ON v.id = r.vehicle_id
      ${where}
      ORDER BY r.departure_datetime ASC
    `;

    const [rows] = await pool.execute(sql, params);
    return res.json({ rides: rows });
  } catch {
    return res.status(500).json({ message: "Erreur serveur lors de la recherche." });
  }
}

export async function getRideById(req, res) {
  try {
    const { id } = req.params;
    const sql = `
      SELECT
        r.id,
        r.driver_id,
        r.vehicle_id,
        r.departure_city,
        r.arrival_city,
        r.departure_datetime,
        r.price,
        r.seats_total,
        r.seats_available,
        r.description,
        r.status,
        u.name AS driver_name,
        v.brand AS vehicle_brand,
        v.model AS vehicle_model,
        v.plate AS vehicle_plate,
        v.seats AS vehicle_seats
      FROM rides r
      JOIN users u ON u.id = r.driver_id
      JOIN vehicles v ON v.id = r.vehicle_id
      WHERE r.id = ?
      LIMIT 1
    `;

    const [rows] = await pool.execute(sql, [id]);
    if (rows.length === 0) return res.status(404).json({ message: "Trajet introuvable." });

    return res.json({ ride: rows[0] });
  } catch {
    return res.status(500).json({ message: "Erreur serveur lors de la récupération du trajet." });
  }
}

export async function createRide(req, res) {
  const userId = req.user?.id;
  if (!userId) return res.status(401).json({ message: "Non authentifié." });

  const {
    departure_city,
    arrival_city,
    departure_datetime,
    price,
    seats_total,
    description,
    vehicle_brand,
    vehicle_model,
    vehicle_plate,
  } = req.body || {};

  if (
    !departure_city ||
    !arrival_city ||
    !departure_datetime ||
    price === undefined ||
    seats_total === undefined ||
    !vehicle_brand ||
    !vehicle_model ||
    !vehicle_plate
  ) {
    return res.status(400).json({ message: "Champs manquants pour créer le trajet." });
  }

  const departureOk = parseDateTime(departure_datetime);
  if (!departureOk) return res.status(400).json({ message: "Date/heure de départ invalide." });

  const seatsTotalNum = Number(seats_total);
  const priceNum = Number(price);
  if (!Number.isFinite(seatsTotalNum) || seatsTotalNum <= 0)
    return res.status(400).json({ message: "seats_total invalide." });
  if (!Number.isFinite(priceNum) || priceNum < 0)
    return res.status(400).json({ message: "price invalide." });

  const conn = await pool.getConnection();
  try {
    await conn.beginTransaction();

    // 1) Créer ou mettre à jour le véhicule du conducteur
    const [existingPlate] = await conn.execute(
      `SELECT id, user_id FROM vehicles WHERE plate = ? LIMIT 1`,
      [vehicle_plate]
    );

    let vehicleId;
    if (existingPlate.length > 0) {
      const found = existingPlate[0];
      if (Number(found.user_id) !== Number(userId)) {
        await conn.rollback();
        return res
          .status(409)
          .json({ message: "Cette immatriculation est déjà utilisée par un autre compte." });
      }

      await conn.execute(
        `UPDATE vehicles
         SET brand = ?, model = ?, seats = ?
         WHERE id = ?`,
        [vehicle_brand, vehicle_model, seatsTotalNum, found.id]
      );
      vehicleId = found.id;
    } else {
      const [insVeh] = await conn.execute(
        `INSERT INTO vehicles (user_id, brand, model, plate, seats, created_at)
         VALUES (?, ?, ?, ?, ?, NOW())`,
        [userId, vehicle_brand, vehicle_model, vehicle_plate, seatsTotalNum]
      );
      vehicleId = insVeh.insertId;
    }

    // 2) Créer le trajet
    const [insRide] = await conn.execute(
      `INSERT INTO rides (
        driver_id, vehicle_id,
        departure_city, arrival_city,
        departure_datetime,
        price,
        seats_total, seats_available,
        description,
        status,
        created_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, 'OPEN', NOW())`,
      [
        userId,
        vehicleId,
        departure_city,
        arrival_city,
        departure_datetime,
        priceNum,
        seatsTotalNum,
        seatsTotalNum,
        description ?? null,
      ]
    );

    await conn.commit();
    return res.status(201).json({ rideId: insRide.insertId });
  } catch {
    await conn.rollback();
    return res.status(500).json({ message: "Erreur serveur lors de la création du trajet." });
  } finally {
    conn.release();
  }
}

export async function createBooking(req, res) {
  const userId = req.user?.id;
  if (!userId) return res.status(401).json({ message: "Non authentifié." });

  const { id: rideId } = req.params;
  const { seats_booked } = req.body || {};

  const seatsBookedNum = Number(seats_booked);
  if (!Number.isFinite(seatsBookedNum) || seatsBookedNum <= 0) {
    return res.status(400).json({ message: "seats_booked invalide." });
  }

  const conn = await pool.getConnection();
  try {
    await conn.beginTransaction();

    const [rideRows] = await conn.execute(
      `SELECT id, seats_available, status, departure_datetime
       FROM rides
       WHERE id = ?
       FOR UPDATE`,
      [rideId]
    );

    if (rideRows.length === 0) {
      await conn.rollback();
      return res.status(404).json({ message: "Trajet introuvable." });
    }

    const ride = rideRows[0];
    if (ride.status !== "OPEN") {
      await conn.rollback();
      return res.status(409).json({ message: "Trajet non disponible." });
    }

    if (new Date(ride.departure_datetime).getTime() < Date.now()) {
      await conn.rollback();
      return res.status(409).json({ message: "Trajet passé." });
    }

    if (seatsBookedNum > ride.seats_available) {
      await conn.rollback();
      return res.status(400).json({ message: "Places insuffisantes." });
    }

    const [insBooking] = await conn.execute(
      `INSERT INTO bookings (ride_id, passenger_id, seats_booked, status, created_at)
       VALUES (?, ?, ?, 'CONFIRMED', NOW())`,
      [rideId, userId, seatsBookedNum]
    );

    await conn.execute(
      `UPDATE rides
       SET seats_available = seats_available - ?
       WHERE id = ?`,
      [seatsBookedNum, rideId]
    );

    await conn.commit();
    return res.status(201).json({
      bookingId: insBooking.insertId,
      seats_booked: seatsBookedNum,
    });
  } catch {
    await conn.rollback();
    return res.status(500).json({ message: "Erreur serveur lors de la réservation." });
  } finally {
    conn.release();
  }
}

export async function listMyRides(req, res) {
  const userId = req.user?.id;
  if (!userId) return res.status(401).json({ message: "Non authentifié." });

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
         v.plate
       FROM rides r
       JOIN vehicles v ON v.id = r.vehicle_id
       WHERE r.driver_id = ?
       ORDER BY r.departure_datetime DESC`,
      [userId]
    );

    return res.json({ rides: rows });
  } catch {
    return res.status(500).json({ message: "Erreur serveur lors de la récupération." });
  }
}

export async function listMyBookings(req, res) {
  const userId = req.user?.id;
  if (!userId) return res.status(401).json({ message: "Non authentifié." });

  try {
    const [rows] = await pool.execute(
      `SELECT
        b.id,
        b.status,
        b.seats_booked,
        b.created_at,
        r.id AS ride_id,
        r.driver_id,
        r.departure_city,
        r.arrival_city,
        r.departure_datetime,
        r.price,
        d.name AS driver_name,
        rt.rating AS my_rating,
        rt.comment AS my_rating_comment,
        rt.created_at AS my_rating_created_at
       FROM bookings b
       JOIN rides r ON r.id = b.ride_id
       JOIN users d ON d.id = r.driver_id
       LEFT JOIN ratings rt ON rt.ride_id = b.ride_id AND rt.passenger_id = b.passenger_id
       WHERE b.passenger_id = ?
       ORDER BY b.created_at DESC`,
      [userId]
    );

    return res.json({ bookings: rows });
  } catch {
    return res.status(500).json({ message: "Erreur serveur lors de la récupération des réservations." });
  }
}

async function getRatingContext(rideId, userId) {
  const [rows] = await pool.execute(
    `SELECT
       b.id AS booking_id,
       b.status AS booking_status,
       r.driver_id,
       r.departure_datetime,
       rt.id AS rating_id
     FROM bookings b
     JOIN rides r ON r.id = b.ride_id
     LEFT JOIN ratings rt ON rt.ride_id = b.ride_id AND rt.passenger_id = b.passenger_id
     WHERE b.ride_id = ? AND b.passenger_id = ?
     LIMIT 1`,
    [rideId, userId]
  );
  return rows[0] || null;
}

export async function createRideRating(req, res) {
  const userId = req.user?.id;
  if (!userId) return res.status(401).json({ message: "Non authentifié." });

  const { id: rideId } = req.params;
  const { rating, comment } = req.body || {};
  const ratingNum = Number(rating);

  if (!Number.isInteger(ratingNum) || ratingNum < 1 || ratingNum > 5) {
    return res.status(400).json({ message: "La note doit être un entier entre 1 et 5." });
  }

  try {
    const booking = await getRatingContext(rideId, userId);
    if (!booking) {
      return res.status(403).json({ message: "Tu ne peux noter que les trajets que tu as réservés." });
    }
    if (Number(booking.driver_id) === Number(userId)) {
      return res.status(403).json({ message: "Tu ne peux pas te noter toi-même." });
    }
    if (booking.booking_status !== "CONFIRMED") {
      return res.status(409).json({ message: "Cette réservation n'est pas confirmée." });
    }
    if (new Date(booking.departure_datetime).getTime() > Date.now()) {
      return res.status(409).json({ message: "Tu pourras noter ce trajet après son départ." });
    }
    if (booking.rating_id) {
      return res.status(409).json({ message: "Tu as déjà noté ce trajet." });
    }

    await pool.execute(
      `INSERT INTO ratings (ride_id, passenger_id, rating, comment, created_at)
       VALUES (?, ?, ?, ?, NOW())`,
      [rideId, userId, ratingNum, comment?.trim() || null]
    );

    return res.status(201).json({ message: "Merci, ta note a bien été enregistrée." });
  } catch {
    return res.status(500).json({ message: "Erreur serveur lors de l'enregistrement de la note." });
  }
}

export async function updateRideRating(req, res) {
  const userId = req.user?.id;
  if (!userId) return res.status(401).json({ message: "Non authentifié." });

  const { id: rideId } = req.params;
  const { rating, comment } = req.body || {};
  const ratingNum = Number(rating);

  if (!Number.isInteger(ratingNum) || ratingNum < 1 || ratingNum > 5) {
    return res.status(400).json({ message: "La note doit être un entier entre 1 et 5." });
  }

  try {
    const booking = await getRatingContext(rideId, userId);
    if (!booking || !booking.rating_id) {
      return res.status(404).json({ message: "Note introuvable pour ce trajet." });
    }

    await pool.execute(
      `UPDATE ratings
       SET rating = ?, comment = ?
       WHERE id = ?`,
      [ratingNum, comment?.trim() || null, booking.rating_id]
    );

    return res.json({ message: "Ta note a été mise à jour." });
  } catch {
    return res.status(500).json({ message: "Erreur serveur lors de la mise à jour de la note." });
  }
}

export async function deleteRideRating(req, res) {
  const userId = req.user?.id;
  if (!userId) return res.status(401).json({ message: "Non authentifié." });

  const { id: rideId } = req.params;

  try {
    const booking = await getRatingContext(rideId, userId);
    if (!booking || !booking.rating_id) {
      return res.status(404).json({ message: "Note introuvable pour ce trajet." });
    }

    await pool.execute(`DELETE FROM ratings WHERE id = ?`, [booking.rating_id]);
    return res.json({ message: "Ta note a été supprimée." });
  } catch {
    return res.status(500).json({ message: "Erreur serveur lors de la suppression de la note." });
  }
}

export async function cancelBooking(req, res) {
  const userId = req.user?.id;
  if (!userId) return res.status(401).json({ message: "Non authentifié." });

  const { id: bookingId } = req.params;

  const conn = await pool.getConnection();
  try {
    await conn.beginTransaction();

    const [rows] = await conn.execute(
      `SELECT
         b.id,
         b.ride_id,
         b.status,
         b.seats_booked,
         r.status AS ride_status,
         r.seats_available AS seats_available,
         r.seats_total AS seats_total
       FROM bookings b
       JOIN rides r ON r.id = b.ride_id
       WHERE b.id = ? AND b.passenger_id = ?
       FOR UPDATE`,
      [bookingId, userId]
    );

    if (rows.length === 0) {
      await conn.rollback();
      return res.status(404).json({ message: "Réservation introuvable." });
    }

    const booking = rows[0];

    if (booking.status === "CANCELLED") {
      await conn.rollback();
      return res.status(409).json({ message: "Réservation déjà annulée." });
    }

    // Annulation: remettre les places
    await conn.execute(
      `UPDATE bookings
       SET status = 'CANCELLED'
       WHERE id = ?`,
      [bookingId]
    );

    await conn.execute(
      `UPDATE rides
       SET seats_available = LEAST(seats_available + ?, seats_total)
       WHERE id = ?`,
      [booking.seats_booked, booking.ride_id]
    );

    await conn.commit();
    return res.json({ message: "Réservation annulée." });
  } catch {
    await conn.rollback();
    return res.status(500).json({ message: "Erreur serveur lors de l'annulation." });
  } finally {
    conn.release();
  }
}

