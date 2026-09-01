import React, { useState } from "react";
import { useParams } from "react-router-dom";
import { useQuery, useMutation } from "@tanstack/react-query";
import { accessPublicLink, verifyPublicLinkPassword } from "../services/publicLinkService";

const formatSize = (bytes) => {
  if (!bytes && bytes !== 0) return "0 B";
  const k = 1024;
  const sizes = ["B", "KB", "MB", "GB"];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
};

const formatDate = (dateStr) => {
  if (!dateStr) return "Never";
  return new Date(dateStr).toLocaleString(undefined, {
    dateStyle: "medium",
    timeStyle: "short",
  });
};

const SharePage = () => {
  const { token } = useParams();
  const [password, setPassword] = useState("");
  const [authResponse, setAuthResponse] = useState(null);
  const [verifyError, setVerifyError] = useState("");

  // Query Public Link Access (unauthenticated)
  const {
    data: publicData,
    isLoading,
    isError,
    error,
  } = useQuery({
    queryKey: ["publicLink", token],
    queryFn: () => accessPublicLink(token),
    enabled: !!token,
    retry: false,
  });

  // Verify Password Mutation
  const verifyMutation = useMutation({
    mutationFn: (pwd) => verifyPublicLinkPassword(token, pwd),
    onSuccess: (data) => {
      setAuthResponse(data);
      setVerifyError("");
    },
    onError: (err) => {
      setVerifyError(err.response?.data?.message || "Incorrect password");
    },
  });

  const handlePasswordSubmit = (e) => {
    e.preventDefault();
    if (!password.trim()) return;
    setVerifyError("");
    verifyMutation.mutate(password);
  };

  const handleDownload = (downloadUrl, filename) => {
    if (!downloadUrl) return;
    const link = document.createElement("a");
    link.href = downloadUrl;
    link.download = filename || "downloaded_file";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Effective data after optional password verification
  const activeData = authResponse || publicData;

  return (
    <div style={styles.container}>
      <header style={styles.header}>
        <div style={styles.logoGroup}>
          <svg style={styles.logoIcon} viewBox="0 0 24 24" fill="#2563eb">
            <path d="M19.35 10.04C18.67 6.59 15.64 4 12 4 9.11 4 6.6 5.64 5.35 8.04 2.34 8.36 0 10.91 0 14c0 3.31 2.69 6 6 6h13c2.76 0 5-2.24 5-5 0-2.64-2.05-4.78-4.65-4.96zM19 18H6c-2.21 0-4-1.79-4-4 0-2.05 1.53-3.76 3.56-3.97l1.07-.11.5-.95C8.08 7.14 9.94 6 12 6c2.62 0 4.88 1.86 5.39 4.43l.3 1.5 1.53.11c1.56.1 2.78 1.41 2.78 2.96 0 1.65-1.35 3-3 3z" />
          </svg>
          <span style={styles.appName}>Cloud Meta Storage</span>
        </div>
      </header>

      <main style={styles.main}>
        {isLoading ? (
          <div style={styles.card}>
            <div style={styles.spinner}></div>
            <p style={styles.loadingText}>Validating share link...</p>
          </div>
        ) : isError ? (
          <div style={styles.card}>
            <div style={styles.errorIconWrapper}>
              <svg style={styles.errorIcon} fill="none" stroke="#dc2626" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
            </div>
            <h2 style={styles.errorTitle}>Link Unavailable</h2>
            <p style={styles.errorText}>
              {error?.response?.data?.message || "This share link is no longer available or has expired."}
            </p>
          </div>
        ) : activeData ? (
          <div style={styles.card}>
            <div style={styles.fileIconWrapper}>
              <svg style={styles.fileIcon} fill="none" stroke="#2563eb" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
            </div>

            <h2 style={styles.filename}>{activeData.filename}</h2>
            <p style={styles.fileMeta}>
              {formatSize(activeData.size)} • {activeData.contentType || "File"}
            </p>

            {/* If password required and not yet verified */}
            {activeData.passwordRequired ? (
              <form onSubmit={handlePasswordSubmit} style={styles.passwordForm}>
                <p style={styles.passwordNotice}>
                  🔒 This file is password protected. Enter password to access file.
                </p>
                {verifyError && <div style={styles.errorAlert}>{verifyError}</div>}
                <div style={styles.formGroup}>
                  <input
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Enter link password"
                    required
                    style={styles.passwordInput}
                    disabled={verifyMutation.isPending}
                  />
                </div>
                <button
                  type="submit"
                  style={styles.submitButton}
                  disabled={verifyMutation.isPending || !password.trim()}
                >
                  {verifyMutation.isPending ? "Verifying..." : "Access & Download"}
                </button>
              </form>
            ) : (
              <div style={styles.downloadSection}>
                {activeData.expiresAt && (
                  <p style={styles.expireNotice}>
                    Link expires: {formatDate(activeData.expiresAt)}
                  </p>
                )}

                <button
                  onClick={() => handleDownload(activeData.downloadUrl, activeData.filename)}
                  style={styles.downloadButton}
                >
                  <svg style={styles.btnIcon} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                  </svg>
                  Download File
                </button>
              </div>
            )}
          </div>
        ) : null}
      </main>
    </div>
  );
};

const styles = {
  container: {
    minHeight: "100vh",
    backgroundColor: "#f3f4f6",
    fontFamily: "system-ui, -apple-system, sans-serif",
  },
  header: {
    backgroundColor: "#ffffff",
    borderBottom: "1px solid #e5e7eb",
    padding: "16px 32px",
    display: "flex",
    alignItems: "center",
  },
  logoGroup: {
    display: "flex",
    alignItems: "center",
    gap: "10px",
  },
  logoIcon: {
    width: "28px",
    height: "28px",
  },
  appName: {
    fontSize: "18px",
    fontWeight: "700",
    color: "#111827",
  },
  main: {
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    padding: "48px 16px",
  },
  card: {
    backgroundColor: "#ffffff",
    borderRadius: "12px",
    width: "100%",
    maxWidth: "460px",
    padding: "36px 28px",
    boxShadow: "0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)",
    textAlign: "center",
  },
  fileIconWrapper: {
    width: "64px",
    height: "64px",
    backgroundColor: "#eff6ff",
    borderRadius: "50%",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    margin: "0 auto 16px auto",
  },
  fileIcon: {
    width: "36px",
    height: "36px",
  },
  filename: {
    margin: "0 0 6px 0",
    fontSize: "20px",
    fontWeight: "700",
    color: "#111827",
    wordBreak: "break-all",
  },
  fileMeta: {
    margin: "0 0 24px 0",
    fontSize: "14px",
    color: "#6b7280",
  },
  passwordForm: {
    marginTop: "20px",
    textAlign: "left",
  },
  passwordNotice: {
    fontSize: "13px",
    color: "#374151",
    marginBottom: "12px",
    fontWeight: "500",
  },
  formGroup: {
    marginBottom: "12px",
  },
  passwordInput: {
    width: "100%",
    padding: "10px 14px",
    fontSize: "14px",
    border: "1px solid #d1d5db",
    borderRadius: "6px",
    boxSizing: "border-box",
  },
  submitButton: {
    width: "100%",
    padding: "12px",
    fontSize: "14px",
    fontWeight: "600",
    color: "#ffffff",
    backgroundColor: "#2563eb",
    border: "none",
    borderRadius: "6px",
    cursor: "pointer",
  },
  downloadSection: {
    marginTop: "20px",
  },
  expireNotice: {
    fontSize: "12px",
    color: "#6b7280",
    marginBottom: "16px",
  },
  downloadButton: {
    display: "inline-flex",
    alignItems: "center",
    justifyContent: "center",
    gap: "8px",
    width: "100%",
    padding: "12px",
    fontSize: "15px",
    fontWeight: "600",
    color: "#ffffff",
    backgroundColor: "#2563eb",
    border: "none",
    borderRadius: "8px",
    cursor: "pointer",
    boxShadow: "0 2px 4px rgba(37, 99, 235, 0.2)",
  },
  btnIcon: {
    width: "20px",
    height: "20px",
  },
  spinner: {
    width: "36px",
    height: "36px",
    border: "3px solid #e5e7eb",
    borderTopColor: "#2563eb",
    borderRadius: "50%",
    animation: "spin 1s linear infinite",
    margin: "0 auto 16px auto",
  },
  loadingText: {
    fontSize: "14px",
    color: "#6b7280",
    margin: 0,
  },
  errorIconWrapper: {
    width: "64px",
    height: "64px",
    backgroundColor: "#fef2f2",
    borderRadius: "50%",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    margin: "0 auto 16px auto",
  },
  errorIcon: {
    width: "36px",
    height: "36px",
  },
  errorTitle: {
    margin: "0 0 8px 0",
    fontSize: "20px",
    fontWeight: "700",
    color: "#991b1b",
  },
  errorText: {
    margin: 0,
    fontSize: "14px",
    color: "#4b5563",
  },
  errorAlert: {
    marginBottom: "12px",
    padding: "8px 12px",
    backgroundColor: "#fef2f2",
    color: "#991b1b",
    fontSize: "13px",
    borderRadius: "6px",
    border: "1px solid #fecaca",
  },
};

export default SharePage;

