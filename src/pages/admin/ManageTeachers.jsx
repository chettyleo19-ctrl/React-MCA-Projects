import { useEffect, useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";

function ManageTeachers() {
  const navigate = useNavigate();

  const API = "http://localhost:5000/api/teachers";

  const [teachers, setTeachers] = useState([]);
  const [editingId, setEditingId] = useState(null);
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);

  const [form, setForm] = useState({
    teacher_name: "",
    email: "",
    phone: "",
    department: "",
  });

  // ==========================================
  // AUTHENTICATION CONFIGURATION
  // ==========================================

  const getConfig = () => {
    const token = localStorage.getItem("token");

    return {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    };
  };

  // ==========================================
  // FETCH ALL TEACHERS
  // ==========================================

  const fetchTeachers = async () => {
    try {
      setLoading(true);

      const response = await axios.get(API, getConfig());

      setTeachers(response.data);
    } catch (error) {
      console.error("Fetch teachers error:", error);

      console.error(
        "Backend response:",
        error.response?.data
      );

      setMessage(
        error.response?.data?.message ||
          error.message ||
          "Failed to fetch teachers."
      );
    } finally {
      setLoading(false);
    }
  };

  // Load teachers when page opens
  useEffect(() => {
    fetchTeachers();
  }, []);

  // ==========================================
  // HANDLE INPUT CHANGES
  // ==========================================

  const handleChange = (e) => {
    const { name, value } = e.target;

    setForm((prevForm) => ({
      ...prevForm,
      [name]: value,
    }));
  };

  // ==========================================
  // RESET FORM
  // ==========================================

  const resetForm = () => {
    setForm({
      teacher_name: "",
      email: "",
      phone: "",
      department: "",
    });

    setEditingId(null);
  };

  // ==========================================
  // ADD OR UPDATE TEACHER
  // ==========================================

  const handleSubmit = async (e) => {
    e.preventDefault();

    setMessage("");

    try {
      if (editingId) {
        // UPDATE TEACHER

        const response = await axios.put(
          `${API}/${editingId}`,
          form,
          getConfig()
        );

        setMessage(
          response.data.message || "Teacher updated successfully!"
        );
      } else {
        // ADD NEW TEACHER

        const response = await axios.post(
          API,
          form,
          getConfig()
        );

        setMessage(
          response.data.message || "Teacher added successfully!"
        );
      }

      resetForm();

      await fetchTeachers();
    } catch (error) {
      console.error("Teacher operation error:", error);

      console.error(
        "Backend response:",
        error.response?.data
      );

      setMessage(
        error.response?.data?.message ||
          error.message ||
          "Operation failed."
      );
    }
  };

  // ==========================================
  // EDIT TEACHER
  // ==========================================

  const handleEdit = (teacher) => {
    setEditingId(teacher.teacher_id);

    setForm({
      teacher_name: teacher.teacher_name || "",
      email: teacher.email || "",
      phone: teacher.phone || "",
      department: teacher.department || "",
    });

    setMessage("");

    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  };

  // ==========================================
  // DELETE TEACHER
  // ==========================================

  const handleDelete = async (id) => {
    const confirmDelete = window.confirm(
      "Are you sure you want to delete this teacher?"
    );

    if (!confirmDelete) {
      return;
    }

    setMessage("");

    try {
      const response = await axios.delete(
        `${API}/${id}`,
        getConfig()
      );

      setMessage(
        response.data.message || "Teacher deleted successfully!"
      );

      await fetchTeachers();
    } catch (error) {
      console.error("Delete teacher error:", error);

      console.error(
        "Backend response:",
        error.response?.data
      );

      setMessage(
        error.response?.data?.message ||
          error.message ||
          "Failed to delete teacher."
      );
    }
  };

  // ==========================================
  // RENDER PAGE
  // ==========================================

  return (
    <div className="dashboard-container">

      {/* ================= NAVBAR ================= */}

      <nav className="navbar">
        <h2>SIMS</h2>

        <button
          className="dashboard-button"
          onClick={() => navigate("/admin")}
        >
          Back to Dashboard
        </button>
      </nav>

      {/* ================= PAGE CONTENT ================= */}

      <div className="dashboard-content">

        <h1>Manage Teachers</h1>

        <p>
          Add, view, update, and delete teacher records.
        </p>

        {/* ================= MESSAGE ================= */}

        {message && (
          <div className="success-message">
            {message}
          </div>
        )}

        {/* ================= TEACHER FORM ================= */}

        <div className="student-form-card">

          <h2>
            {editingId ? "Update Teacher" : "Add New Teacher"}
          </h2>

          <form
            onSubmit={handleSubmit}
            className="student-form"
          >

            <input
              type="text"
              name="teacher_name"
              placeholder="Teacher Name"
              value={form.teacher_name}
              onChange={handleChange}
              required
            />

            <input
              type="email"
              name="email"
              placeholder="Email Address"
              value={form.email}
              onChange={handleChange}
              required
            />

            <input
              type="tel"
              name="phone"
              placeholder="Phone Number"
              value={form.phone}
              onChange={handleChange}
              required
            />

            <input
              type="text"
              name="department"
              placeholder="Department"
              value={form.department}
              onChange={handleChange}
              required
            />

            {/* SUBMIT BUTTON */}

            <button
              type="submit"
              className="dashboard-button"
            >
              {editingId ? "Update Teacher" : "Add Teacher"}
            </button>

            {/* CANCEL EDIT */}

            {editingId && (
              <button
                type="button"
                className="logout-button"
                onClick={resetForm}
              >
                Cancel
              </button>
            )}

          </form>
        </div>

        {/* ================= TEACHER TABLE ================= */}

        <div className="student-table-card">

          <h2>Teacher Records</h2>

          <div className="table-responsive">

            <table className="student-table">

              <thead>
                <tr>
                  <th>ID</th>
                  <th>Name</th>
                  <th>Email</th>
                  <th>Phone</th>
                  <th>Department</th>
                  <th>Actions</th>
                </tr>
              </thead>

              <tbody>

                {loading ? (
                  <tr>
                    <td colSpan="6">
                      Loading teachers...
                    </td>
                  </tr>
                ) : teachers.length === 0 ? (
                  <tr>
                    <td colSpan="6">
                      No teacher records found.
                    </td>
                  </tr>
                ) : (
                  teachers.map((teacher) => (
                    <tr key={teacher.teacher_id}>

                      <td>{teacher.teacher_id}</td>

                      <td>{teacher.teacher_name}</td>

                      <td>{teacher.email}</td>

                      <td>{teacher.phone}</td>

                      <td>{teacher.department}</td>

                      <td>
                        <button
                          className="edit-button"
                          onClick={() => handleEdit(teacher)}
                        >
                          Edit
                        </button>

                        <button
                          className="delete-button"
                          onClick={() =>
                            handleDelete(teacher.teacher_id)
                          }
                        >
                          Delete
                        </button>
                      </td>

                    </tr>
                  ))
                )}

              </tbody>

            </table>

          </div>
        </div>

      </div>
    </div>
  );
}

export default ManageTeachers;