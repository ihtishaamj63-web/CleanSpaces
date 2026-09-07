import pool from "../db.js";
import { sendContactEmail } from "../services/emailService.js";

export const submitContact = async (req, res) => {
  try {
    const { name, email, phone, subject, message } = req.body;

    // Validate required fields
    if (!name || !email || !subject || !message) {
      return res.status(400).json({
        success: false,
        message: "Please fill in all required fields.",
      });
    }

    // Save contact submission to database
    const [result] = await pool.query(
      `INSERT INTO contact_submissions
       (name, email, phone, subject, message)
       VALUES (?, ?, ?, ?, ?)`,
      [name, email, phone || null, subject, message],
    );

    // Send email notification
    await sendContactEmail({
      name,
      email,
      phone,
      subject,
      message,
    });

    res.status(201).json({
      success: true,
      message: "Your message has been submitted successfully.",
      id: result.insertId,
    });
  } catch (error) {
    console.error("Contact submission error:", error);

    res.status(500).json({
      success: false,
      message: "Something went wrong while submitting your message.",
    });
  }
};
