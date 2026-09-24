import "dotenv/config";

import express from "express";
import cors from "cors";

import db from "./db.js";

// ==========================================
// IMPORT ROUTES
// ==========================================

import authRoutes from "./routes/auth.js";
import studentRoutes from "./routes/students.js";
import studentPortalRoutes from "./routes/studentPortal.js";
import teacherRoutes from "./routes/teachers.js";
import teacherPortalRoutes from "./routes/teacherPortal.js";
import subjectRoutes from "./routes/subjects.js";

// ==========================================
// INITIALIZE EXPRESS
// ==========================================

const app = express();

// ==========================================
// MIDDLEWARE
// ==========================================

app.use(cors());
app.use(express.json());

// ==========================================
// AUTHENTICATION API
// ==========================================

app.use("/api/auth", authRoutes);

// ==========================================
// STUDENT CRUD API
// ==========================================

app.use("/api/students", studentRoutes);

// ==========================================
// STUDENT PORTAL API
// ==========================================

app.use("/api/student-portal", studentPortalRoutes);

// ==========================================
// TEACHER CRUD API
// ==========================================

app.use("/api/teachers", teacherRoutes);

// ==========================================
// TEACHER PORTAL API
// ==========================================

app.use("/api/teacher-portal", teacherPortalRoutes);

// ==========================================
// SUBJECT MANAGEMENT API
// ==========================================

app.use("/api/subjects", subjectRoutes);

// ==========================================
// HOME ROUTE
// ==========================================

app.get("/", (req, res) => {
  res.send("Student Management System Backend is Running!");
});

// ==========================================
// TEST DATABASE CONNECTION
// ==========================================

app.get("/test-db", (req, res) => {
  db.query("SELECT DATABASE() AS databaseName", (err, result) => {
    if (err) {
      console.error("Database query failed:", err);

      return res.status(500).json({
        message: "Database query failed",
      });
    }

    res.status(200).json({
      message: "Database Connected Successfully!",
      database: result[0].databaseName,
    });
  });
});

// ==========================================
// HANDLE UNKNOWN ROUTES
// ==========================================

app.use((req, res) => {
  res.status(404).json({
    message: `Route not found: ${req.method} ${req.originalUrl}`,
  });
});

// ==========================================
// GLOBAL ERROR HANDLER
// ==========================================

app.use((err, req, res, next) => {
  console.error("Server Error:", err);

  res.status(500).json({
    message: "Internal server error",
  });
});

// ==========================================
// START SERVER
// ==========================================

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log("==================================");
  console.log("SIMS BACKEND STARTED SUCCESSFULLY");
  console.log(`Server running at http://localhost:${PORT}`);
  console.log("Teacher API: /api/teachers");
  console.log("==================================");
}); 