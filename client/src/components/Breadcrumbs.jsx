import React from "react";

const Breadcrumbs = ({ breadcrumbs = [], onNavigate }) => {
  return (
    <nav style={styles.nav} aria-label="Breadcrumb">
      <ol style={styles.list}>
        <li style={styles.item}>
          <button
            onClick={() => onNavigate(null)}
            style={breadcrumbs.length === 0 ? styles.activeLink : styles.link}
          >
            <svg
              style={styles.homeIcon}
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 00-1-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 00-1 1m-6 0h6"
              />
            </svg>
            My Drive
          </button>
        </li>

        {breadcrumbs.map((crumb, index) => {
          const isLast = index === breadcrumbs.length - 1;
          return (
            <React.Fragment key={crumb.id}>
              <li style={styles.separator}>/</li>
              <li style={styles.item}>
                {isLast ? (
                  <span style={styles.current}>{crumb.name}</span>
                ) : (
                  <button
                    onClick={() => onNavigate(crumb.id)}
                    style={styles.link}
                  >
                    {crumb.name}
                  </button>
                )}
              </li>
            </React.Fragment>
          );
        })}
      </ol>
    </nav>
  );
};

const styles = {
  nav: {
    padding: "8px 0",
    marginBottom: "16px",
  },
  list: {
    display: "flex",
    alignItems: "center",
    flexWrap: "wrap",
    listStyle: "none",
    padding: 0,
    margin: 0,
    fontSize: "14px",
  },
  item: {
    display: "flex",
    alignItems: "center",
  },
  separator: {
    margin: "0 8px",
    color: "#9ca3af",
    userSelect: "none",
  },
  link: {
    display: "inline-flex",
    alignItems: "center",
    background: "none",
    border: "none",
    padding: "4px 8px",
    color: "#2563eb",
    fontWeight: "500",
    borderRadius: "4px",
    cursor: "pointer",
    textDecoration: "none",
    transition: "background-color 0.15s ease",
  },
  activeLink: {
    display: "inline-flex",
    alignItems: "center",
    background: "none",
    border: "none",
    padding: "4px 8px",
    color: "#1f2937",
    fontWeight: "600",
    borderRadius: "4px",
    cursor: "pointer",
  },
  current: {
    padding: "4px 8px",
    color: "#374151",
    fontWeight: "600",
  },
  homeIcon: {
    width: "16px",
    height: "16px",
    marginRight: "6px",
  },
};

export default Breadcrumbs;

