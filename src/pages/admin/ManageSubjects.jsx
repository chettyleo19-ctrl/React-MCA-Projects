import React, { useEffect, useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";

const API_URL = "http://localhost:5000/api";

const ManageSubjects = () => {
  const navigate = useNavigate();

  // ================= STATE =================

  const [subjects, setSubjects] = useState([]);
  const [teachers, setTeachers] = useState([]);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const [searchTerm, setSearchTerm] = useState("");
  const [editingSubject, setEditingSubject] = useState(null);

  const [formData, setFormData] = useState({
    subject_name: "",
    subject_code: "",
    teacher_id: "",
  });

  // ================= AUTH CONFIG =================

  const getConfig = () => {
    const token = localStorage.getItem("token");

    return {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    };
  };

  // ================= FETCH SUBJECTS =================

  const fetchSubjects = async () => {
    setLoading(true);
    setError("");

    try {
      const response = await axios.get(
        `${API_URL}/subjects`,
        getConfig()
      );

      const data = response.data;

      setSubjects(
        Array.isArray(data)
          ? data
          : Array.isArray(data.subjects)
          ? data.subjects
          : []
      );
    } catch (err) {
      console.error("Subjects API Error:", err);

      setError(
        err.response?.data?.message ||
          "Failed to load subjects. Check the backend server."
      );
    } finally {
      setLoading(false);
    }
  };

  // ================= FETCH TEACHERS =================

  const fetchTeachers = async () => {
    try {
      const response = await axios.get(
        `${API_URL}/teachers`,
        getConfig()
      );

      const data = response.data;

      setTeachers(
        Array.isArray(data)
          ? data
          : Array.isArray(data.teachers)
          ? data.teachers
          : []
      );
    } catch (err) {
      console.error("Teachers API Error:", err);

      setTeachers([]);
    }
  };

  // ================= LOAD DATA =================

  const fetchData = async () => {
    await Promise.allSettled([
      fetchSubjects(),
      fetchTeachers(),
    ]);
  };

  useEffect(() => {
    fetchData();
  }, []);

  // ================= HANDLE INPUT =================

  const handleChange = (e) => {
    const { name, value } = e.target;

    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  // ================= RESET FORM =================

  const resetForm = () => {
    setFormData({
      subject_name: "",
      subject_code: "",
      teacher_id: "",
    });

    setEditingSubject(null);
  };

  // ================= ADD / UPDATE SUBJECT =================

  const handleSubmit = async (e) => {
    e.preventDefault();

    setError("");
    setSuccess("");

    if (
      !formData.subject_name.trim() ||
      !formData.subject_code.trim()
    ) {
      setError("Please enter the subject name and subject code.");
      return;
    }

    const payload = {
      subject_name: formData.subject_name.trim(),
      subject_code: formData.subject_code.trim(),
      teacher_id: formData.teacher_id
        ? Number(formData.teacher_id)
        : null,
    };

    try {
      if (editingSubject) {
        // UPDATE SUBJECT

        await axios.put(
          `${API_URL}/subjects/${editingSubject.subject_id}`,
          payload,
          getConfig()
        );

        setSuccess("Subject updated successfully!");
      } else {
        // ADD SUBJECT

        await axios.post(
          `${API_URL}/subjects`,
          payload,
          getConfig()
        );

        setSuccess("Subject added successfully!");
      }

      resetForm();

      await fetchSubjects();
    } catch (err) {
      console.error("Save Subject Error:", err);

      setError(
        err.response?.data?.message ||
          "Failed to save subject. Please try again."
      );
    }
  };

  // ================= EDIT SUBJECT =================

  const handleEdit = (subject) => {
    setEditingSubject(subject);

    setFormData({
      subject_name: subject.subject_name || "",
      subject_code: subject.subject_code || "",
      teacher_id: subject.teacher_id
        ? String(subject.teacher_id)
        : "",
    });

    setError("");
    setSuccess("");

    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  };

  // ================= DELETE SUBJECT =================

  const handleDelete = async (subjectId) => {
    const confirmDelete = window.confirm(
      "Are you sure you want to delete this subject?"
    );

    if (!confirmDelete) return;

    setError("");
    setSuccess("");

    try {
      await axios.delete(
        `${API_URL}/subjects/${subjectId}`,
        getConfig()
      );

      setSubjects((prev) =>
        prev.filter(
          (subject) => subject.subject_id !== subjectId
        )
      );

      setSuccess("Subject deleted successfully!");

      if (editingSubject?.subject_id === subjectId) {
        resetForm();
      }
    } catch (err) {
      console.error("Delete Subject Error:", err);

      setError(
        err.response?.data?.message ||
          "Failed to delete subject. Please try again."
      );
    }
  };

  // ================= SEARCH SUBJECTS =================

  const filteredSubjects = subjects.filter((subject) => {
    const search = searchTerm.toLowerCase();

    return (
      String(subject.subject_id || "")
        .toLowerCase()
        .includes(search) ||
      String(subject.subject_name || "")
        .toLowerCase()
        .includes(search) ||
      String(subject.subject_code || "")
        .toLowerCase()
        .includes(search) ||
      String(subject.teacher_name || "")
        .toLowerCase()
        .includes(search)
    );
  });

  // ================= NAVIGATION =================

  const handleBack = () => {
    navigate("/admin");
  };

  // ================= UI =================

  return (
    <div style={styles.page}>
      {/* ================= HEADER ================= */}

      <div style={styles.header}>
        <div>
          <h1 style={styles.heading}>Manage Subjects</h1>

          <p style={styles.subheading}>
            Add, update, assign teachers and manage subjects.
          </p>
        </div>

        <button
          style={styles.backButton}
          onClick={handleBack}
        >
          ← Back to Dashboard
        </button>
      </div>

      {/* ================= ERROR MESSAGE ================= */}

      {error && (
        <div style={styles.errorMessage}>
          {error}
        </div>
      )}

      {/* ================= SUCCESS MESSAGE ================= */}

      {success && (
        <div style={styles.successMessage}>
          {success}
        </div>
      )}

      {/* ================= SUBJECT FORM ================= */}

      <div style={styles.formContainer}>
        <h2 style={styles.sectionHeading}>
          {editingSubject ? "Edit Subject" : "Add New Subject"}
        </h2>

        <form onSubmit={handleSubmit}>
          <div style={styles.formGrid}>
            {/* SUBJECT NAME */}

            <div style={styles.formGroup}>
              <label style={styles.label}>
                Subject Name
              </label>

              <input
                type="text"
                name="subject_name"
                placeholder="Enter subject name"
                value={formData.subject_name}
                onChange={handleChange}
                style={styles.input}
              />
            </div>

            {/* SUBJECT CODE */}

            <div style={styles.formGroup}>
              <label style={styles.label}>
                Subject Code
              </label>

              <input
                type="text"
                name="subject_code"
                placeholder="Enter subject code"
                value={formData.subject_code}
                onChange={handleChange}
                style={styles.input}
              />
            </div>

            {/* ASSIGN TEACHER */}

            <div style={styles.formGroup}>
              <label style={styles.label}>
                Assign Teacher
              </label>

              <select
                name="teacher_id"
                value={formData.teacher_id}
                onChange={handleChange}
                style={styles.input}
              >
                <option value="">-- Select Teacher (Optional) --</option>

                {teachers.map((teacher) => (
                  <option
                    key={teacher.teacher_id}
                    value={teacher.teacher_id}
                  >
                    {teacher.teacher_name}
                  </option>
                ))}
              </select>

              {teachers.length === 0 && (
                <small style={styles.helperText}>
                  No teachers loaded. You can add a subject
                  without assigning a teacher.
                </small>
              )}
            </div>
          </div>

          {/* FORM BUTTONS */}

          <div style={styles.buttonGroup}>
            <button
              type="submit"
              style={styles.submitButton}
            >
              {editingSubject ? "Update Subject" : "Add Subject"}
            </button>

            <button
              type="button"
              style={styles.clearButton}
              onClick={resetForm}
            >
              Clear
            </button>
          </div>
        </form>
      </div>

      {/* ================= SUBJECT TABLE ================= */}

      <div style={styles.tableContainer}>
        <div style={styles.tableHeader}>
          <h2 style={styles.sectionHeading}>
            Subject Records
          </h2>

          <input
            type="text"
            placeholder="Search subjects..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            style={styles.searchInput}
          />
        </div>

        {loading ? (
          <p style={styles.infoText}>
            Loading subjects...
          </p>
        ) : (
          <div style={styles.tableWrapper}>
            <table style={styles.table}>
              <thead>
                <tr>
                  <th style={styles.th}>ID</th>
                  <th style={styles.th}>Subject Name</th>
                  <th style={styles.th}>Subject Code</th>
                  <th style={styles.th}>Assigned Teacher</th>
                  <th style={styles.th}>Actions</th>
                </tr>
              </thead>

              <tbody>
                {filteredSubjects.length > 0 ? (
                  filteredSubjects.map((subject) => (
                    <tr key={subject.subject_id}>
                      <td style={styles.td}>
                        {subject.subject_id}
                      </td>

                      <td style={styles.td}>
                        {subject.subject_name}
                      </td>

                      <td style={styles.td}>
                        {subject.subject_code}
                      </td>

                      <td style={styles.td}>
                        {subject.teacher_name || "Not Assigned"}
                      </td>

                      <td style={styles.actionCell}>
                        <button
                          style={styles.editButton}
                          onClick={() => handleEdit(subject)}
                        >
                          Edit
                        </button>

                        <button
                          style={styles.deleteButton}
                          onClick={() =>
                            handleDelete(subject.subject_id)
                          }
                        >
                          Delete
                        </button>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td
                      colSpan="5"
                      style={styles.emptyMessage}
                    >
                      {searchTerm
                        ? "No subjects match your search."
                        : "No subject records found."}
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        )}

        {/* ================= TABLE FOOTER ================= */}

        <div style={styles.tableFooter}>
          <p style={styles.countText}>
            Total Subjects: {filteredSubjects.length}
          </p>

          <button
            style={styles.refreshButton}
            onClick={fetchData}
          >
            Refresh Subjects
          </button>
        </div>
      </div>
    </div>
  );
};

// ================= STYLES =================

const styles = {
  page: {
    minHeight: "100vh",
    padding: "30px",
    backgroundColor: "#f4f6f9",
    fontFamily: "Arial, sans-serif",
    boxSizing: "border-box",
  },

  header: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    flexWrap: "wrap",
    gap: "15px",
    marginBottom: "25px",
  },

  heading: {
    margin: "0 0 8px",
    color: "#1e293b",
    fontSize: "28px",
  },

  subheading: {
    margin: 0,
    color: "#64748b",
    fontSize: "14px",
  },

  backButton: {
    padding: "11px 18px",
    backgroundColor: "#334155",
    color: "#fff",
    border: "none",
    borderRadius: "6px",
    cursor: "pointer",
  },

  formContainer: {
    backgroundColor: "#fff",
    padding: "25px",
    borderRadius: "10px",
    boxShadow: "0 2px 10px rgba(0,0,0,0.06)",
    marginBottom: "25px",
  },

  sectionHeading: {
    margin: "0 0 20px",
    fontSize: "20px",
    color: "#1e293b",
  },

  formGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
    gap: "20px",
  },

  formGroup: {
    display: "flex",
    flexDirection: "column",
  },

  label: {
    marginBottom: "8px",
    fontSize: "14px",
    fontWeight: "600",
    color: "#334155",
  },

  input: {
    padding: "12px",
    border: "1px solid #cbd5e1",
    borderRadius: "6px",
    fontSize: "14px",
    outline: "none",
    boxSizing: "border-box",
    width: "100%",
  },

  helperText: {
    marginTop: "6px",
    fontSize: "12px",
    color: "#64748b",
  },

  buttonGroup: {
    display: "flex",
    gap: "12px",
    marginTop: "25px",
    flexWrap: "wrap",
  },

  submitButton: {
    padding: "12px 22px",
    backgroundColor: "#2563eb",
    color: "#fff",
    border: "none",
    borderRadius: "6px",
    cursor: "pointer",
    fontWeight: "600",
  },

  clearButton: {
    padding: "12px 22px",
    backgroundColor: "#64748b",
    color: "#fff",
    border: "none",
    borderRadius: "6px",
    cursor: "pointer",
  },

  tableContainer: {
    backgroundColor: "#fff",
    padding: "25px",
    borderRadius: "10px",
    boxShadow: "0 2px 10px rgba(0,0,0,0.06)",
  },

  tableHeader: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    gap: "15px",
    flexWrap: "wrap",
  },

  searchInput: {
    padding: "11px 14px",
    border: "1px solid #cbd5e1",
    borderRadius: "6px",
    width: "260px",
    maxWidth: "100%",
    fontSize: "14px",
    boxSizing: "border-box",
  },

  tableWrapper: {
    width: "100%",
    overflowX: "auto",
  },

  table: {
    width: "100%",
    borderCollapse: "collapse",
    minWidth: "700px",
  },

  th: {
    backgroundColor: "#1e293b",
    color: "#fff",
    padding: "14px 12px",
    textAlign: "left",
    fontSize: "13px",
    whiteSpace: "nowrap",
  },

  td: {
    padding: "13px 12px",
    borderBottom: "1px solid #e2e8f0",
    color: "#334155",
    fontSize: "13px",
  },

  actionCell: {
    padding: "10px",
    borderBottom: "1px solid #e2e8f0",
    whiteSpace: "nowrap",
  },

  editButton: {
    padding: "8px 12px",
    backgroundColor: "#f59e0b",
    color: "#fff",
    border: "none",
    borderRadius: "4px",
    cursor: "pointer",
    marginRight: "7px",
  },

  deleteButton: {
    padding: "8px 12px",
    backgroundColor: "#dc2626",
    color: "#fff",
    border: "none",
    borderRadius: "4px",
    cursor: "pointer",
  },

  emptyMessage: {
    textAlign: "center",
    padding: "25px",
    color: "#64748b",
  },

  tableFooter: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    flexWrap: "wrap",
    gap: "15px",
    marginTop: "15px",
  },

  countText: {
    color: "#475569",
    fontSize: "14px",
    fontWeight: "600",
  },

  refreshButton: {
    padding: "10px 18px",
    backgroundColor: "#0f766e",
    color: "#fff",
    border: "none",
    borderRadius: "6px",
    cursor: "pointer",
  },

  errorMessage: {
    padding: "12px 15px",
    marginBottom: "20px",
    backgroundColor: "#fee2e2",
    color: "#b91c1c",
    borderRadius: "6px",
  },

  successMessage: {
    padding: "12px 15px",
    marginBottom: "20px",
    backgroundColor: "#dcfce7",
    color: "#166534",
    borderRadius: "6px",
  },

  infoText: {
    color: "#64748b",
    padding: "15px 0",
  },
};

export default ManageSubjects;