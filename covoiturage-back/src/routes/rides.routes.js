import { Router } from "express";
import { authMiddleware } from "../middleware/auth.middleware.js";
import {
  listRides,
  getRideById,
  createRide,
  createBooking,
  listMyRides,
  listMyBookings,
  cancelBooking,
} from "../controllers/rides.controller.js";

const router = Router();

// Protected routes (declare before "/:id" to avoid route conflicts)
router.get("/me/rides", authMiddleware, listMyRides);
router.get("/me/bookings", authMiddleware, listMyBookings);
router.delete("/bookings/:id", authMiddleware, cancelBooking);

// Public routes
router.get("/", listRides);
router.get("/:id", getRideById);

// Protected writes / actions
router.post("/", authMiddleware, createRide);
router.post("/:id/bookings", authMiddleware, createBooking);

export default router;

