import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { pool } from "../config/db.js";
import { sendWelcomeEmail } from "../services/email.service.js";

export async function register(req, res) {
  try {
    const { name, email, password, phone } = req.body || {};

    if (!name?.trim() || !email?.trim() || !password) {
      return res.status(400).json({ message: "Champs requis manquants." });
    }
    if (password.length < 6) {
      return res.status(400).json({ message: "Le mot de passe doit faire au moins 6 caractères." });
    }

    const normalizedEmail = email.trim().toLowerCase();

    const [existing] = await pool.execute(
      "SELECT id FROM users WHERE email = ? LIMIT 1",
      [normalizedEmail]
    );
    if (existing.length > 0) {
      return res.status(409).json({ message: "Cet email est déjà utilisé." });
    }

    const password_hash = await bcrypt.hash(password, 10);
    const role = "USER";
    const is_active = 1;

    const [result] = await pool.execute(
      `INSERT INTO users (name, email, password_hash, phone, role, is_active)
       VALUES (?, ?, ?, ?, ?, ?)`,
      [name.trim(), normalizedEmail, password_hash, phone ?? null, role, is_active]
    );

    const userId = result.insertId;

    const token = jwt.sign(
      { id: userId, role },
      process.env.JWT_SECRET,
      { expiresIn: process.env.JWT_EXPIRES_IN || "1d" }
    );

    // Envoi email de bienvenue — non bloquant
    sendWelcomeEmail({ name: name.trim(), email: normalizedEmail });

    return res.status(201).json({
      token,
      user: {
        id: userId,
        name: name.trim(),
        email: normalizedEmail,
        phone: phone ?? null,
        role,
      },
    });
  } catch (err) {
    return res.status(500).json({ message: "Erreur serveur lors de l'inscription." });
  }
}

export async function login(req, res) {
  try {
    const { email, password } = req.body || {};

    if (!email?.trim() || !password) {
      return res.status(400).json({ message: "Email et mot de passe requis." });
    }

    const normalizedEmail = email.trim().toLowerCase();
    const [rows] = await pool.execute(
      `SELECT id, name, email, phone, password_hash, role, is_active
       FROM users WHERE email = ? LIMIT 1`,
      [normalizedEmail]
    );

    if (rows.length === 0) {
      return res.status(401).json({ message: "Identifiants invalides." });
    }

    const user = rows[0];

    if (user.is_active !== 1) {
      return res.status(403).json({ message: "Compte désactivé." });
    }

    const ok = await bcrypt.compare(password, user.password_hash);
    if (!ok) {
      return res.status(401).json({ message: "Identifiants invalides." });
    }

    const token = jwt.sign(
      { id: user.id, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: process.env.JWT_EXPIRES_IN || "1d" }
    );

    return res.json({
      token,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        phone: user.phone ?? null,
        role: user.role,
      },
    });
  } catch (err) {
    return res.status(500).json({ message: "Erreur serveur lors de la connexion." });
  }
}

export async function me(req, res) {
  try {
    const userId = req.user?.id;
    if (!userId) {
      return res.status(401).json({ message: "Utilisateur non authentifié." });
    }

    const [rows] = await pool.execute(
      `SELECT id, name, email, phone, role, is_active
       FROM users WHERE id = ? LIMIT 1`,
      [userId]
    );

    if (rows.length === 0) {
      return res.status(404).json({ message: "Utilisateur introuvable." });
    }

    const user = rows[0];
    return res.json({
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        phone: user.phone ?? null,
        role: user.role,
        is_active: user.is_active,
      },
    });
  } catch (err) {
    return res.status(500).json({ message: "Erreur serveur lors de la récupération du profil." });
  }
}