import express from "express";
import { authenticate } from "../middleware/auth.middleware.js";
import {
  getMyNotifications,
  markAsRead,
  markAllAsRead,
} from "../controllers/notifications.controller.js";

const router = express.Router();

router.use(authenticate);

router.get("/", getMyNotifications);
router.patch("/mark-all-read", markAllAsRead);
router.patch("/:id/read", markAsRead);

export default router;
