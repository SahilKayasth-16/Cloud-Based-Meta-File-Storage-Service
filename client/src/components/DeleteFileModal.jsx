import React from "react";

const DeleteFileModal = ({ isOpen, file, onClose, onConfirm, isLoading, errorMessage }) => {
  if (!isOpen || !file) return null;

  return (
    <div style={styles.overlay}>
      <div style={styles.modal}>
        <div style={styles.header}>
          <h3 style={styles.title}>Move this file to Trash?</h3>
          <button onClick={onClose} style={styles.closeButton}>
            &times;
          </button>
        </div>

        <div style={styles.body}>
          {errorMessage && <div style={styles.errorAlert}>{errorMessage}</div>}
          <p style={styles.text}>
            Are you sure you want to delete <strong>"{file.filename}"</strong>?
          </p>
          <p style={styles.subtext}>
            This file will be moved to trash and hidden from normal file listings.
          </p>
        </div>

        <div style={styles.footer}>
          <button
            type="button"
            onClick={onClose}
            style={styles.cancelButton}
            disabled={isLoading}
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={() => onConfirm(file.id)}
            style={styles.deleteButton}
            disabled={isLoading}
          >
            {isLoading ? "Deleting..." : "Move to Trash"}
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
    maxWidth: "400px",
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
  },
  text: {
    margin: "0 0 8px 0",
    fontSize: "14px",
    color: "#374151",
  },
  subtext: {
    margin: 0,
    fontSize: "13px",
    color: "#6b7280",
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
  footer: {
    display: "flex",
    justifyContent: "flex-end",
    gap: "12px",
    padding: "12px 20px",
    backgroundColor: "#f9fafb",
    borderTop: "1px solid #f3f4f6",
  },
  cancelButton: {
    padding: "8px 16px",
    fontSize: "14px",
    fontWeight: "500",
    color: "#4b5563",
    backgroundColor: "#ffffff",
    border: "1px solid #d1d5db",
    borderRadius: "6px",
    cursor: "pointer",
  },
  deleteButton: {
    padding: "8px 16px",
    fontSize: "14px",
    fontWeight: "500",
    color: "#ffffff",
    backgroundColor: "#dc2626",
    border: "none",
    borderRadius: "6px",
    cursor: "pointer",
  },
};

export default DeleteFileModal;
