import { Router } from "express";
import { authMiddleware, requireAdmin } from "../middleware/auth.middleware.js";
import {
  listUsers,
  setUserActive,
  listRidesAdmin,
  cancelRideAdmin,
  listBookingsAdmin,
} from "../controllers/admin.controller.js";

const router = Router();

router.use(authMiddleware);
router.use(requireAdmin);

router.get("/users", listUsers);
router.patch("/users/:id/disable", setUserActive); // active -> 0

router.get("/rides", listRidesAdmin);
router.delete("/rides/:id", cancelRideAdmin);

router.get("/bookings", listBookingsAdmin);

export default router;

