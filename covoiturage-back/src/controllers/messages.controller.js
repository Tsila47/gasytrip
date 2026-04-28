import { pool } from "../config/db.js";
import { getIO } from "../config/socket.js";

// Vérifie qu'un utilisateur peut discuter avec un autre utilisateur sur un trajet donné.
// Règle : il faut que l'un soit le conducteur ET l'autre un passager CONFIRMED du même trajet.
async function assertCanChat(rideId, userId, otherUserId) {
  const [rows] = await pool.query(
    `SELECT r.driver_id,
            EXISTS(
              SELECT 1 FROM bookings b
              WHERE b.ride_id = r.id
                AND b.status = 'CONFIRMED'
                AND b.passenger_id IN (?, ?)
            ) AS hasPassenger
     FROM rides r
     WHERE r.id = ?
     LIMIT 1`,
    [userId, otherUserId, rideId]
  );
  if (rows.length === 0) return false;
  const driverId = Number(rows[0].driver_id);
  const me = Number(userId);
  const other = Number(otherUserId);
  if (me === other) return false;
  // L'un doit être le driver, l'autre doit être passager confirmé
  if (driverId !== me && driverId !== other) return false;
  // Vérifie que celui qui n'est PAS le driver est bien passager confirmé
  const passengerToCheck = driverId === me ? other : me;
  const [bk] = await pool.query(
    `SELECT 1 FROM bookings
     WHERE ride_id = ? AND passenger_id = ? AND status = 'CONFIRMED'
     LIMIT 1`,
    [rideId, passengerToCheck]
  );
  return bk.length > 0;
}

export async function getConversations(req, res) {
  try {
    const userId = req.user.id;
    // Liste des conversations distinctes : (ride_id, other_user) avec dernier message + non-lus
    const [rows] = await pool.query(
      `SELECT
         m.ride_id,
         CASE WHEN m.sender_id = ? THEN m.receiver_id ELSE m.sender_id END AS other_user_id,
         u.name AS other_user_name,
         r.departure_city,
         r.arrival_city,
         r.departure_datetime,
         (
           SELECT m2.content FROM messages m2
           WHERE m2.ride_id = m.ride_id
             AND ((m2.sender_id = ? AND m2.receiver_id = (CASE WHEN m.sender_id = ? THEN m.receiver_id ELSE m.sender_id END))
               OR (m2.receiver_id = ? AND m2.sender_id = (CASE WHEN m.sender_id = ? THEN m.receiver_id ELSE m.sender_id END)))
           ORDER BY m2.created_at DESC LIMIT 1
         ) AS last_message,
         (
           SELECT m2.created_at FROM messages m2
           WHERE m2.ride_id = m.ride_id
             AND ((m2.sender_id = ? AND m2.receiver_id = (CASE WHEN m.sender_id = ? THEN m.receiver_id ELSE m.sender_id END))
               OR (m2.receiver_id = ? AND m2.sender_id = (CASE WHEN m.sender_id = ? THEN m.receiver_id ELSE m.sender_id END)))
           ORDER BY m2.created_at DESC LIMIT 1
         ) AS last_at,
         (
           SELECT COUNT(*) FROM messages m3
           WHERE m3.ride_id = m.ride_id
             AND m3.receiver_id = ?
             AND m3.sender_id = (CASE WHEN m.sender_id = ? THEN m.receiver_id ELSE m.sender_id END)
             AND m3.is_read = 0
         ) AS unread_count
       FROM messages m
       JOIN users u ON u.id = (CASE WHEN m.sender_id = ? THEN m.receiver_id ELSE m.sender_id END)
       JOIN rides r ON r.id = m.ride_id
       WHERE m.sender_id = ? OR m.receiver_id = ?
       GROUP BY m.ride_id, other_user_id
       ORDER BY last_at DESC`,
      [userId, userId, userId, userId, userId, userId, userId, userId, userId, userId, userId, userId, userId, userId]
    );
    res.json({ conversations: rows });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Erreur serveur (conversations)." });
  }
}

export async function getMessages(req, res) {
  try {
    const userId = req.user.id;
    const rideId = Number(req.params.rideId);
    const otherUserId = Number(req.params.otherUserId);

    const allowed = await assertCanChat(rideId, userId, otherUserId);
    if (!allowed) return res.status(403).json({ message: "Conversation non autorisée." });

    const [rows] = await pool.query(
      `SELECT id, ride_id, sender_id, receiver_id, content, is_read, created_at
       FROM messages
       WHERE ride_id = ?
         AND ((sender_id = ? AND receiver_id = ?) OR (sender_id = ? AND receiver_id = ?))
       ORDER BY created_at ASC
       LIMIT 500`,
      [rideId, userId, otherUserId, otherUserId, userId]
    );

    // Récupère un peu de contexte sur le trajet et l'autre utilisateur
    const [rideRows] = await pool.query(
      `SELECT r.id, r.departure_city, r.arrival_city, r.departure_datetime, r.driver_id, u.name AS other_user_name
       FROM rides r
       JOIN users u ON u.id = ?
       WHERE r.id = ?`,
      [otherUserId, rideId]
    );

    res.json({
      messages: rows,
      ride: rideRows[0] || null,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Erreur serveur (messages)." });
  }
}

export async function sendMessage(req, res) {
  try {
    const userId = req.user.id;
    const rideId = Number(req.params.rideId);
    const otherUserId = Number(req.params.otherUserId);
    const content = (req.body?.content || "").trim();

    if (!content) return res.status(400).json({ message: "Message vide." });
    if (content.length > 2000) return res.status(400).json({ message: "Message trop long." });

    const allowed = await assertCanChat(rideId, userId, otherUserId);
    if (!allowed) return res.status(403).json({ message: "Conversation non autorisée." });

    const [ins] = await pool.query(
      `INSERT INTO messages (ride_id, sender_id, receiver_id, content, is_read, created_at)
       VALUES (?, ?, ?, ?, 0, NOW())`,
      [rideId, userId, otherUserId, content]
    );

    const [msgRows] = await pool.query(
      `SELECT id, ride_id, sender_id, receiver_id, content, is_read, created_at
       FROM messages
       WHERE id = ?
       LIMIT 1`,
      [ins.insertId]
    );
    const message = msgRows[0] || {
      id: ins.insertId,
      ride_id: rideId,
      sender_id: userId,
      receiver_id: otherUserId,
      content,
      is_read: 0,
      created_at: new Date().toISOString(),
    };

    // Notification au destinataire
    const [meRows] = await pool.query(`SELECT name FROM users WHERE id = ? LIMIT 1`, [userId]);
    const senderName = meRows[0]?.name || "Quelqu'un";
    await pool.query(
      `INSERT INTO notifications (user_id, type, title, message, link, created_at)
       VALUES (?, 'MESSAGE_NEW', ?, ?, ?, NOW())`,
      [
        otherUserId,
        "Nouveau message",
        `${senderName} : ${content.slice(0, 80)}${content.length > 80 ? "…" : ""}`,
        `/me/messages?ride=${rideId}&with=${userId}`,
      ]
    );

    // Temps réel: envoyer aux deux utilisateurs (destinataire + expéditeur)
    try {
      const io = getIO();
      io.to(`user_${otherUserId}`).to(`user_${userId}`).emit("new_message", { message });
    } catch {
      // Socket.IO non initialisé (ou erreur) : on n'empêche pas l'envoi HTTP
    }

    res.status(201).json({ message });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Erreur serveur (envoi message)." });
  }
}

export async function markMessagesAsRead(req, res) {
  try {
    const userId = req.user.id;
    const rideId = Number(req.params.rideId);
    const otherUserId = Number(req.params.otherUserId);

    await pool.query(
      `UPDATE messages
       SET is_read = 1
       WHERE ride_id = ? AND sender_id = ? AND receiver_id = ? AND is_read = 0`,
      [rideId, otherUserId, userId]
    );
    res.json({ ok: true });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Erreur serveur." });
  }
}

// Liste les contacts possibles pour un trajet (utile pour le bouton "Messages" côté conducteur)
export async function getRideContacts(req, res) {
  try {
    const userId = req.user.id;
    const rideId = Number(req.params.rideId);

    const [rideRows] = await pool.query(
      `SELECT id, driver_id, departure_city, arrival_city, departure_datetime
       FROM rides WHERE id = ? LIMIT 1`,
      [rideId]
    );
    if (rideRows.length === 0) return res.status(404).json({ message: "Trajet introuvable." });
    const ride = rideRows[0];

    if (Number(ride.driver_id) === Number(userId)) {
      // Conducteur : retourne les passagers confirmés
      const [pax] = await pool.query(
        `SELECT u.id, u.name
         FROM bookings b
         JOIN users u ON u.id = b.passenger_id
         WHERE b.ride_id = ? AND b.status = 'CONFIRMED'`,
        [rideId]
      );
      return res.json({ ride, role: "driver", contacts: pax });
    }

    // Passager : doit avoir une réservation confirmée → contact = conducteur
    const [bk] = await pool.query(
      `SELECT 1 FROM bookings
       WHERE ride_id = ? AND passenger_id = ? AND status = 'CONFIRMED' LIMIT 1`,
      [rideId, userId]
    );
    if (bk.length === 0) return res.status(403).json({ message: "Pas de réservation confirmée." });

    const [drv] = await pool.query(`SELECT id, name FROM users WHERE id = ? LIMIT 1`, [ride.driver_id]);
    return res.json({ ride, role: "passenger", contacts: drv });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Erreur serveur." });
  }
}