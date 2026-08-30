import React, { useState } from "react";

const getFileIconInfo = (filename, contentType) => {
  const ext = filename ? filename.split(".").pop().toLowerCase() : "";
  const type = contentType ? contentType.toLowerCase() : "";

  if (type.startsWith("image/") || ["png", "jpg", "jpeg", "gif", "svg", "webp"].includes(ext)) {
    return { color: "#ec4899", label: "IMG", bg: "#fce7f3" };
  }
  if (type.includes("pdf") || ext === "pdf") {
    return { color: "#ef4444", label: "PDF", bg: "#fee2e2" };
  }
  if (type.includes("zip") || type.includes("archive") || ["zip", "rar", "7z", "tar", "gz"].includes(ext)) {
    return { color: "#f59e0b", label: "ZIP", bg: "#fef3c7" };
  }
  if (type.startsWith("video/") || type.startsWith("audio/") || ["mp4", "mkv", "mp3", "wav"].includes(ext)) {
    return { color: "#8b5cf6", label: "MEDIA", bg: "#ede9fe" };
  }
  if (["js", "jsx", "ts", "tsx", "java", "py", "html", "css", "json", "cpp", "c", "cs"].includes(ext)) {
    return { color: "#10b981", label: "CODE", bg: "#d1fae5" };
  }
  return { color: "#3b82f6", label: "FILE", bg: "#dbeafe" };
};

const formatSize = (bytes) => {
  if (!bytes && bytes !== 0) return "0 B";
  const k = 1024;
  const sizes = ["B", "KB", "MB", "GB"];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + " " + sizes[i];
};

const FileCard = ({ file, onDownload, onShare, onViewDetails, onDelete }) => {
  const [showMenu, setShowMenu] = useState(false);

  const iconInfo = getFileIconInfo(file.filename, file.contentType);

  const handleMenuClick = (e) => {
    e.stopPropagation();
    setShowMenu((prev) => !prev);
  };

  const handleDownload = (e) => {
    e.stopPropagation();
    setShowMenu(false);
    onDownload(file);
  };

  const handleShare = (e) => {
    e.stopPropagation();
    setShowMenu(false);
    onShare(file);
  };

  const handleViewDetails = (e) => {
    e.stopPropagation();
    setShowMenu(false);
    onViewDetails(file);
  };

  const handleDelete = (e) => {
    e.stopPropagation();
    setShowMenu(false);
    onDelete(file);
  };

  const formattedDate = file.createdAt
    ? new Date(file.createdAt).toLocaleDateString(undefined, {
        month: "short",
        day: "numeric",
        year: "numeric",
      })
    : "";

  return (
    <div style={styles.card} title={file.filename}>
      <div style={styles.contentRow}>
        <div style={{ ...styles.iconWrapper, backgroundColor: iconInfo.bg }}>
          <span style={{ ...styles.iconBadge, color: iconInfo.color }}>
            {iconInfo.label}
          </span>
        </div>

        <div style={styles.info}>
          <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
            <span style={styles.filename}>{file.filename}</span>
            {file.sharedRole && (
              <span
                style={{
                  fontSize: "9px",
                  fontWeight: "700",
                  padding: "1px 5px",
                  borderRadius: "4px",
                  textTransform: "uppercase",
                  backgroundColor: file.sharedRole === "EDITOR" ? "#fef3c7" : "#eff6ff",
                  color: file.sharedRole === "EDITOR" ? "#d97706" : "#2563eb",
                }}
              >
                {file.sharedRole}
              </span>
            )}
          </div>
          <div style={styles.subMeta}>
            <span>{formatSize(file.size)}</span>
            {file.ownerEmail && (
              <>
                <span style={styles.dotSeparator}>•</span>
                <span>By {file.ownerEmail}</span>
              </>
            )}
            {!file.ownerEmail && formattedDate && <span style={styles.dotSeparator}>•</span>}
            {!file.ownerEmail && formattedDate && <span>{formattedDate}</span>}
          </div>
        </div>
      </div>

      <div style={styles.menuContainer}>
        <button
          onClick={handleMenuClick}
          style={styles.menuButton}
          aria-label="File options"
        >
          <svg style={styles.menuIcon} fill="currentColor" viewBox="0 0 24 24">
            <path d="M12 8c1.1 0 2-.9 2-2s-.9-2-2-2-2 .9-2 2 .9 2 2 2zm0 2c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2zm0 6c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2z" />
          </svg>
        </button>

        {showMenu && (
          <div style={styles.dropdown}>
            {onViewDetails && (
              <button onClick={handleViewDetails} style={styles.dropdownItem}>
                <svg style={styles.itemIcon} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                View Details
              </button>
            )}
            <button onClick={handleDownload} style={styles.dropdownItem}>
              <svg style={styles.itemIcon} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
              </svg>
              Download
            </button>
            {onShare && (
              <button onClick={handleShare} style={styles.dropdownItem}>
                <svg style={styles.itemIcon} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z" />
                </svg>
                Share
              </button>
            )}
            <button onClick={handleDelete} style={styles.dropdownItemDanger}>
              <svg style={styles.itemIcon} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
              </svg>
              Delete
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

const styles = {
  card: {
    position: "relative",
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    padding: "12px 16px",
    backgroundColor: "#ffffff",
    border: "1px solid #e5e7eb",
    borderRadius: "8px",
    boxShadow: "0 1px 3px rgba(0,0,0,0.05)",
    userSelect: "none",
  },
  contentRow: {
    display: "flex",
    alignItems: "center",
    flex: 1,
    overflow: "hidden",
  },
  iconWrapper: {
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    width: "36px",
    height: "36px",
    borderRadius: "6px",
    marginRight: "12px",
    flexShrink: 0,
  },
  iconBadge: {
    fontSize: "10px",
    fontWeight: "700",
    letterSpacing: "0.5px",
  },
  info: {
    display: "flex",
    flexDirection: "column",
    overflow: "hidden",
  },
  filename: {
    fontSize: "14px",
    fontWeight: "600",
    color: "#1f2937",
    whiteSpace: "nowrap",
    overflow: "hidden",
    textOverflow: "ellipsis",
  },
  subMeta: {
    display: "flex",
    alignItems: "center",
    fontSize: "12px",
    color: "#6b7280",
    marginTop: "2px",
  },
  dotSeparator: {
    margin: "0 4px",
  },
  menuContainer: {
    position: "relative",
    marginLeft: "8px",
  },
  menuButton: {
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    width: "32px",
    height: "32px",
    background: "transparent",
    border: "none",
    borderRadius: "50%",
    color: "#6b7280",
    cursor: "pointer",
  },
  menuIcon: {
    width: "20px",
    height: "20px",
  },
  dropdown: {
    position: "absolute",
    right: 0,
    top: "36px",
    width: "130px",
    backgroundColor: "#ffffff",
    borderRadius: "6px",
    boxShadow: "0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)",
    border: "1px solid #f3f4f6",
    zIndex: 20,
    padding: "4px 0",
  },
  dropdownItem: {
    display: "flex",
    alignItems: "center",
    width: "100%",
    padding: "8px 12px",
    fontSize: "13px",
    color: "#374151",
    background: "none",
    border: "none",
    cursor: "pointer",
    textAlign: "left",
  },
  dropdownItemDanger: {
    display: "flex",
    alignItems: "center",
    width: "100%",
    padding: "8px 12px",
    fontSize: "13px",
    color: "#dc2626",
    background: "none",
    border: "none",
    cursor: "pointer",
    textAlign: "left",
  },
  itemIcon: {
    width: "16px",
    height: "16px",
    marginRight: "8px",
  },
};

export default FileCard;
