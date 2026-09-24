import express from "express";
import db from "../db.js";

import {
  verifyToken,
  isAdmin,
} from "../middleware/authMiddleware.js";

const router = express.Router();

// Protect all student routes
router.use(verifyToken, isAdmin);


// ==========================================
// 1. GET ALL STUDENTS
// ==========================================

router.get("/", (req, res) => {
  const sql = `
    SELECT
      student_id,
      student_name,
      email,
      phone,
      department,
      admission_date
    FROM students
    ORDER BY student_id DESC
  `;

  db.query(sql, (err, results) => {
    if (err) {
      console.error("Fetch students error:", err);

      return res.status(500).json({
        message: "Failed to fetch students",
      });
    }

    res.status(200).json(results);
  });
});


// ==========================================
// 2. ADD NEW STUDENT
// ==========================================

router.post("/", (req, res) => {
  const {
    student_name,
    email,
    phone,
    department,
    admission_date,
  } = req.body;

  if (
    !student_name ||
    !email ||
    !phone ||
    !department ||
    !admission_date
  ) {
    return res.status(400).json({
      message: "Please fill in all required fields.",
    });
  }

  const sql = `
    INSERT INTO students
    (
      student_name,
      email,
      phone,
      department,
      admission_date
    )
    VALUES (?, ?, ?, ?, ?)
  `;

  const values = [
    student_name,
    email,
    phone,
    department,
    admission_date,
  ];

  db.query(sql, values, (err, result) => {
    if (err) {
      console.error("Add student error:", err);

      if (err.code === "ER_DUP_ENTRY") {
        return res.status(409).json({
          message: "Email already exists.",
        });
      }

      return res.status(500).json({
        message: "Failed to add student.",
      });
    }

    res.status(201).json({
      message: "Student added successfully!",
      student_id: result.insertId,
    });
  });
});


// ==========================================
// 3. UPDATE STUDENT
// ==========================================

router.put("/:id", (req, res) => {
  const studentId = req.params.id;

  const {
    student_name,
    email,
    phone,
    department,
    admission_date,
  } = req.body;

  if (
    !student_name ||
    !email ||
    !phone ||
    !department ||
    !admission_date
  ) {
    return res.status(400).json({
      message: "Please fill in all required fields.",
    });
  }

  const sql = `
    UPDATE students
    SET
      student_name = ?,
      email = ?,
      phone = ?,
      department = ?,
      admission_date = ?
    WHERE student_id = ?
  `;

  const values = [
    student_name,
    email,
    phone,
    department,
    admission_date,
    studentId,
  ];

  db.query(sql, values, (err, result) => {
    if (err) {
      console.error("Update student error:", err);

      if (err.code === "ER_DUP_ENTRY") {
        return res.status(409).json({
          message: "Email already exists.",
        });
      }

      return res.status(500).json({
        message: "Failed to update student.",
      });
    }

    if (result.affectedRows === 0) {
      return res.status(404).json({
        message: "Student not found.",
      });
    }

    res.status(200).json({
      message: "Student updated successfully!",
    });
  });
});


// ==========================================
// 4. DELETE STUDENT
// ==========================================

router.delete("/:id", (req, res) => {
  const studentId = req.params.id;

  db.query(
    "DELETE FROM students WHERE student_id = ?",
    [studentId],
    (err, result) => {
      if (err) {
        console.error("Delete student error:", err);

        return res.status(500).json({
          message: "Failed to delete student.",
        });
      }

      if (result.affectedRows === 0) {
        return res.status(404).json({
          message: "Student not found.",
        });
      }

      res.status(200).json({
        message: "Student deleted successfully!",
      });
    }
  );
});

export default router;