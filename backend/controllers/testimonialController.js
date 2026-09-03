import pool from "../db.js";

// Get approved testimonials
export const getTestimonials = async (req, res) => {
  try {
    const [rows] = await pool.query(`
      SELECT id, name, quote, rating, created_at
      FROM testimonials
      WHERE status = 'approved'
      ORDER BY created_at DESC
    `);

    res.json({
      success: true,
      data: rows,
    });
  } catch (error) {
    console.error("Error fetching testimonials:", error);

    res.status(500).json({
      success: false,
      message: "Failed to fetch testimonials.",
    });
  }
};

// Submit a testimonial
export const createTestimonial = async (req, res) => {
  try {
    const { name, quote, rating } = req.body;

    if (!name || !quote || !rating) {
      return res.status(400).json({
        success: false,
        message: "Name, quote and rating are required.",
      });
    }

    if (rating < 1 || rating > 5) {
      return res.status(400).json({
        success: false,
        message: "Rating must be between 1 and 5.",
      });
    }

    const [result] = await pool.query(
      `
      INSERT INTO testimonials
        (name, quote, rating, status)
      VALUES
        (?, ?, ?, 'pending')
      `,
      [name, quote, rating],
    );

    res.status(201).json({
      success: true,
      message: "Your review has been submitted and is awaiting approval.",
      id: result.insertId,
    });
  } catch (error) {
    console.error("Error creating testimonial:", error);

    res.status(500).json({
      success: false,
      message: "Failed to submit testimonial.",
    });
  }
};
