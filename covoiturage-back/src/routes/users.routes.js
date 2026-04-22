import { Router } from "express";
import { getPublicUserProfile } from "../controllers/users.controller.js";

const router = Router();

router.get("/:id/public", getPublicUserProfile);

export default router;
