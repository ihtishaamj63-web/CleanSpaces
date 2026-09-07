import pool from "../db.js";

// Get before/after cleanup photos
export const getCleanupPhotos = async (req, res) => {
  try {
    const [rows] = await pool.query(`
      SELECT
        id,
        before_url,
        after_url,
        notes,
        date_cleaned
      FROM cleanup_reports
      ORDER BY date_cleaned DESC
    `);

    res.json({
      success: true,
      data: rows,
    });
  } catch (error) {
    console.error("Error fetching cleanup photos:", error);

    res.status(500).json({
      success: false,
      message: "Failed to fetch cleanup photos.",
    });
  }
};
