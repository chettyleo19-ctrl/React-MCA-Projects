import express from "express";
import db from "../db.js";

import {
  verifyToken,
  isAdmin,
} from "../middleware/authMiddleware.js";

const router = express.Router();

// Protect all teacher routes
router.use(verifyToken, isAdmin);


// ==========================================
// 1. GET ALL TEACHERS
// ==========================================

router.get("/", (req, res) => {
  const sql = `
    SELECT
      teacher_id,
      teacher_name,
      email,
      phone,
      department
    FROM teachers
    ORDER BY teacher_id DESC
  `;

  db.query(sql, (err, results) => {
    if (err) {
      console.error(err);

      return res.status(500).json({
        message: "Failed to fetch teachers",
      });
    }

    res.json(results);
  });
});


// ==========================================
// 2. ADD TEACHER
// ==========================================

router.post("/", (req, res) => {
  const {
    teacher_name,
    email,
    phone,
    department,
  } = req.body;

  if (!teacher_name || !email || !phone || !department) {
    return res.status(400).json({
      message: "Please fill in all fields",
    });
  }

  const sql = `
    INSERT INTO teachers
    (teacher_name, email, phone, department)
    VALUES (?, ?, ?, ?)
  `;

  db.query(
    sql,
    [teacher_name, email, phone, department],
    (err, result) => {
      if (err) {
        console.error(err);

        if (err.code === "ER_DUP_ENTRY") {
          return res.status(409).json({
            message: "Teacher email already exists",
          });
        }

        return res.status(500).json({
          message: "Failed to add teacher",
        });
      }

      res.status(201).json({
        message: "Teacher added successfully!",
        teacher_id: result.insertId,
      });
    }
  );
});


// ==========================================
// 3. UPDATE TEACHER
// ==========================================

router.put("/:id", (req, res) => {
  const teacherId = req.params.id;

  const {
    teacher_name,
    email,
    phone,
    department,
  } = req.body;

  if (!teacher_name || !email || !phone || !department) {
    return res.status(400).json({
      message: "Please fill in all fields",
    });
  }

  const sql = `
    UPDATE teachers
    SET
      teacher_name = ?,
      email = ?,
      phone = ?,
      department = ?
    WHERE teacher_id = ?
  `;

  db.query(
    sql,
    [teacher_name, email, phone, department, teacherId],
    (err, result) => {
      if (err) {
        console.error(err);

        if (err.code === "ER_DUP_ENTRY") {
          return res.status(409).json({
            message: "Teacher email already exists",
          });
        }

        return res.status(500).json({
          message: "Failed to update teacher",
        });
      }

      if (result.affectedRows === 0) {
        return res.status(404).json({
          message: "Teacher not found or no changes made",
        });
      }

      res.json({
        message: "Teacher updated successfully!",
      });
    }
  );
});


// ==========================================
// 4. DELETE TEACHER
// ==========================================

router.delete("/:id", (req, res) => {
  const teacherId = req.params.id;

  db.query(
    "DELETE FROM teachers WHERE teacher_id = ?",
    [teacherId],
    (err, result) => {
      if (err) {
        console.error(err);

        return res.status(500).json({
          message: "Failed to delete teacher",
        });
      }

      if (result.affectedRows === 0) {
        return res.status(404).json({
          message: "Teacher not found",
        });
      }

      res.json({
        message: "Teacher deleted successfully!",
      });
    }
  );
});

export default router;