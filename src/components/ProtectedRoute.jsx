import { Navigate } from "react-router-dom";

function ProtectedRoute({ children, allowedRoles }) {
  const token = localStorage.getItem("token");

  const user = JSON.parse(localStorage.getItem("user") || "null");

  // Check whether the user is logged in
  if (!token || !user) {
    return <Navigate to="/" replace />;
  }

  // Check whether the user's role is allowed
  if (!allowedRoles.includes(user.role)) {
    // Redirect to the user's own portal
    if (user.role === "admin") {
      return <Navigate to="/admin" replace />;
    }

    if (user.role === "student") {
      return <Navigate to="/student" replace />;
    }

    if (user.role === "teacher") {
      return <Navigate to="/teacher" replace />;
    }

    return <Navigate to="/" replace />;
  }

  // Allow access if the role is permitted
  return children;
}

export default ProtectedRoute;