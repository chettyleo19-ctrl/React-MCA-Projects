import React, { useEffect, useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";

const API = "http://localhost:5000/api/teacher-portal";

export default function TeacherPortal() {
  const navigate = useNavigate();

  const [subjects, setSubjects] = useState([]);
  const [students, setStudents] = useState([]);
  const [selectedSubject, setSelectedSubject] = useState("");
  const [examType, setExamType] = useState("Internal");
  const [marks, setMarks] = useState({});
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  const config = {
    headers: {
      Authorization: `Bearer ${localStorage.getItem("token")}`,
    },
  };

  // Load assigned subjects
  const loadSubjects = async () => {
    try {
      const res = await axios.get(`${API}/subjects`, config);
      setSubjects(res.data);
    } catch (err) {
      setError(err.response?.data?.message || "Failed to load subjects");
    }
  };

  useEffect(() => {
    loadSubjects();
  }, []);

  // Load students for selected subject
  const loadStudents = async (subjectId) => {
    setSelectedSubject(subjectId);
    setStudents([]);
    setMarks({});
    setError("");
    setMessage("");

    if (!subjectId) return;

    try {
      const res = await axios.get(
        `${API}/subjects/${subjectId}/students?exam_type=${examType}`,
        config
      );

      setStudents(res.data);

      const initialMarks = {};

      res.data.forEach((student) => {
        initialMarks[student.student_id] =
          student.marks_obtained ?? "";
      });

      setMarks(initialMarks);
    } catch (err) {
      setError(err.response?.data?.message || "Failed to load students");
    }
  };

  // Save marks
  const saveMarks = async (student) => {
    setError("");
    setMessage("");

    const value = marks[student.student_id];

    if (value === "" || value === undefined || Number(value) < 0 || Number(value) > 100) {
      setError("Enter marks between 0 and 100.");
      return;
    }

    try {
      await axios.post(
        `${API}/marks`,
        {
          student_id: student.student_id,
          subject_id: Number(selectedSubject),
          marks_obtained: Number(value),
          max_marks: 100,
          exam_type: examType,
        },
        config
      );

      setMessage(`Marks saved for ${student.student_name}`);
    } catch (err) {
      setError(err.response?.data?.message || "Failed to save marks");
    }
  };

  return (
    <div style={styles.page}>
      <div style={styles.header}>
        <div>
          <h1>Teacher Portal</h1>
          <p>View assigned subjects and manage student marks.</p>
        </div>

        <button onClick={() => navigate("/")} style={styles.backBtn}>
          Logout / Home
        </button>
      </div>

      {error && <p style={styles.error}>{error}</p>}
      {message && <p style={styles.success}>{message}</p>}

      <div style={styles.card}>
        <h2>Assigned Subjects</h2>

        <label>Select Subject</label>

        <select
          style={styles.input}
          value={selectedSubject}
          onChange={(e) => loadStudents(e.target.value)}
        >
          <option value="">-- Select Subject --</option>

          {subjects.map((subject) => (
            <option key={subject.subject_id} value={subject.subject_id}>
              {subject.subject_name} ({subject.subject_code})
            </option>
          ))}
        </select>

        <label style={{ marginTop: 15, display: "block" }}>
          Exam Type
        </label>

        <select
          style={styles.input}
          value={examType}
          onChange={(e) => {
            setExamType(e.target.value);
            if (selectedSubject) {
              // Reload after changing exam type
              setTimeout(() => loadStudents(selectedSubject), 0);
            }
          }}
        >
          <option value="Internal">Internal</option>
          <option value="Midterm">Midterm</option>
          <option value="Final">Final</option>
        </select>
      </div>

      {selectedSubject && (
        <div style={styles.card}>
          <h2>Student Marks</h2>

          <div style={{ overflowX: "auto" }}>
            <table style={styles.table}>
              <thead>
                <tr>
                  <th style={styles.th}>Student ID</th>
                  <th style={styles.th}>Student Name</th>
                  <th style={styles.th}>Email</th>
                  <th style={styles.th}>Marks / 100</th>
                  <th style={styles.th}>Action</th>
                </tr>
              </thead>

              <tbody>
                {students.length > 0 ? (
                  students.map((student) => (
                    <tr key={student.student_id}>
                      <td style={styles.td}>{student.student_id}</td>
                      <td style={styles.td}>{student.student_name}</td>
                      <td style={styles.td}>{student.email}</td>

                      <td style={styles.td}>
                        <input
                          type="number"
                          min="0"
                          max="100"
                          value={marks[student.student_id] ?? ""}
                          onChange={(e) =>
                            setMarks({
                              ...marks,
                              [student.student_id]: e.target.value,
                            })
                          }
                          style={styles.markInput}
                        />
                      </td>

                      <td style={styles.td}>
                        <button
                          style={styles.saveBtn}
                          onClick={() => saveMarks(student)}
                        >
                          Save Marks
                        </button>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="5" style={styles.td}>
                      No students found for this subject.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}

const styles = {
  page: {
    minHeight: "100vh",
    background: "#f1f5f9",
    padding: "30px",
    fontFamily: "Arial",
    boxSizing: "border-box",
  },
  header: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    flexWrap: "wrap",
    marginBottom: "25px",
  },
  card: {
    background: "#fff",
    padding: "25px",
    borderRadius: "10px",
    marginBottom: "25px",
    boxShadow: "0 2px 10px #0001",
  },
  input: {
    display: "block",
    width: "100%",
    maxWidth: "400px",
    padding: "12px",
    marginTop: "8px",
    border: "1px solid #cbd5e1",
    borderRadius: "6px",
  },
  table: {
    width: "100%",
    borderCollapse: "collapse",
    marginTop: "15px",
  },
  th: {
    background: "#1e293b",
    color: "white",
    padding: "13px",
    textAlign: "left",
  },
  td: {
    padding: "12px",
    borderBottom: "1px solid #e2e8f0",
  },
  markInput: {
    width: "80px",
    padding: "8px",
    border: "1px solid #cbd5e1",
    borderRadius: "5px",
  },
  saveBtn: {
    padding: "9px 14px",
    background: "#2563eb",
    color: "white",
    border: "none",
    borderRadius: "5px",
    cursor: "pointer",
  },
  backBtn: {
    padding: "10px 16px",
    background: "#334155",
    color: "white",
    border: "none",
    borderRadius: "5px",
    cursor: "pointer",
  },
  error: {
    padding: "12px",
    background: "#fee2e2",
    color: "#b91c1c",
  },
  success: {
    padding: "12px",
    background: "#dcfce7",
    color: "#166534",
  },
};
