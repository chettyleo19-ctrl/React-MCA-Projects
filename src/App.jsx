import { BrowserRouter, Routes, Route } from "react-router-dom";

// ==========================================
// IMPORT PAGES
// ==========================================

import Login from "./pages/login";
import Admin from "./pages/admin";
import Student from "./pages/student";

import ManageStudents from "./pages/admin/ManageStudents";
import ManageTeachers from "./pages/admin/ManageTeachers";
import ManageSubjects from "./pages/admin/ManageSubjects";

import TeacherPortal from "./pages/TeacherPortal";

// ==========================================
// IMPORT COMPONENTS
// ==========================================

import ProtectedRoute from "./components/ProtectedRoute";

// ==========================================
// IMPORT CSS
// ==========================================

import "./App.css";

// ==========================================
// MAIN APP COMPONENT
// ==========================================

function App() {
  return (
    <BrowserRouter>
      <Routes>

        {/* ================================== */}
        {/* LOGIN PAGE */}
        {/* ================================== */}

        <Route
          path="/"
          element={<Login />}
        />

        {/* ================================== */}
        {/* ADMIN DASHBOARD */}
        {/* ================================== */}

        <Route
          path="/admin"
          element={
            <ProtectedRoute allowedRoles={["admin"]}>
              <Admin />
            </ProtectedRoute>
          }
        />

        {/* ================================== */}
        {/* STUDENT PORTAL */}
        {/* ================================== */}

        <Route
          path="/student"
          element={
            <ProtectedRoute allowedRoles={["admin", "student"]}>
              <Student />
            </ProtectedRoute>
          }
        />

        {/* ================================== */}
        {/* TEACHER PORTAL */}
        {/* ================================== */}

        <Route
          path="/teacher"
          element={
            <ProtectedRoute allowedRoles={["admin", "teacher"]}>
              <TeacherPortal />
            </ProtectedRoute>
          }
        />

        {/* ================================== */}
        {/* MANAGE STUDENTS */}
        {/* ================================== */}

        <Route
          path="/admin/students"
          element={
            <ProtectedRoute allowedRoles={["admin"]}>
              <ManageStudents />
            </ProtectedRoute>
          }
        />

        {/* ================================== */}
        {/* MANAGE TEACHERS */}
        {/* ================================== */}

        <Route
          path="/admin/teachers"
          element={
            <ProtectedRoute allowedRoles={["admin"]}>
              <ManageTeachers />
            </ProtectedRoute>
          }
        />

        {/* ================================== */}
        {/* MANAGE SUBJECTS */}
        {/* ================================== */}

        <Route
          path="/admin/subjects"
          element={
            <ProtectedRoute allowedRoles={["admin"]}>
              <ManageSubjects />
            </ProtectedRoute>
          }
        />

      </Routes>
    </BrowserRouter>
  );
}

export default App