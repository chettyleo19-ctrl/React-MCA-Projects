import express from "express";
import db from "../db.js";
import { verifyToken } from "../middleware/authMiddleware.js";

const router = express.Router();

router.use(verifyToken);

// Get teacher's assigned subjects
router.get("/subjects", (req, res) => {
  if (req.user.role !== "teacher") {
    return res.status(403).json({ message: "Access denied" });
  }

  const sql = `
    SELECT s.subject_id, s.subject_name, s.subject_code
    FROM subjects s
    JOIN teachers t ON s.teacher_id = t.teacher_id
    WHERE t.user_id = ?
  `;

  db.query(sql, [req.user.user_id], (err, results) => {
    if (err) {
      console.error(err);
      return res.status(500).json({ message: "Failed to load subjects" });
    }

    res.json(results);
  });
});

// Get students and their marks for an assigned subject
router.get("/subjects/:subjectId/students", (req, res) => {
  if (req.user.role !== "teacher") {
    return res.status(403).json({ message: "Access denied" });
  }

  const { subjectId } = req.params;
  const { exam_type = "Internal" } = req.query;

  const sql = `
    SELECT
      st.student_id,
      st.student_name,
      st.email,
      m.mark_id,
      m.marks_obtained,
      m.max_marks,
      m.exam_type
    FROM subjects s
    JOIN teachers t ON s.teacher_id = t.teacher_id
    JOIN marks m ON m.subject_id = s.subject_id
    RIGHT JOIN students st ON st.student_id = m.student_id
    WHERE s.subject_id = ?
      AND t.user_id = ?
  `;

  db.query(sql, [subjectId, req.user.user_id], (err, results) => {
    if (err) {
      console.error(err);
      return res.status(500).json({ message: "Failed to load students" });
    }

    res.json(results);
  });
});

// Add or update student marks
router.post("/marks", (req, res) => {
  if (req.user.role !== "teacher") {
    return res.status(403).json({ message: "Access denied" });
  }

  const { student_id, subject_id, marks_obtained, max_marks, exam_type } = req.body;

  if (
    !student_id ||
    !subject_id ||
    marks_obtained === undefined ||
    !exam_type ||
    Number(marks_obtained) < 0 ||
    Number(max_marks) <= 0 ||
    Number(marks_obtained) > Number(max_marks)
  ) {
    return res.status(400).json({ message: "Invalid marks details" });
  }

  // Ensure teacher is assigned to this subject
  const checkSql = `
    SELECT subject_id
    FROM subjects s
    JOIN teachers t ON s.teacher_id = t.teacher_id
    WHERE s.subject_id = ? AND t.user_id = ?
  `;

  db.query(checkSql, [subject_id, req.user.user_id], (err, results) => {
    if (err) {
      return res.status(500).json({ message: "Database error" });
    }

    if (results.length === 0) {
      return res.status(403).json({ message: "You are not assigned to this subject" });
    }

    const sql = `
      INSERT INTO marks
        (student_id, subject_id, marks_obtained, max_marks, exam_type)
      VALUES (?, ?, ?, ?, ?)
      ON DUPLICATE KEY UPDATE
        marks_obtained = VALUES(marks_obtained),
        max_marks = VALUES(max_marks)
    `;

    db.query(
      sql,
      [student_id, subject_id, marks_obtained, max_marks || 100, exam_type],
      (err) => {
        if (err) {
          console.error(err);
          return res.status(500).json({ message: "Failed to save marks" });
        }

        res.json({ message: "Marks saved successfully" });
      }
    );
  });
});

export default router;