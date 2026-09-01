import React, { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";
import { getTrashFiles, restoreFile } from "../services/trashService";
import { useAuth } from "../context/AuthContext";

const formatSize = (bytes) => {
  if (!bytes && bytes !== 0) return "0 B";
  const k = 1024;
  const sizes = ["B", "KB", "MB", "GB"];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
};

const formatDate = (dateStr) => {
  if (!dateStr) return "-";
  return new Date(dateStr).toLocaleString(undefined, {
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
};

const TrashPage = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const [successMessage, setSuccessMessage] = useState("");
  const [errorMessage, setErrorMessage] = useState("");

  const { data: files = [], isLoading, isError, error } = useQuery({
    queryKey: ["trashFiles"],
    queryFn: getTrashFiles,
  });

  const restoreMutation = useMutation({
    mutationFn: restoreFile,
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["trashFiles"] });
      queryClient.invalidateQueries({ queryKey: ["files"] });
      queryClient.invalidateQueries({ queryKey: ["starredFiles"] });
      setErrorMessage("");
      setSuccessMessage(`"${data.filename}" restored successfully!`);
      setTimeout(() => setSuccessMessage(""), 3000);
    },
    onError: (err) => {
      setSuccessMessage("");
      setErrorMessage(err.response?.data?.message || "Failed to restore file");
    },
  });

  return (
    <div style={styles.container}>
      {/* Top Header */}
      <header style={styles.header}>
        <div style={styles.headerLeft}>
          <div style={styles.logoGroup} onClick={() => navigate("/dashboard")}>
            <svg style={styles.logoIcon} viewBox="0 0 24 24" fill="#2563eb">
              <path d="M19.35 10.04C18.67 6.59 15.64 4 12 4 9.11 4 6.6 5.64 5.35 8.04 2.34 8.36 0 10.91 0 14c0 3.31 2.69 6 6 6h13c2.76 0 5-2.24 5-5 0-2.64-2.05-4.78-4.65-4.96zM19 18H6c-2.21 0-4-1.79-4-4 0-2.05 1.53-3.76 3.56-3.97l1.07-.11.5-.95C8.08 7.14 9.94 6 12 6c2.62 0 4.88 1.86 5.39 4.43l.3 1.5 1.53.11c1.56.1 2.78 1.41 2.78 2.96 0 1.65-1.35 3-3 3z" />
            </svg>
            <span style={styles.appName}>Cloud Meta Storage</span>
          </div>
        </div>

        <div style={styles.headerRight}>
          <span style={styles.userEmail}>{user?.email}</span>
          <button onClick={logout} style={styles.logoutButton}>
            Logout
          </button>
        </div>
      </header>

      <div style={styles.layout}>
        {/* Navigation Sidebar */}
        <aside style={styles.sidebar}>
          <nav style={styles.navMenu}>
            <button
              onClick={() => navigate("/dashboard")}
              style={styles.navItem}
            >
              📂 My Drive
            </button>
            <button
              onClick={() => navigate("/starred")}
              style={styles.navItem}
            >
              ⭐ Starred
            </button>
            <button
              onClick={() => navigate("/trash")}
              style={{ ...styles.navItem, ...styles.navItemActive }}
            >
              🗑️ Trash
            </button>
          </nav>
        </aside>

        {/* Main Content Area */}
        <main style={styles.content}>
          <div style={styles.pageTitleRow}>
            <h1 style={styles.pageTitle}>🗑️ Trash</h1>
          </div>

          {errorMessage && <div style={styles.errorAlert}>{errorMessage}</div>}
          {successMessage && <div style={styles.successAlert}>{successMessage}</div>}

          {isLoading ? (
            <p style={styles.infoText}>Loading trash...</p>
          ) : isError ? (
            <p style={styles.errorText}>{error?.response?.data?.message || "Failed to load trash"}</p>
          ) : files.length === 0 ? (
            <div style={styles.emptyState}>
              <div style={styles.emptyIcon}>🗑️</div>
              <h3 style={styles.emptyTitle}>Trash is empty</h3>
              <p style={styles.emptySubtitle}>Deleted items will appear here before being permanently cleared.</p>
            </div>
          ) : (
            <div style={styles.tableCard}>
              <table style={styles.table}>
                <thead>
                  <tr style={styles.tableHeaderRow}>
                    <th style={styles.th}>Name</th>
                    <th style={styles.th}>Size</th>
                    <th style={styles.th}>Deleted Date</th>
                    <th style={styles.thRight}>Action</th>
                  </tr>
                </thead>
                <tbody>
                  {files.map((file) => (
                    <tr key={file.id} style={styles.tableRow}>
                      <td style={styles.tdName}>
                        <div style={styles.fileNameGroup}>
                          <svg style={styles.fileIcon} fill="none" stroke="#6b7280" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                          </svg>
                          <span style={styles.filenameText}>{file.filename}</span>
                        </div>
                      </td>
                      <td style={styles.td}>{formatSize(file.size)}</td>
                      <td style={styles.td}>{formatDate(file.deletedAt || file.updatedAt)}</td>
                      <td style={styles.tdRight}>
                        <button
                          onClick={() => restoreMutation.mutate(file.id)}
                          style={styles.restoreBtn}
                          disabled={restoreMutation.isPending}
                        >
                          {restoreMutation.isPending ? "Restoring..." : "Restore"}
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </main>
      </div>
    </div>
  );
};

const styles = {
  container: {
    minHeight: "100vh",
    backgroundColor: "#f9fafb",
    display: "flex",
    flexDirection: "column",
    fontFamily: "system-ui, -apple-system, sans-serif",
  },
  header: {
    height: "60px",
    backgroundColor: "#ffffff",
    borderBottom: "1px solid #e5e7eb",
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    padding: "0 24px",
  },
  headerLeft: {
    display: "flex",
    alignItems: "center",
  },
  logoGroup: {
    display: "flex",
    alignItems: "center",
    gap: "10px",
    cursor: "pointer",
  },
  logoIcon: {
    width: "26px",
    height: "26px",
  },
  appName: {
    fontSize: "17px",
    fontWeight: "700",
    color: "#111827",
  },
  headerRight: {
    display: "flex",
    alignItems: "center",
    gap: "16px",
  },
  userEmail: {
    fontSize: "14px",
    color: "#4b5563",
    fontWeight: "500",
  },
  logoutButton: {
    padding: "6px 12px",
    fontSize: "13px",
    fontWeight: "500",
    color: "#dc2626",
    backgroundColor: "#fef2f2",
    border: "1px solid #fecaca",
    borderRadius: "6px",
    cursor: "pointer",
  },
  layout: {
    display: "flex",
    flex: 1,
  },
  sidebar: {
    width: "220px",
    backgroundColor: "#ffffff",
    borderRight: "1px solid #e5e7eb",
    padding: "20px 12px",
  },
  navMenu: {
    display: "flex",
    flexDirection: "column",
    gap: "6px",
  },
  navItem: {
    display: "flex",
    alignItems: "center",
    gap: "10px",
    padding: "10px 14px",
    fontSize: "14px",
    fontWeight: "600",
    color: "#4b5563",
    backgroundColor: "transparent",
    border: "none",
    borderRadius: "8px",
    cursor: "pointer",
    textAlign: "left",
  },
  navItemActive: {
    color: "#2563eb",
    backgroundColor: "#eff6ff",
  },
  content: {
    flex: 1,
    padding: "32px",
  },
  pageTitleRow: {
    marginBottom: "24px",
  },
  pageTitle: {
    margin: 0,
    fontSize: "22px",
    fontWeight: "700",
    color: "#111827",
  },
  infoText: {
    fontSize: "14px",
    color: "#6b7280",
  },
  errorText: {
    fontSize: "14px",
    color: "#dc2626",
  },
  errorAlert: {
    marginBottom: "16px",
    padding: "10px 14px",
    backgroundColor: "#fef2f2",
    color: "#991b1b",
    fontSize: "14px",
    borderRadius: "6px",
    border: "1px solid #fecaca",
  },
  successAlert: {
    marginBottom: "16px",
    padding: "10px 14px",
    backgroundColor: "#ecfdf5",
    color: "#065f46",
    fontSize: "14px",
    borderRadius: "6px",
    border: "1px solid #a7f3d0",
  },
  emptyState: {
    textAlign: "center",
    padding: "64px 16px",
    backgroundColor: "#ffffff",
    borderRadius: "12px",
    border: "1px solid #e5e7eb",
    maxWidth: "480px",
    margin: "40px auto",
  },
  emptyIcon: {
    fontSize: "48px",
    marginBottom: "12px",
  },
  emptyTitle: {
    margin: "0 0 8px 0",
    fontSize: "18px",
    fontWeight: "700",
    color: "#111827",
  },
  emptySubtitle: {
    margin: 0,
    fontSize: "14px",
    color: "#6b7280",
  },
  tableCard: {
    backgroundColor: "#ffffff",
    border: "1px solid #e5e7eb",
    borderRadius: "10px",
    overflow: "hidden",
    boxShadow: "0 1px 3px rgba(0,0,0,0.05)",
  },
  table: {
    width: "100%",
    borderCollapse: "collapse",
    textAlign: "left",
  },
  tableHeaderRow: {
    backgroundColor: "#f9fafb",
    borderBottom: "1px solid #e5e7eb",
  },
  th: {
    padding: "12px 16px",
    fontSize: "12px",
    fontWeight: "600",
    color: "#6b7280",
    textTransform: "uppercase",
  },
  thRight: {
    padding: "12px 16px",
    fontSize: "12px",
    fontWeight: "600",
    color: "#6b7280",
    textTransform: "uppercase",
    textAlign: "right",
  },
  tableRow: {
    borderBottom: "1px solid #f3f4f6",
  },
  tdName: {
    padding: "14px 16px",
  },
  fileNameGroup: {
    display: "flex",
    alignItems: "center",
    gap: "10px",
  },
  fileIcon: {
    width: "20px",
    height: "20px",
  },
  filenameText: {
    fontSize: "14px",
    fontWeight: "600",
    color: "#111827",
  },
  td: {
    padding: "14px 16px",
    fontSize: "13px",
    color: "#4b5563",
  },
  tdRight: {
    padding: "14px 16px",
    textAlign: "right",
  },
  restoreBtn: {
    padding: "6px 14px",
    fontSize: "13px",
    fontWeight: "600",
    color: "#2563eb",
    backgroundColor: "#eff6ff",
    border: "1px solid #bfdbfe",
    borderRadius: "6px",
    cursor: "pointer",
  },
};

export default TrashPage;

