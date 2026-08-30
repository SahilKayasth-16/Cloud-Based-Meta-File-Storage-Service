import React, { useState } from "react";

const formatSize = (bytes) => {
  if (!bytes && bytes !== 0) return "--";
  const k = 1024;
  const sizes = ["B", "KB", "MB", "GB"];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + " " + sizes[i];
};

const formatDate = (dateStr) => {
  if (!dateStr) return "--";
  return new Date(dateStr).toLocaleDateString(undefined, {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
};

const FileListView = ({
  folders = [],
  files = [],
  onOpenFolder,
  onRenameFolder,
  onDeleteFolder,
  onDownloadFile,
  onDeleteFile,
}) => {
  const [activeMenuId, setActiveMenuId] = useState(null);

  const toggleMenu = (e, id) => {
    e.stopPropagation();
    setActiveMenuId((prev) => (prev === id ? null : id));
  };

  return (
    <div style={styles.tableWrapper}>
      <table style={styles.table}>
        <thead>
          <tr style={styles.theadRow}>
            <th style={styles.thName}>Name</th>
            <th style={styles.thType}>Type</th>
            <th style={styles.thSize}>Size</th>
            <th style={styles.thModified}>Modified</th>
            <th style={styles.thActions}>Actions</th>
          </tr>
        </thead>
        <tbody>
          {/* Folders Rows */}
          {folders.map((folder) => {
            const isMenuOpen = activeMenuId === `folder-${folder.id}`;
            return (
              <tr
                key={`folder-${folder.id}`}
                style={styles.tr}
                onDoubleClick={() => onOpenFolder(folder)}
              >
                <td style={styles.tdName} onClick={() => onOpenFolder(folder)}>
                  <div style={styles.nameCell}>
                    <svg style={styles.folderIcon} viewBox="0 0 24 24" fill="#f59e0b">
                      <path d="M10 4H4c-1.1 0-1.99.9-1.99 2L2 18c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V8c0-1.1-.9-2-2-2h-8l-2-2z" />
                    </svg>
                    <span style={styles.itemName}>{folder.name}</span>
                  </div>
                </td>
                <td style={styles.td}>Folder</td>
                <td style={styles.td}>--</td>
                <td style={styles.td}>{formatDate(folder.createdAt)}</td>
                <td style={styles.tdActions}>
                  <div style={styles.menuContainer}>
                    <button
                      onClick={(e) => toggleMenu(e, `folder-${folder.id}`)}
                      style={styles.menuButton}
                    >
                      &#8942;
                    </button>
                    {isMenuOpen && (
                      <div style={styles.dropdown}>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            setActiveMenuId(null);
                            onRenameFolder(folder);
                          }}
                          style={styles.dropdownItem}
                        >
                          Rename
                        </button>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            setActiveMenuId(null);
                            onDeleteFolder(folder);
                          }}
                          style={styles.dropdownItemDanger}
                        >
                          Delete
                        </button>
                      </div>
                    )}
                  </div>
                </td>
              </tr>
            );
          })}

          {/* Files Rows */}
          {files.map((file) => {
            const isMenuOpen = activeMenuId === `file-${file.id}`;
            return (
              <tr key={`file-${file.id}`} style={styles.tr}>
                <td style={styles.tdName}>
                  <div style={styles.nameCell}>
                    <svg style={styles.fileIcon} fill="none" stroke="#2563eb" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                    </svg>
                    <span style={styles.itemName}>{file.filename}</span>
                  </div>
                </td>
                <td style={styles.td}>{file.contentType || "File"}</td>
                <td style={styles.td}>{formatSize(file.size)}</td>
                <td style={styles.td}>{formatDate(file.createdAt)}</td>
                <td style={styles.tdActions}>
                  <div style={styles.menuContainer}>
                    <button
                      onClick={(e) => toggleMenu(e, `file-${file.id}`)}
                      style={styles.menuButton}
                    >
                      &#8942;
                    </button>
                    {isMenuOpen && (
                      <div style={styles.dropdown}>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            setActiveMenuId(null);
                            onDownloadFile(file);
                          }}
                          style={styles.dropdownItem}
                        >
                          Download
                        </button>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            setActiveMenuId(null);
                            onDeleteFile(file);
                          }}
                          style={styles.dropdownItemDanger}
                        >
                          Delete
                        </button>
                      </div>
                    )}
                  </div>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
};

const styles = {
  tableWrapper: {
    backgroundColor: "#ffffff",
    borderRadius: "8px",
    border: "1px solid #e5e7eb",
    overflow: "hidden",
    marginTop: "16px",
    boxShadow: "0 1px 3px rgba(0,0,0,0.05)",
  },
  table: {
    width: "100%",
    borderCollapse: "collapse",
    textAlign: "left",
    fontSize: "14px",
  },
  theadRow: {
    backgroundColor: "#f9fafb",
    borderBottom: "1px solid #e5e7eb",
  },
  thName: {
    padding: "12px 16px",
    fontWeight: "600",
    color: "#374151",
    width: "40%",
  },
  thType: {
    padding: "12px 16px",
    fontWeight: "600",
    color: "#374151",
    width: "20%",
  },
  thSize: {
    padding: "12px 16px",
    fontWeight: "600",
    color: "#374151",
    width: "15%",
  },
  thModified: {
    padding: "12px 16px",
    fontWeight: "600",
    color: "#374151",
    width: "15%",
  },
  thActions: {
    padding: "12px 16px",
    fontWeight: "600",
    color: "#374151",
    width: "10%",
    textAlign: "right",
  },
  tr: {
    borderBottom: "1px solid #f3f4f6",
    cursor: "pointer",
    transition: "background-color 0.15s ease",
  },
  tdName: {
    padding: "12px 16px",
  },
  nameCell: {
    display: "flex",
    alignItems: "center",
    gap: "10px",
  },
  folderIcon: {
    width: "22px",
    height: "22px",
    flexShrink: 0,
  },
  fileIcon: {
    width: "22px",
    height: "22px",
    flexShrink: 0,
  },
  itemName: {
    fontWeight: "600",
    color: "#1f2937",
    overflow: "hidden",
    textOverflow: "ellipsis",
    whiteSpace: "nowrap",
  },
  td: {
    padding: "12px 16px",
    color: "#6b7280",
    whiteSpace: "nowrap",
  },
  tdActions: {
    padding: "12px 16px",
    textAlign: "right",
  },
  menuContainer: {
    position: "relative",
    display: "inline-block",
  },
  menuButton: {
    background: "none",
    border: "none",
    fontSize: "18px",
    color: "#6b7280",
    cursor: "pointer",
    padding: "4px 8px",
    borderRadius: "4px",
  },
  dropdown: {
    position: "absolute",
    right: 0,
    top: "28px",
    width: "120px",
    backgroundColor: "#ffffff",
    borderRadius: "6px",
    boxShadow: "0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)",
    border: "1px solid #f3f4f6",
    zIndex: 20,
    padding: "4px 0",
  },
  dropdownItem: {
    display: "block",
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
    display: "block",
    width: "100%",
    padding: "8px 12px",
    fontSize: "13px",
    color: "#dc2626",
    background: "none",
    border: "none",
    cursor: "pointer",
    textAlign: "left",
  },
};

export default FileListView;

