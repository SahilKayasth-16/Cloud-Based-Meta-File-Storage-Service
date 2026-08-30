import React, { useState, useCallback } from "react";
import { useDropzone } from "react-dropzone";

const FileUploadModal = ({ isOpen, onClose, onUpload, isLoading, errorMessage }) => {
  const [selectedFile, setSelectedFile] = useState(null);
  const [uploadProgress, setUploadProgress] = useState(0);

  const onDrop = useCallback((acceptedFiles) => {
    if (acceptedFiles && acceptedFiles.length > 0) {
      setSelectedFile(acceptedFiles[0]);
      setUploadProgress(0);
    }
  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    multiple: false,
  });

  if (!isOpen) return null;

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!selectedFile) return;
    onUpload(selectedFile, (progressEvent) => {
      if (progressEvent.total) {
        const percent = Math.round((progressEvent.loaded * 100) / progressEvent.total);
        setUploadProgress(percent);
      }
    });
  };

  const handleClose = () => {
    setSelectedFile(null);
    setUploadProgress(0);
    onClose();
  };

  const formatSize = (bytes) => {
    if (!bytes) return "0 B";
    const k = 1024;
    const sizes = ["B", "KB", "MB", "GB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
  };

  return (
    <div style={styles.overlay}>
      <div style={styles.modal}>
        <div style={styles.header}>
          <h3 style={styles.title}>Upload File</h3>
          <button onClick={handleClose} style={styles.closeButton}>
            &times;
          </button>
        </div>

        <form onSubmit={handleSubmit}>
          {errorMessage && <div style={styles.errorAlert}>{errorMessage}</div>}

          <div style={styles.body}>
            <div
              {...getRootProps()}
              style={{
                ...styles.dropzone,
                ...(isDragActive ? styles.dropzoneActive : {}),
              }}
            >
              <input {...getInputProps()} />
              <svg style={styles.uploadIcon} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"
                />
              </svg>

              {isDragActive ? (
                <p style={styles.dropTextActive}>Drop the file here...</p>
              ) : (
                <>
                  <p style={styles.dropText}>
                    Drag & drop your file here, or <span style={styles.browseText}>browse</span>
                  </p>
                  <p style={styles.dropSubtext}>Supports any file up to 50 MB</p>
                </>
              )}
            </div>

            {selectedFile && (
              <div style={styles.filePreview}>
                <div style={styles.fileDetails}>
                  <svg style={styles.fileIcon} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                    />
                  </svg>
                  <div style={styles.fileMeta}>
                    <span style={styles.filename}>{selectedFile.name}</span>
                    <span style={styles.filesize}>{formatSize(selectedFile.size)}</span>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => setSelectedFile(null)}
                  style={styles.removeButton}
                  disabled={isLoading}
                >
                  Remove
                </button>
              </div>
            )}

            {isLoading && uploadProgress > 0 && (
              <div style={styles.progressContainer}>
                <div style={styles.progressBarWrapper}>
                  <div
                    style={{
                      ...styles.progressBar,
                      width: `${uploadProgress}%`,
                    }}
                  />
                </div>
                <span style={styles.progressText}>{uploadProgress}% uploaded</span>
              </div>
            )}
          </div>

          <div style={styles.footer}>
            <button
              type="button"
              onClick={handleClose}
              style={styles.cancelButton}
              disabled={isLoading}
            >
              Cancel
            </button>
            <button
              type="submit"
              style={styles.submitButton}
              disabled={isLoading || !selectedFile}
            >
              {isLoading ? "Uploading..." : "Upload"}
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
    maxWidth: "460px",
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
  dropzone: {
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "center",
    padding: "32px 16px",
    border: "2px dashed #d1d5db",
    borderRadius: "8px",
    backgroundColor: "#f9fafb",
    cursor: "pointer",
    transition: "all 0.15s ease",
  },
  dropzoneActive: {
    borderColor: "#2563eb",
    backgroundColor: "#eff6ff",
  },
  uploadIcon: {
    width: "40px",
    height: "40px",
    color: "#9ca3af",
    marginBottom: "12px",
  },
  dropText: {
    margin: "0 0 4px 0",
    fontSize: "14px",
    color: "#374151",
    fontWeight: "500",
  },
  dropTextActive: {
    margin: 0,
    fontSize: "14px",
    color: "#2563eb",
    fontWeight: "600",
  },
  browseText: {
    color: "#2563eb",
    textDecoration: "underline",
  },
  dropSubtext: {
    margin: 0,
    fontSize: "12px",
    color: "#9ca3af",
  },
  filePreview: {
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    marginTop: "16px",
    padding: "12px",
    backgroundColor: "#f3f4f6",
    borderRadius: "6px",
  },
  fileDetails: {
    display: "flex",
    alignItems: "center",
    overflow: "hidden",
  },
  fileIcon: {
    width: "24px",
    height: "24px",
    color: "#2563eb",
    marginRight: "10px",
    flexShrink: 0,
  },
  fileMeta: {
    display: "flex",
    flexDirection: "column",
    overflow: "hidden",
  },
  filename: {
    fontSize: "13px",
    fontWeight: "600",
    color: "#1f2937",
    whiteSpace: "nowrap",
    overflow: "hidden",
    textOverflow: "ellipsis",
  },
  filesize: {
    fontSize: "11px",
    color: "#6b7280",
  },
  removeButton: {
    background: "none",
    border: "none",
    color: "#dc2626",
    fontSize: "12px",
    fontWeight: "600",
    cursor: "pointer",
    marginLeft: "12px",
  },
  progressContainer: {
    marginTop: "12px",
  },
  progressBarWrapper: {
    height: "6px",
    backgroundColor: "#e5e7eb",
    borderRadius: "3px",
    overflow: "hidden",
  },
  progressBar: {
    height: "100%",
    backgroundColor: "#2563eb",
    transition: "width 0.2s ease",
  },
  progressText: {
    fontSize: "11px",
    color: "#6b7280",
    marginTop: "4px",
    display: "block",
    textAlign: "right",
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

export default FileUploadModal;

