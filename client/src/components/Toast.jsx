import React from "react";

const Toast = ({ message, type = "success", onClose }) => {
  const isSuccess = type === "success";

  return (
    <div
      style={{
        ...styles.toast,
        backgroundColor: isSuccess ? "#065f46" : "#991b1b",
        borderColor: isSuccess ? "#059669" : "#dc2626",
      }}
    >
      <div style={styles.iconWrapper}>
        {isSuccess ? (
          <svg style={styles.icon} fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
          </svg>
        ) : (
          <svg style={styles.icon} fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        )}
      </div>

      <span style={styles.message}>{message}</span>

      <button onClick={onClose} style={styles.closeBtn}>
        &times;
      </button>
    </div>
  );
};

const styles = {
  toast: {
    display: "flex",
    alignItems: "center",
    gap: "12px",
    padding: "12px 16px",
    color: "#ffffff",
    borderRadius: "8px",
    border: "1px solid",
    boxShadow: "0 10px 15px -3px rgba(0, 0, 0, 0.2), 0 4px 6px -2px rgba(0, 0, 0, 0.1)",
    fontSize: "14px",
    fontWeight: "500",
    maxWidth: "380px",
    animation: "slideIn 0.2s ease-out",
  },
  iconWrapper: {
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
  },
  icon: {
    width: "20px",
    height: "20px",
  },
  message: {
    flex: 1,
  },
  closeBtn: {
    background: "none",
    border: "none",
    color: "rgba(255, 255, 255, 0.8)",
    fontSize: "18px",
    cursor: "pointer",
    padding: "0 4px",
  },
};

export default Toast;

