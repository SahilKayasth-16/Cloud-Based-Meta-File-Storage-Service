import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

const DashboardPage = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate("/login", { replace: true });
  };

  return (
    <div style={styles.container}>
      <header style={styles.header}>
        <h1 style={styles.title}>Cloud Meta Storage - Dashboard</h1>
        <button onClick={handleLogout} style={styles.logoutButton}>
          Logout
        </button>
      </header>

      <main style={styles.main}>
        <div style={styles.card}>
          <h2 style={styles.cardTitle}>User Profile Information</h2>
          <div style={styles.infoGroup}>
            <span style={styles.label}>ID:</span>
            <span style={styles.value}>{user?.id}</span>
          </div>
          <div style={styles.infoGroup}>
            <span style={styles.label}>Name:</span>
            <span style={styles.value}>{user?.name}</span>
          </div>
          <div style={styles.infoGroup}>
            <span style={styles.label}>Email:</span>
            <span style={styles.value}>{user?.email}</span>
          </div>
          <div style={styles.infoGroup}>
            <span style={styles.label}>Role:</span>
            <span style={styles.roleBadge}>{user?.role}</span>
          </div>
        </div>
      </main>
    </div>
  );
};

const styles = {
  container: {
    minHeight: "100vh",
    backgroundColor: "#f4f6f8",
    fontFamily: "sans-serif",
  },
  header: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    padding: "16px 32px",
    backgroundColor: "#ffffff",
    boxShadow: "0 2px 4px rgba(0,0,0,0.05)",
  },
  title: {
    margin: 0,
    fontSize: "20px",
    fontWeight: "600",
    color: "#1a1a1a",
  },
  logoutButton: {
    padding: "8px 16px",
    fontSize: "14px",
    fontWeight: "600",
    color: "#d32f2f",
    backgroundColor: "#ffebee",
    border: "1px solid #ffcdd2",
    borderRadius: "4px",
    cursor: "pointer",
  },
  main: {
    padding: "32px",
    maxWidth: "800px",
    margin: "0 auto",
  },
  card: {
    backgroundColor: "#ffffff",
    padding: "24px",
    borderRadius: "8px",
    boxShadow: "0 2px 8px rgba(0,0,0,0.08)",
  },
  cardTitle: {
    margin: "0 0 20px 0",
    fontSize: "18px",
    color: "#333",
    borderBottom: "1px solid #eee",
    paddingBottom: "10px",
  },
  infoGroup: {
    display: "flex",
    alignItems: "center",
    marginBottom: "12px",
  },
  label: {
    width: "80px",
    fontWeight: "600",
    color: "#666",
    fontSize: "14px",
  },
  value: {
    color: "#222",
    fontSize: "14px",
  },
  roleBadge: {
    padding: "4px 8px",
    backgroundColor: "#e3f2fd",
    color: "#1976d2",
    borderRadius: "4px",
    fontWeight: "600",
    fontSize: "12px",
  },
};

export default DashboardPage;
