import { Router } from "express";
import { authMiddleware } from "../middleware/auth.middleware.js";
import {
  getConversations,
  getMessages,
  sendMessage,
  markMessagesAsRead,
  getRideContacts,
} from "../controllers/messages.controller.js";

const router = Router();

router.use(authMiddleware);

router.get("/conversations", getConversations);
router.get("/ride/:rideId/contacts", getRideContacts);
router.get("/:rideId/:otherUserId", getMessages);
router.post("/:rideId/:otherUserId", sendMessage);
router.patch("/:rideId/:otherUserId/read", markMessagesAsRead);

export default router;
