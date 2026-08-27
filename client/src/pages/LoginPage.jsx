import { useState } from "react";
import { useNavigate, Link, useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

const LoginPage = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const from = location.state?.from?.pathname || "/dashboard";

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    if (!email || !password) {
      setError("Please fill in all fields");
      return;
    }

    try {
      setLoading(true);
      await login({ email, password });
      navigate(from, { replace: true });
    } catch (err) {
      const message =
        err.response?.data?.message || "Invalid credentials. Please try again.";
      setError(message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={styles.container}>
      <div style={styles.card}>
        <h2 style={styles.title}>Login to Cloud Meta Storage</h2>
        {error && <div style={styles.errorAlert}>{error}</div>}

        <form onSubmit={handleSubmit} style={styles.form}>
          <div style={styles.formGroup}>
            <label style={styles.label}>Email Address</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@example.com"
              required
              style={styles.input}
            />
          </div>

          <div style={styles.formGroup}>
            <label style={styles.label}>Password</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              required
              style={styles.input}
            />
          </div>

          <button type="submit" disabled={loading} style={styles.button}>
            {loading ? "Logging in..." : "Login"}
          </button>
        </form>

        <p style={styles.footerText}>
          Don't have an account?{" "}
          <Link to="/register" style={styles.link}>
            Register here
          </Link>
        </p>
      </div>
    </div>
  );
};

const styles = {
  container: {
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    minHeight: "100vh",
    backgroundColor: "#f4f6f8",
    fontFamily: "sans-serif",
  },
  card: {
    width: "100%",
    maxWidth: "400px",
    padding: "32px",
    backgroundColor: "#ffffff",
    borderRadius: "8px",
    boxShadow: "0 4px 12px rgba(0,0,0,0.1)",
  },
  title: {
    margin: "0 0 24px 0",
    fontSize: "24px",
    fontWeight: "600",
    color: "#1a1a1a",
    textAlign: "center",
  },
  errorAlert: {
    padding: "12px",
    marginBottom: "16px",
    backgroundColor: "#ffebee",
    color: "#c62828",
    borderRadius: "4px",
    fontSize: "14px",
  },
  form: {
    display: "flex",
    flexDirection: "column",
    gap: "16px",
  },
  formGroup: {
    display: "flex",
    flexDirection: "column",
    gap: "6px",
  },
  label: {
    fontSize: "14px",
    fontWeight: "500",
    color: "#4a4a4a",
  },
  input: {
    padding: "10px 12px",
    fontSize: "14px",
    borderRadius: "4px",
    border: "1px solid #ccc",
    outline: "none",
  },
  button: {
    padding: "12px",
    fontSize: "16px",
    fontWeight: "600",
    color: "#ffffff",
    backgroundColor: "#1976d2",
    border: "none",
    borderRadius: "4px",
    cursor: "pointer",
    marginTop: "8px",
  },
  footerText: {
    marginTop: "20px",
    fontSize: "14px",
    textAlign: "center",
    color: "#666",
  },
  link: {
    color: "#1976d2",
    textDecoration: "none",
    fontWeight: "500",
  },
};

export default LoginPage;
