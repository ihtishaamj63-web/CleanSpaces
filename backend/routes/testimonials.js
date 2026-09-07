import { Router } from "express";
import {
  getTestimonials,
  createTestimonial,
} from "../controllers/testimonialController.js";

const router = Router();

// Public approved testimonials
router.get("/", getTestimonials);

// Submit testimonial
router.post("/", createTestimonial);

export default router;
