import { useEffect, useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";

function ManageStudents() {
  const navigate = useNavigate();

  const [students, setStudents] = useState([]);
  const [editingId, setEditingId] = useState(null);
  const [message, setMessage] = useState("");

  const [form, setForm] = useState({
    student_name: "",
    email: "",
    phone: "",
    department: "",
    admission_date: "",
  });

  const API = "http://localhost:5000/api/students";

  const getConfig = () => ({
    headers: {
      Authorization: `Bearer ${localStorage.getItem("token")}`,
    },
  });

  // Fetch students
  const fetchStudents = async () => {
    try {
      const response = await axios.get(API, getConfig());
      setStudents(response.data);
    } catch (error) {
      setMessage(
        error.response?.data?.message || "Failed to fetch students"
      );
    }
  };

  useEffect(() => {
    fetchStudents();
  }, []);

  // Handle form input
  const handleChange = (e) => {
    setForm({
      ...form,
      [e.target.name]: e.target.value,
    });
  };

  // Add or Update Student
  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      if (editingId) {
        await axios.put(
          `${API}/${editingId}`,
          form,
          getConfig()
        );

        setMessage("Student updated successfully!");
      } else {
        await axios.post(API, form, getConfig());

        setMessage("Student added successfully!");
      }

      resetForm();
      fetchStudents();
    } catch (error) {
      setMessage(
        error.response?.data?.message || "Operation failed"
      );
    }
  };

  // Edit Student
  const handleEdit = (student) => {
    setEditingId(student.student_id);

    setForm({
      student_name: student.student_name,
      email: student.email,
      phone: student.phone,
      department: student.department,
      admission_date: student.admission_date
        ? String(student.admission_date).slice(0, 10)
        : "",
    });

    window.scrollTo(0, 0);
  };

  // Delete Student
  const handleDelete = async (id) => {
    const confirmDelete = window.confirm(
      "Are you sure you want to delete this student?"
    );

    if (!confirmDelete) return;

    try {
      await axios.delete(`${API}/${id}`, getConfig());

      setMessage("Student deleted successfully!");

      fetchStudents();
    } catch (error) {
      setMessage(
        error.response?.data?.message || "Delete failed"
      );
    }
  };

  // Reset form
  const resetForm = () => {
    setForm({
      student_name: "",
      email: "",
      phone: "",
      department: "",
      admission_date: "",
    });

    setEditingId(null);
  };

  return (
    <div className="dashboard-container">

      {/* Navbar */}
      <nav className="navbar">
        <h2>SIMS - Student Management</h2>

        <button
          className="dashboard-button"
          onClick={() => navigate("/admin")}
        >
          Back to Dashboard
        </button>
      </nav>

      <div className="dashboard-content">

        <h1>Manage Students</h1>

        <p>Add, view, update, and delete student records.</p>

        {message && (
          <p className="success-message">{message}</p>
        )}

        {/* Student Form */}
        <div className="student-form-card">

          <h2>
            {editingId ? "Update Student" : "Add New Student"}
          </h2>

          <form onSubmit={handleSubmit} className="student-form">

            <input
              type="text"
              name="student_name"
              placeholder="Student Name"
              value={form.student_name}
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

            <label>Admission Date</label>

            <input
              type="date"
              name="admission_date"
              value={form.admission_date}
              onChange={handleChange}
              required
            />

            <button type="submit" className="dashboard-button">
              {editingId ? "Update Student" : "Add Student"}
            </button>

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

        {/* Student Table */}
        <div className="student-table-card">

          <h2>Student Records</h2>

          <div className="table-responsive">

            <table className="student-table">

              <thead>
                <tr>
                  <th>ID</th>
                  <th>Name</th>
                  <th>Email</th>
                  <th>Phone</th>
                  <th>Department</th>
                  <th>Admission Date</th>
                  <th>Actions</th>
                </tr>
              </thead>

              <tbody>

                {students.length === 0 ? (
                  <tr>
                    <td colSpan="7">No students found.</td>
                  </tr>
                ) : (
                  students.map((student) => (
                    <tr key={student.student_id}>

                      <td>{student.student_id}</td>
                      <td>{student.student_name}</td>
                      <td>{student.email}</td>
                      <td>{student.phone}</td>
                      <td>{student.department}</td>

                      <td>
                        {student.admission_date
                          ? String(student.admission_date).slice(0, 10)
                          : ""}
                      </td>

                      <td>
                        <button
                          className="edit-button"
                          onClick={() => handleEdit(student)}
                        >
                          Edit
                        </button>

                        <button
                          className="delete-button"
                          onClick={() =>
                            handleDelete(student.student_id)
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

export default ManageStudents;