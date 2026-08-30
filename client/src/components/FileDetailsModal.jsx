import React from "react";
import { useQuery } from "@tanstack/react-query";
import { getFileMetadata } from "../services/fileService";

const formatSize = (bytes) => {
  if (!bytes && bytes !== 0) return "0 B";
  const k = 1024;
  const sizes = ["B", "KB", "MB", "GB"];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  const formatted = parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
  return `${formatted} (${bytes.toLocaleString()} bytes)`;
};

const formatDate = (dateStr) => {
  if (!dateStr) return "--";
  return new Date(dateStr).toLocaleString(undefined, {
    dateStyle: "full",
    timeStyle: "medium",
  });
};

const FileDetailsModal = ({ isOpen, fileId, file: propFile, onClose, onDownload }) => {
  // Fetch fresh metadata from GET /api/files/{id}
  const { data: fileMeta, isLoading, isError, error } = useQuery({
    queryKey: ["fileMetadata", fileId],
    queryFn: () => getFileMetadata(fileId),
    enabled: !!isOpen && !!fileId,
  });

  if (!isOpen) return null;

  const file = fileMeta || propFile;

  return (
    <div style={styles.overlay}>
      <div style={styles.modal}>
        <div style={styles.header}>
          <div style={styles.headerTitleGroup}>
            <svg style={styles.headerIcon} fill="none" stroke="#2563eb" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <h3 style={styles.title}>File Metadata Details</h3>
          </div>
          <button onClick={onClose} style={styles.closeButton}>
            &times;
          </button>
        </div>

        <div style={styles.body}>
          {isLoading ? (
            <div style={styles.loadingContainer}>
              <div style={styles.spinner}></div>
              <p style={styles.loadingText}>Fetching metadata from server...</p>
            </div>
          ) : isError ? (
            <div style={styles.errorAlert}>
              {error?.response?.data?.message || "Failed to load file metadata."}
            </div>
          ) : file ? (
            <div style={styles.detailsGrid}>
              <div style={styles.detailRow}>
                <span style={styles.label}>Filename:</span>
                <span style={styles.valueHighlight}>{file.filename}</span>
              </div>

              <div style={styles.detailRow}>
                <span style={styles.label}>File ID (UUID):</span>
                <code style={styles.codeValue}>{file.id}</code>
              </div>

              <div style={styles.detailRow}>
                <span style={styles.label}>Content Type (MIME):</span>
                <span style={styles.mimeBadge}>{file.contentType || "application/octet-stream"}</span>
              </div>

              <div style={styles.detailRow}>
                <span style={styles.label}>Size:</span>
                <span style={styles.value}>{formatSize(file.size)}</span>
              </div>

              <div style={styles.detailRow}>
                <span style={styles.label}>Storage Key:</span>
                <code style={styles.codeValue}>{file.storageKey}</code>
              </div>

              <div style={styles.detailRow}>
                <span style={styles.label}>Uploaded Date:</span>
                <span style={styles.value}>{formatDate(file.createdAt)}</span>
              </div>

              {file.updatedAt && (
                <div style={styles.detailRow}>
                  <span style={styles.label}>Last Modified:</span>
                  <span style={styles.value}>{formatDate(file.updatedAt)}</span>
                </div>
              )}
            </div>
          ) : null}
        </div>

        <div style={styles.footer}>
          {file && onDownload && (
            <button
              type="button"
              onClick={() => {
                onClose();
                onDownload(file);
              }}
              style={styles.downloadButton}
            >
              <svg style={styles.buttonIcon} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
              </svg>
              Download File
            </button>
          )}
          <button type="button" onClick={onClose} style={styles.cancelButton}>
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
    maxWidth: "520px",
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
  headerTitleGroup: {
    display: "flex",
    alignItems: "center",
    gap: "8px",
  },
  headerIcon: {
    width: "22px",
    height: "22px",
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
    maxHeight: "70vh",
    overflowY: "auto",
  },
  detailsGrid: {
    display: "flex",
    flexDirection: "column",
    gap: "14px",
  },
  detailRow: {
    display: "flex",
    flexDirection: "column",
    gap: "4px",
    paddingBottom: "10px",
    borderBottom: "1px solid #f3f4f6",
  },
  label: {
    fontSize: "12px",
    fontWeight: "600",
    color: "#6b7280",
    textTransform: "uppercase",
    letterSpacing: "0.5px",
  },
  value: {
    fontSize: "14px",
    color: "#1f2937",
    fontWeight: "500",
  },
  valueHighlight: {
    fontSize: "15px",
    color: "#111827",
    fontWeight: "600",
    wordBreak: "break-all",
  },
  codeValue: {
    fontSize: "12px",
    fontFamily: "monospace",
    backgroundColor: "#f3f4f6",
    color: "#111827",
    padding: "4px 8px",
    borderRadius: "4px",
    wordBreak: "break-all",
  },
  mimeBadge: {
    display: "inline-block",
    alignSelf: "flex-start",
    fontSize: "12px",
    fontWeight: "600",
    color: "#2563eb",
    backgroundColor: "#eff6ff",
    padding: "2px 8px",
    borderRadius: "4px",
  },
  loadingContainer: {
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    padding: "32px 0",
  },
  spinner: {
    width: "28px",
    height: "28px",
    border: "3px solid #e5e7eb",
    borderTopColor: "#2563eb",
    borderRadius: "50%",
    animation: "spin 1s linear infinite",
  },
  loadingText: {
    marginTop: "12px",
    fontSize: "13px",
    color: "#6b7280",
  },
  errorAlert: {
    padding: "12px",
    backgroundColor: "#fef2f2",
    color: "#991b1b",
    fontSize: "13px",
    borderRadius: "6px",
    border: "1px solid #fecaca",
  },
  footer: {
    display: "flex",
    justifyContent: "flex-end",
    gap: "10px",
    padding: "12px 20px",
    backgroundColor: "#f9fafb",
    borderTop: "1px solid #f3f4f6",
  },
  downloadButton: {
    display: "inline-flex",
    alignItems: "center",
    gap: "6px",
    padding: "8px 16px",
    fontSize: "13px",
    fontWeight: "600",
    color: "#ffffff",
    backgroundColor: "#2563eb",
    border: "none",
    borderRadius: "6px",
    cursor: "pointer",
  },
  buttonIcon: {
    width: "16px",
    height: "16px",
  },
  cancelButton: {
    padding: "8px 16px",
    fontSize: "13px",
    fontWeight: "500",
    color: "#4b5563",
    backgroundColor: "#ffffff",
    border: "1px solid #d1d5db",
    borderRadius: "6px",
    cursor: "pointer",
  },
};

export default FileDetailsModal;

