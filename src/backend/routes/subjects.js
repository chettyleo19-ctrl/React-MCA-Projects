import express from "express";
import db from "../db.js";

import {
  verifyToken,
  isAdmin,
} from "../middleware/authMiddleware.js";

const router = express.Router();

// Admin-only access
router.use(verifyToken, isAdmin);


// ==========================================
// 1. GET ALL SUBJECTS
// ==========================================

router.get("/", (req, res) => {

  const sql = `
    SELECT
      subjects.subject_id,
      subjects.subject_name,
      subjects.subject_code,
      subjects.teacher_id,
      teachers.teacher_name
    FROM subjects
    LEFT JOIN teachers
      ON subjects.teacher_id = teachers.teacher_id
    ORDER BY subjects.subject_id DESC
  `;

  db.query(sql, (err, results) => {

    if (err) {
      console.error("Fetch subjects error:", err);

      return res.status(500).json({
        message: "Failed to fetch subjects"
      });
    }

    res.status(200).json(results);
  });
});


// ==========================================
// 2. ADD NEW SUBJECT
// ==========================================

router.post("/", (req, res) => {

  const {
    subject_name,
    subject_code,
    teacher_id
  } = req.body;

  if (!subject_name || !subject_code) {
    return res.status(400).json({
      message: "Subject name and subject code are required."
    });
  }

  const sql = `
    INSERT INTO subjects
    (subject_name, subject_code, teacher_id)
    VALUES (?, ?, ?)
  `;

  const values = [
    subject_name,
    subject_code,
    teacher_id || null
  ];

  db.query(sql, values, (err, result) => {

    if (err) {
      console.error("Add subject error:", err);

      if (err.code === "ER_DUP_ENTRY") {
        return res.status(409).json({
          message: "Subject code already exists."
        });
      }

      if (err.code === "ER_NO_REFERENCED_ROW_2") {
        return res.status(400).json({
          message: "Selected teacher does not exist."
        });
      }

      return res.status(500).json({
        message: "Failed to add subject."
      });
    }

    res.status(201).json({
      message: "Subject added successfully!",
      subject_id: result.insertId
    });
  });
});


// ==========================================
// 3. UPDATE SUBJECT
// ==========================================

router.put("/:id", (req, res) => {

  const subjectId = req.params.id;

  const {
    subject_name,
    subject_code,
    teacher_id
  } = req.body;

  if (!subject_name || !subject_code) {
    return res.status(400).json({
      message: "Subject name and subject code are required."
    });
  }

  const sql = `
    UPDATE subjects
    SET
      subject_name = ?,
      subject_code = ?,
      teacher_id = ?
    WHERE subject_id = ?
  `;

  const values = [
    subject_name,
    subject_code,
    teacher_id || null,
    subjectId
  ];

  db.query(sql, values, (err, result) => {

    if (err) {
      console.error("Update subject error:", err);

      if (err.code === "ER_DUP_ENTRY") {
        return res.status(409).json({
          message: "Subject code already exists."
        });
      }

      if (err.code === "ER_NO_REFERENCED_ROW_2") {
        return res.status(400).json({
          message: "Selected teacher does not exist."
        });
      }

      return res.status(500).json({
        message: "Failed to update subject."
      });
    }

    if (result.affectedRows === 0) {
      return res.status(404).json({
        message: "Subject not found."
      });
    }

    res.status(200).json({
      message: "Subject updated successfully!"
    });
  });
});


// ==========================================
// 4. DELETE SUBJECT
// ==========================================

router.delete("/:id", (req, res) => {

  const subjectId = req.params.id;

  const sql = `
    DELETE FROM subjects
    WHERE subject_id = ?
  `;

  db.query(sql, [subjectId], (err, result) => {

    if (err) {
      console.error("Delete subject error:", err);

      return res.status(500).json({
        message: "Failed to delete subject."
      });
    }

    if (result.affectedRows === 0) {
      return res.status(404).json({
        message: "Subject not found."
      });
    }

    res.status(200).json({
      message: "Subject deleted successfully!"
    });
  });
});


export default router;