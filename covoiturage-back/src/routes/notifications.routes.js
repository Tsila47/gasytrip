import express from "express";
import { authMiddleware } from "../middleware/auth.middleware.js";
import {
  getMyNotifications,
  markAsRead,
  markAllAsRead,
} from "../controllers/notifications.controller.js";

const router = express.Router();

router.use(authMiddleware);

router.get("/", getMyNotifications);
router.patch("/mark-all-read", markAllAsRead);
router.patch("/:id/read", markAsRead);

export default router;
