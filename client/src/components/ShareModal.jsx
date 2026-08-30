import React, { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { createShare, getFileShares, removeShare } from "../services/shareService";

const ShareModal = ({ isOpen, file, onClose }) => {
  const [email, setEmail] = useState("");
  const [role, setRole] = useState("VIEWER");
  const [errorMessage, setErrorMessage] = useState("");
  const [successMessage, setSuccessMessage] = useState("");

  const queryClient = useQueryClient();

  // Fetch active shares for this file
  const { data: shares = [], isLoading: isLoadingShares } = useQuery({
    queryKey: ["fileShares", file?.id],
    queryFn: () => (file?.id ? getFileShares(file.id) : Promise.resolve([])),
    enabled: !!isOpen && !!file?.id,
  });

  // Share Creation Mutation
  const createMutation = useMutation({
    mutationFn: (data) => createShare(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["fileShares", file?.id] });
      setEmail("");
      setErrorMessage("");
      setSuccessMessage("File shared successfully!");
      setTimeout(() => setSuccessMessage(""), 3000);
    },
    onError: (err) => {
      setSuccessMessage("");
      setErrorMessage(err.response?.data?.message || "Failed to share file");
    },
  });

  // Remove Share Mutation
  const removeMutation = useMutation({
    mutationFn: (shareId) => removeShare(shareId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["fileShares", file?.id] });
      setErrorMessage("");
      setSuccessMessage("Share revoked successfully!");
      setTimeout(() => setSuccessMessage(""), 3000);
    },
    onError: (err) => {
      setErrorMessage(err.response?.data?.message || "Failed to revoke share");
    },
  });

  if (!isOpen || !file) return null;

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!email.trim()) return;
    setErrorMessage("");
    setSuccessMessage("");
    createMutation.mutate({
      fileId: file.id,
      email: email.trim(),
      role: role,
    });
  };

  const handleClose = () => {
    setEmail("");
    setRole("VIEWER");
    setErrorMessage("");
    setSuccessMessage("");
    onClose();
  };

  return (
    <div style={styles.overlay}>
      <div style={styles.modal}>
        <div style={styles.header}>
          <h3 style={styles.title}>Share "{file.filename}"</h3>
          <button onClick={handleClose} style={styles.closeButton}>
            &times;
          </button>
        </div>

        <div style={styles.body}>
          {errorMessage && <div style={styles.errorAlert}>{errorMessage}</div>}
          {successMessage && <div style={styles.successAlert}>{successMessage}</div>}

          <form onSubmit={handleSubmit} style={styles.form}>
            <div style={styles.formGroup}>
              <label style={styles.label}>User Email</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="user@example.com"
                required
                style={styles.input}
                disabled={createMutation.isPending}
              />
            </div>

            <div style={styles.formGroup}>
              <label style={styles.label}>Permission Role</label>
              <div style={styles.radioGroup}>
                <label style={styles.radioLabel}>
                  <input
                    type="radio"
                    name="shareRole"
                    value="VIEWER"
                    checked={role === "VIEWER"}
                    onChange={(e) => setRole(e.target.value)}
                  />
                  <span style={styles.radioText}>Viewer (Read & Download)</span>
                </label>
                <label style={styles.radioLabel}>
                  <input
                    type="radio"
                    name="shareRole"
                    value="EDITOR"
                    checked={role === "EDITOR"}
                    onChange={(e) => setRole(e.target.value)}
                  />
                  <span style={styles.radioText}>Editor (Read, Download, Modify & Delete)</span>
                </label>
              </div>
            </div>

            <button
              type="submit"
              style={styles.shareButton}
              disabled={createMutation.isPending || !email.trim()}
            >
              {createMutation.isPending ? "Sharing..." : "Share Access"}
            </button>
          </form>

          {/* Active Shares List */}
          <div style={styles.sharesSection}>
            <h4 style={styles.sharesTitle}>People with access</h4>
            {isLoadingShares ? (
              <p style={styles.loadingText}>Loading shares...</p>
            ) : shares.length === 0 ? (
              <p style={styles.emptyText}>Not shared with anyone yet.</p>
            ) : (
              <div style={styles.sharesList}>
                {shares.map((share) => (
                  <div key={share.id} style={styles.shareItem}>
                    <div style={styles.shareInfo}>
                      <span style={styles.shareEmail}>{share.userEmail}</span>
                      <span
                        style={{
                          ...styles.roleBadge,
                          ...(share.role === "EDITOR" ? styles.editorBadge : styles.viewerBadge),
                        }}
                      >
                        {share.role}
                      </span>
                    </div>

                    <button
                      onClick={() => removeMutation.mutate(share.id)}
                      style={styles.revokeButton}
                      disabled={removeMutation.isPending}
                    >
                      Revoke
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        <div style={styles.footer}>
          <button type="button" onClick={handleClose} style={styles.closeModalButton}>
            Close
          </button>
        </div>
      </div>
    </div>
  );
};

const styles = {
  overlay: {
    position: "fixed",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: "rgba(0, 0, 0, 0.4)",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    zIndex: 1000,
  },
  modal: {
    backgroundColor: "#ffffff",
    borderRadius: "8px",
    width: "100%",
    maxWidth: "480px",
    boxShadow: "0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)",
    overflow: "hidden",
  },
  header: {
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    padding: "16px 20px",
    borderBottom: "1px solid #f3f4f6",
  },
  title: {
    margin: 0,
    fontSize: "18px",
    fontWeight: "600",
    color: "#111827",
  },
  closeButton: {
    background: "none",
    border: "none",
    fontSize: "20px",
    color: "#9ca3af",
    cursor: "pointer",
  },
  body: {
    padding: "20px",
    maxHeight: "75vh",
    overflowY: "auto",
  },
  form: {
    marginBottom: "20px",
  },
  formGroup: {
    marginBottom: "14px",
  },
  label: {
    display: "block",
    fontSize: "13px",
    fontWeight: "600",
    color: "#374151",
    marginBottom: "6px",
  },
  input: {
    width: "100%",
    padding: "10px 12px",
    fontSize: "14px",
    border: "1px solid #d1d5db",
    borderRadius: "6px",
    outline: "none",
    boxSizing: "border-box",
  },
  radioGroup: {
    display: "flex",
    flexDirection: "column",
    gap: "8px",
  },
  radioLabel: {
    display: "flex",
    alignItems: "center",
    gap: "8px",
    cursor: "pointer",
    fontSize: "13px",
    color: "#374151",
  },
  radioText: {
    fontSize: "13px",
  },
  shareButton: {
    width: "100%",
    padding: "10px",
    fontSize: "14px",
    fontWeight: "600",
    color: "#ffffff",
    backgroundColor: "#2563eb",
    border: "none",
    borderRadius: "6px",
    cursor: "pointer",
    marginTop: "8px",
  },
  sharesSection: {
    borderTop: "1px solid #f3f4f6",
    paddingTop: "16px",
  },
  sharesTitle: {
    margin: "0 0 12px 0",
    fontSize: "14px",
    fontWeight: "600",
    color: "#374151",
  },
  sharesList: {
    display: "flex",
    flexDirection: "column",
    gap: "8px",
  },
  shareItem: {
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    padding: "8px 12px",
    backgroundColor: "#f9fafb",
    borderRadius: "6px",
    border: "1px solid #f3f4f6",
  },
  shareInfo: {
    display: "flex",
    alignItems: "center",
    gap: "8px",
  },
  shareEmail: {
    fontSize: "13px",
    fontWeight: "500",
    color: "#1f2937",
  },
  roleBadge: {
    fontSize: "11px",
    fontWeight: "700",
    padding: "2px 6px",
    borderRadius: "4px",
    textTransform: "uppercase",
  },
  viewerBadge: {
    backgroundColor: "#eff6ff",
    color: "#2563eb",
  },
  editorBadge: {
    backgroundColor: "#fef3c7",
    color: "#d97706",
  },
  revokeButton: {
    background: "none",
    border: "none",
    color: "#dc2626",
    fontSize: "12px",
    fontWeight: "600",
    cursor: "pointer",
  },
  errorAlert: {
    marginBottom: "14px",
    padding: "8px 12px",
    backgroundColor: "#fef2f2",
    color: "#991b1b",
    fontSize: "13px",
    borderRadius: "6px",
    border: "1px solid #fecaca",
  },
  successAlert: {
    marginBottom: "14px",
    padding: "8px 12px",
    backgroundColor: "#ecfdf5",
    color: "#065f46",
    fontSize: "13px",
    borderRadius: "6px",
    border: "1px solid #a7f3d0",
  },
  loadingText: {
    fontSize: "13px",
    color: "#6b7280",
  },
  emptyText: {
    fontSize: "13px",
    color: "#9ca3af",
    fontStyle: "italic",
  },
  footer: {
    display: "flex",
    justifyContent: "flex-end",
    padding: "12px 20px",
    backgroundColor: "#f9fafb",
    borderTop: "1px solid #f3f4f6",
  },
  closeModalButton: {
    padding: "8px 16px",
    fontSize: "14px",
    fontWeight: "500",
    color: "#4b5563",
    backgroundColor: "#ffffff",
    border: "1px solid #d1d5db",
    borderRadius: "6px",
    cursor: "pointer",
  },
};

export default ShareModal;

