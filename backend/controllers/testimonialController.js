import pool from "../db.js";

// Get approved testimonials (public — carousel / reviews page)
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

// Get pending testimonials (admin only — feeds the About page moderation view)
export const listPendingTestimonials = async (req, res) => {
  try {
    const [rows] = await pool.query(`
      SELECT id, name, quote, rating, created_at
      FROM testimonials
      WHERE status = 'pending'
      ORDER BY created_at DESC
    `);

    res.json({
      success: true,
      data: rows,
    });
  } catch (error) {
    console.error("Error fetching pending testimonials:", error);

    res.status(500).json({
      success: false,
      message: "Failed to fetch pending testimonials.",
    });
  }
};

// Submit a testimonial (public — saved as pending, invisible until approved)
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

// Approve or reject a testimonial (admin only)
export const moderateTestimonial = async (req, res) => {
  try {
    const { status } = req.body;

    if (!["approved", "rejected"].includes(status)) {
      return res.status(400).json({
        success: false,
        message: "Status must be approved or rejected.",
      });
    }

    const [result] = await pool.query(
      "UPDATE testimonials SET status = ? WHERE id = ?",
      [status, req.params.id],
    );

    if (!result.affectedRows) {
      return res.status(404).json({
        success: false,
        message: "Testimonial not found.",
      });
    }

    res.json({
      success: true,
      message:
        status === "approved"
          ? "Review approved and published."
          : "Review rejected.",
    });
  } catch (error) {
    console.error("Error moderating testimonial:", error);

    res.status(500).json({
      success: false,
      message: "Failed to update testimonial.",
    });
  }
};