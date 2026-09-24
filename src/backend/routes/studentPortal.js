import express from "express";
import db from "../db.js";

import {
  verifyToken,
  isStudent,
} from "../middleware/authMiddleware.js";

const router = express.Router();

// Student login required
router.use(verifyToken, isStudent);

// ==========================================
// GET LOGGED-IN STUDENT PROFILE + MARKS
// ==========================================

router.get("/me", (req, res) => {
  const userId = req.user.user_id;

  if (!userId) {
    return res.status(401).json({
      message: "Invalid login token. Please log in again.",
    });
  }

  // Find only the student linked to this login
  const profileSql = `
    SELECT
      student_id,
      student_name,
      email,
      phone,
      department,
      admission_date
    FROM students
    WHERE user_id = ?
  `;

  db.query(profileSql, [userId], (err, students) => {
    if (err) {
      console.error("Student profile error:", err);

      return res.status(500).json({
        message: "Failed to fetch student profile.",
      });
    }

    if (students.length === 0) {
      return res.status(404).json({
        message: "No student record is linked to this login.",
      });
    }

    const student = students[0];

    // Fetch marks belonging only to this student
    const marksSql = `
      SELECT
        subjects.subject_name,
        subjects.subject_code,
        marks.exam_type,
        marks.marks_obtained,
        marks.max_marks
      FROM marks
      INNER JOIN subjects
        ON marks.subject_id = subjects.subject_id
      WHERE marks.student_id = ?
      ORDER BY subjects.subject_name
    `;

    db.query(
      marksSql,
      [student.student_id],
      (marksErr, marks) => {
        if (marksErr) {
          console.error("Student marks error:", marksErr);

          return res.status(500).json({
            message: "Failed to fetch academic marks.",
          });
        }

        res.status(200).json({
          profile: student,
          marks: marks,
        });
      }
    );
  });
});

export default router;