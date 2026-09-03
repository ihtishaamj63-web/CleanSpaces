import { Router } from "express";
import { getCleanupPhotos } from "../controllers/reviewController.js";

const router = Router();

router.get("/cleanup-photos", getCleanupPhotos);

export default router;
