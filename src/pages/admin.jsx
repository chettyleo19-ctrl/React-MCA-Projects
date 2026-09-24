import { useNavigate } from "react-router-dom";

function Admin() {
  const navigate = useNavigate();

  const user = JSON.parse(localStorage.getItem("user") || "null");

  // ================= LOGOUT FUNCTION =================

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");

    navigate("/");
  };

  return (
    <div className="dashboard-container">

      {/* ================= NAVBAR ================= */}

      <nav className="navbar">
        <h2>SIMS</h2>

        <div className="navbar-right">
          <span>
            Admin: {user?.username || "Admin"}
          </span>

          <button
            className="logout-button"
            onClick={handleLogout}
          >
            Logout
          </button>
        </div>
      </nav>

      {/* ================= DASHBOARD CONTENT ================= */}

      <div className="dashboard-content">

        <h1>Admin Dashboard</h1>

        <p>
          Welcome to the College Management System.
          Manage students, teachers, and academic activities
          from your Admin Portal.
        </p>

        {/* ================= DASHBOARD CARDS ================= */}

        <div className="dashboard-cards">

          {/* ================= STUDENT PORTAL ================= */}

          <div className="dashboard-card">

            <h3>Student Portal</h3>

            <p>
              View and access student-related information
              and academic activities.
            </p>

            {/* Open Student Portal */}

            <button
              className="dashboard-button"
              onClick={() => navigate("/student")}
            >
              Open Student Portal
            </button>

            {/* Manage Students */}

            <button
              className="dashboard-button"
              onClick={() => navigate("/admin/students")}
            >
              Manage Students
            </button>

          </div>

          {/* ================= TEACHER PORTAL ================= */}

          <div className="dashboard-card">

            <h3>Teacher Portal</h3>

            <p>
              Access teacher information and
              academic activities.
            </p>

            {/* Open Teacher Portal */}

            <button
              className="dashboard-button"
              onClick={() => navigate("/teacher")}
            >
              Open Teacher Portal
            </button>

            {/* Manage Teachers */}

            <button
              className="dashboard-button"
              onClick={() => navigate("/admin/teachers")}
            >
              Manage Teachers
            </button>

          </div>

          {/* ================= SUBJECT MANAGEMENT ================= */}

          <div className="dashboard-card">

            <h3>Subject Management</h3>

            <p>
              Manage subjects, subject codes,
              and academic details.
            </p>

            <button
  className="dashboard-button"
  onClick={() => navigate("/admin/subjects")}
>
  Manage Subjects
</button>

          </div>

        </div>
      </div>
    </div>
  );
}

export default Admin;