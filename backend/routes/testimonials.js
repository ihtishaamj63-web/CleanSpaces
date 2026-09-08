import { Router } from "express";
import auth, { requireAdmin } from "../middleware/auth.js";
import {
  getTestimonials,
  createTestimonial,
  listPendingTestimonials,
  moderateTestimonial,
} from "../controllers/testimonialController.js";

const router = Router();

// Public approved testimonials
router.get("/", getTestimonials);

// Submit testimonial
router.post("/", createTestimonial);

// Admin: pending list + moderation
router.get("/pending", auth, requireAdmin, listPendingTestimonials);
router.put("/:id/moderate", auth, requireAdmin, moderateTestimonial);

export default router;