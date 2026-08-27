import React, { useState } from "react";

const FolderCard = ({ folder, onOpen, onRename, onDelete }) => {
  const [showMenu, setShowMenu] = useState(false);

  const handleMenuClick = (e) => {
    e.stopPropagation();
    setShowMenu((prev) => !prev);
  };

  const handleRename = (e) => {
    e.stopPropagation();
    setShowMenu(false);
    onRename(folder);
  };

  const handleDelete = (e) => {
    e.stopPropagation();
    setShowMenu(false);
    onDelete(folder);
  };

  const formattedDate = folder.createdAt
    ? new Date(folder.createdAt).toLocaleDateString(undefined, {
        month: "short",
        day: "numeric",
        year: "numeric",
      })
    : "";

  return (
    <div
      style={styles.card}
      onDoubleClick={() => onOpen(folder)}
      title={`Double click to open ${folder.name}`}
    >
      <div style={styles.contentRow} onClick={() => onOpen(folder)}>
        <div style={styles.iconWrapper}>
          <svg style={styles.folderIcon} viewBox="0 0 24 24" fill="#f59e0b">
            <path d="M10 4H4c-1.1 0-1.99.9-1.99 2L2 18c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V8c0-1.1-.9-2-2-2h-8l-2-2z" />
          </svg>
        </div>

        <div style={styles.info}>
          <span style={styles.name}>{folder.name}</span>
          {formattedDate && <span style={styles.date}>{formattedDate}</span>}
        </div>
      </div>

      <div style={styles.menuContainer}>
        <button
          onClick={handleMenuClick}
          style={styles.menuButton}
          aria-label="Folder options"
        >
          <svg
            style={styles.menuIcon}
            fill="currentColor"
            viewBox="0 0 24 24"
          >
            <path d="M12 8c1.1 0 2-.9 2-2s-.9-2-2-2-2 .9-2 2 .9 2 2 2zm0 2c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2zm0 6c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2z" />
          </svg>
        </button>

        {showMenu && (
          <div style={styles.dropdown}>
            <button onClick={handleRename} style={styles.dropdownItem}>
              <svg style={styles.itemIcon} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
              </svg>
              Rename
            </button>
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
    cursor: "pointer",
    userSelect: "none",
    transition: "all 0.15s ease",
    boxShadow: "0 1px 3px rgba(0,0,0,0.05)",
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
    marginRight: "12px",
    flexShrink: 0,
  },
  folderIcon: {
    width: "28px",
    height: "28px",
  },
  info: {
    display: "flex",
    flexDirection: "column",
    overflow: "hidden",
  },
  name: {
    fontSize: "14px",
    fontWeight: "600",
    color: "#1f2937",
    whiteSpace: "nowrap",
    overflow: "hidden",
    textOverflow: "ellipsis",
  },
  date: {
    fontSize: "12px",
    color: "#6b7280",
    marginTop: "2px",
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
    width: "140px",
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

export default FolderCard;

