import React, { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";
import { getStarredFiles, unstarFile } from "../services/starService";
import { getDownloadUrl } from "../services/fileService";
import { useAuth } from "../context/AuthContext";
import FileDetailsModal from "../components/FileDetailsModal";

const formatSize = (bytes) => {
  if (!bytes && bytes !== 0) return "0 B";
  const k = 1024;
  const sizes = ["B", "KB", "MB", "GB"];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
};

const formatDate = (dateStr) => {
  if (!dateStr) return "-";
  return new Date(dateStr).toLocaleDateString(undefined, {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
};

const StarredPage = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const [selectedFileForDetails, setSelectedFileForDetails] = useState(null);
  const [downloadingFileId, setDownloadingFileId] = useState(null);

  const { data: files = [], isLoading, isError, error } = useQuery({
    queryKey: ["starredFiles"],
    queryFn: getStarredFiles,
  });

  const unstarMutation = useMutation({
    mutationFn: unstarFile,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["starredFiles"] });
      queryClient.invalidateQueries({ queryKey: ["starredFileIds"] });
    },
  });

  const handleDownload = async (fileId) => {
    try {
      setDownloadingFileId(fileId);
      const data = await getDownloadUrl(fileId);
      if (data?.downloadUrl) {
        window.open(data.downloadUrl, "_blank");
      }
    } catch (err) {
      alert("Failed to download file: " + (err.response?.data?.message || err.message));
    } finally {
      setDownloadingFileId(null);
    }
  };

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
              style={{ ...styles.navItem, ...styles.navItemActive }}
            >
              ⭐ Starred
            </button>
            <button
              onClick={() => navigate("/trash")}
              style={styles.navItem}
            >
              🗑️ Trash
            </button>
          </nav>
        </aside>

        {/* Main Content Area */}
        <main style={styles.content}>
          <div style={styles.pageTitleRow}>
            <h1 style={styles.pageTitle}>⭐ Starred Files</h1>
          </div>

          {isLoading ? (
            <p style={styles.infoText}>Loading starred files...</p>
          ) : isError ? (
            <p style={styles.errorText}>{error?.response?.data?.message || "Failed to load starred files"}</p>
          ) : files.length === 0 ? (
            <div style={styles.emptyState}>
              <div style={styles.emptyIcon}>⭐</div>
              <h3 style={styles.emptyTitle}>No starred files</h3>
              <p style={styles.emptySubtitle}>Star files in My Drive to quickly access them here.</p>
            </div>
          ) : (
            <div style={styles.fileGrid}>
              {files.map((file) => (
                <div key={file.id} style={styles.fileCard}>
                  <div style={styles.cardHeader}>
                    <div style={styles.fileIconWrapper}>
                      <svg style={styles.fileIcon} fill="none" stroke="#2563eb" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                      </svg>
                    </div>

                    <button
                      onClick={() => unstarMutation.mutate(file.id)}
                      style={styles.starBtnActive}
                      title="Unstar file"
                    >
                      ★
                    </button>
                  </div>

                  <h4 style={styles.filename} title={file.filename}>
                    {file.filename}
                  </h4>
                  <p style={styles.fileMeta}>
                    {formatSize(file.size)} • {formatDate(file.createdAt)}
                  </p>

                  <div style={styles.cardActions}>
                    <button
                      onClick={() => setSelectedFileForDetails(file)}
                      style={styles.actionBtnSec}
                    >
                      Details
                    </button>
                    <button
                      onClick={() => handleDownload(file.id)}
                      style={styles.actionBtnPri}
                      disabled={downloadingFileId === file.id}
                    >
                      {downloadingFileId === file.id ? "Downloading..." : "Download"}
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </main>
      </div>

      <FileDetailsModal
        isOpen={!!selectedFileForDetails}
        file={selectedFileForDetails}
        onClose={() => setSelectedFileForDetails(null)}
      />
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
  fileGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fill, minmax(220px, 1fr))",
    gap: "16px",
  },
  fileCard: {
    backgroundColor: "#ffffff",
    border: "1px solid #e5e7eb",
    borderRadius: "10px",
    padding: "16px",
    display: "flex",
    flexDirection: "column",
    boxShadow: "0 1px 3px rgba(0,0,0,0.05)",
  },
  cardHeader: {
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: "12px",
  },
  fileIconWrapper: {
    width: "40px",
    height: "40px",
    backgroundColor: "#eff6ff",
    borderRadius: "8px",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
  },
  fileIcon: {
    width: "24px",
    height: "24px",
  },
  starBtnActive: {
    background: "none",
    border: "none",
    fontSize: "20px",
    color: "#eab308",
    cursor: "pointer",
    padding: "2px",
  },
  filename: {
    margin: "0 0 4px 0",
    fontSize: "14px",
    fontWeight: "600",
    color: "#111827",
    overflow: "hidden",
    textOverflow: "ellipsis",
    whiteSpace: "nowrap",
  },
  fileMeta: {
    margin: "0 0 16px 0",
    fontSize: "12px",
    color: "#6b7280",
  },
  cardActions: {
    display: "flex",
    gap: "8px",
    marginTop: "auto",
  },
  actionBtnSec: {
    flex: 1,
    padding: "6px 10px",
    fontSize: "12px",
    fontWeight: "500",
    color: "#374151",
    backgroundColor: "#f3f4f6",
    border: "1px solid #d1d5db",
    borderRadius: "6px",
    cursor: "pointer",
  },
  actionBtnPri: {
    flex: 1,
    padding: "6px 10px",
    fontSize: "12px",
    fontWeight: "600",
    color: "#ffffff",
    backgroundColor: "#2563eb",
    border: "none",
    borderRadius: "6px",
    cursor: "pointer",
  },
};

export default StarredPage;

