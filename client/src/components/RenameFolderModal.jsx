import React, { useState, useEffect } from "react";

const RenameFolderModal = ({ isOpen, folder, onClose, onSubmit, isLoading, errorMessage }) => {
  const [folderName, setFolderName] = useState("");

  useEffect(() => {
    if (folder) {
      setFolderName(folder.name || "");
    }
  }, [folder]);

  if (!isOpen || !folder) return null;

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!folderName.trim()) return;
    onSubmit(folderName.trim());
  };

  return (
    <div style={styles.overlay}>
      <div style={styles.modal}>
        <div style={styles.header}>
          <h3 style={styles.title}>Rename folder</h3>
          <button onClick={onClose} style={styles.closeButton}>
            &times;
          </button>
        </div>

        <form onSubmit={handleSubmit}>
          {errorMessage && <div style={styles.errorAlert}>{errorMessage}</div>}

          <div style={styles.body}>
            <input
              type="text"
              value={folderName}
              onChange={(e) => setFolderName(e.target.value)}
              placeholder="Folder name"
              autoFocus
              style={styles.input}
              disabled={isLoading}
            />
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
              type="submit"
              style={styles.submitButton}
              disabled={isLoading || !folderName.trim() || folderName.trim() === folder.name}
            >
              {isLoading ? "Saving..." : "Save"}
            </button>
          </div>
        </form>
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
  input: {
    width: "100%",
    padding: "10px 12px",
    fontSize: "14px",
    border: "1px solid #d1d5db",
    borderRadius: "6px",
    outline: "none",
    boxSizing: "border-box",
  },
  errorAlert: {
    margin: "12px 20px 0 20px",
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
  submitButton: {
    padding: "8px 16px",
    fontSize: "14px",
    fontWeight: "500",
    color: "#ffffff",
    backgroundColor: "#2563eb",
    border: "none",
    borderRadius: "6px",
    cursor: "pointer",
  },
};

export default RenameFolderModal;

