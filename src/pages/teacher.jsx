function Teacher() {
  const user = JSON.parse(localStorage.getItem("user"));

  return (
    <div className="dashboard">
      <h1>Teacher Dashboard</h1>

      <p>Welcome, {user?.username}!</p>

      <p>You are logged in as a Teacher.</p>

      <button
        onClick={() => {
          localStorage.clear();
          window.location.href = "/";
        }}
      >
        Logout
      </button>
    </div>
  );
}

export default Teacher;