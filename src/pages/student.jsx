import { useEffect, useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";

function Student() {
  const navigate = useNavigate();

  const [profile, setProfile] = useState(null);
  const [marks, setMarks] = useState([]);
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(true);

  // ==========================================
  // FETCH STUDENT PROFILE AND MARKS
  // ==========================================

  useEffect(() => {
    const fetchStudentData = async () => {
      try {
        const token = localStorage.getItem("token");

        const response = await axios.get(
          "http://localhost:5000/api/student-portal/me",
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );

        setProfile(response.data.profile);
        setMarks(response.data.marks);
      } catch (error) {
        console.error("Student portal error:", error);

        setMessage(
          error.response?.data?.message ||
            "Failed to load student details."
        );
      } finally {
        setLoading(false);
      }
    };

    fetchStudentData();
  }, []);

  // ==========================================
  // LOGOUT
  // ==========================================

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");

    navigate("/");
  };

  // ==========================================
  // LOADING
  // ==========================================

  if (loading) {
    return <h2>Loading Student Portal...</h2>;
  }

  // ==========================================
  // PAGE
  // ==========================================

  return (
    <div className="dashboard-container">

      {/* NAVBAR */}

      <nav className="navbar">
        <h2>SIMS</h2>

        <div className="navbar-right">
          <span>Student Portal</span>

          <button
            className="logout-button"
            onClick={handleLogout}
          >
            Logout
          </button>
        </div>
      </nav>

      {/* CONTENT */}

      <div className="dashboard-content">

        <h1>Student Dashboard</h1>

        <p>
          Welcome to your Student Portal.
          View your profile and academic performance here.
        </p>

        {/* ERROR MESSAGE */}

        {message && (
          <div className="success-message">
            {message}
          </div>
        )}

        {/* STUDENT PROFILE */}

        {profile && (
          <div className="student-form-card">

            <h2>My Profile</h2>

            <div className="profile-details">

              <p>
                <strong>Student ID:</strong>{" "}
                {profile.student_id}
              </p>

              <p>
                <strong>Name:</strong>{" "}
                {profile.student_name}
              </p>

              <p>
                <strong>Email:</strong>{" "}
                {profile.email}
              </p>

              <p>
                <strong>Phone:</strong>{" "}
                {profile.phone}
              </p>

              <p>
                <strong>Department:</strong>{" "}
                {profile.department}
              </p>

              <p>
                <strong>Admission Date:</strong>{" "}
                {profile.admission_date
                  ? new Date(profile.admission_date)
                      .toISOString()
                      .split("T")[0]
                  : "N/A"}
              </p>

            </div>
          </div>
        )}

        {/* ACADEMIC MARKS */}

        {profile && (
          <div className="student-table-card">

            <h2>My Academic Marks</h2>

            <div className="table-responsive">

              <table className="student-table">

                <thead>
                  <tr>
                    <th>Subject</th>
                    <th>Subject Code</th>
                    <th>Exam Type</th>
                    <th>Marks Obtained</th>
                    <th>Maximum Marks</th>
                  </tr>
                </thead>

                <tbody>

                  {marks.length === 0 ? (
                    <tr>
                      <td colSpan="5">
                        No academic marks available.
                      </td>
                    </tr>
                  ) : (
                    marks.map((mark, index) => (
                      <tr key={index}>
                        <td>{mark.subject_name}</td>
                        <td>{mark.subject_code}</td>
                        <td>{mark.exam_type}</td>
                        <td>{mark.marks_obtained}</td>
                        <td>{mark.max_marks}</td>
                      </tr>
                    ))
                  )}

                </tbody>

              </table>

            </div>
          </div>
        )}

        {/* BACK TO DASHBOARD */}

        <button
          className="dashboard-button"
          onClick={() => navigate("/admin")}
        >
          Back to Dashboard
        </button>

      </div>
    </div>
  );
}

export default Student;