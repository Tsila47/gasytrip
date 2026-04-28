import { pool } from "../config/db.js";

export async function getMyNotifications(req, res) {
  try {
    const userId = req.user.id;
    const [rows] = await pool.query(
      `SELECT * FROM notifications
       WHERE user_id = ?
       ORDER BY created_at DESC
       LIMIT 50`,
      [userId]
    );

    const [countRows] = await pool.query(
      `SELECT COUNT(*) as unreadCount FROM notifications WHERE user_id = ? AND is_read = 0`,
      [userId]
    );

    res.json({
      notifications: rows,
      unreadCount: countRows[0].unreadCount,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Erreur serveur (notifications)." });
  }
}

export async function markAsRead(req, res) {
  try {
    const userId = req.user.id;
    const { id } = req.params;

    await pool.query(
      `UPDATE notifications SET is_read = 1 WHERE id = ? AND user_id = ?`,
      [id, userId]
    );

    res.json({ message: "Notification marquée comme lue." });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Erreur serveur." });
  }
}

export async function markAllAsRead(req, res) {
  try {
    const userId = req.user.id;

    await pool.query(
      `UPDATE notifications SET is_read = 1 WHERE user_id = ?`,
      [userId]
    );

    res.json({ message: "Toutes les notifications ont été marquées comme lues." });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Erreur serveur." });
  }
}
