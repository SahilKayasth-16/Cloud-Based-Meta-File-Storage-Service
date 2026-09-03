import React, { useState, useEffect } from "react";

const SearchFilterBar = ({ onSearchChange, onFilterChange, activeFilters }) => {
  const [searchTerm, setSearchTerm] = useState(activeFilters.q || "");
  const [isFilterOpen, setIsFilterOpen] = useState(false);

  // Local filter form state
  const [mimeType, setMimeType] = useState(activeFilters.mimeType || "");
  const [starred, setStarred] = useState(activeFilters.starred ? "true" : "");
  const [minSizeMb, setMinSizeMb] = useState("");
  const [maxSizeMb, setMaxSizeMb] = useState("");
  const [createdFrom, setCreatedFrom] = useState(activeFilters.createdFrom || "");
  const [createdTo, setCreatedTo] = useState(activeFilters.createdTo || "");

  // Debounce search term input (300ms)
  useEffect(() => {
    const timer = setTimeout(() => {
      onSearchChange(searchTerm.trim());
    }, 300);
    return () => clearTimeout(timer);
  }, [searchTerm]);

  const handleApplyFilters = (e) => {
    e.preventDefault();
    setIsFilterOpen(false);

    const minSize = minSizeMb ? parseFloat(minSizeMb) * 1024 * 1024 : null;
    const maxSize = maxSizeMb ? parseFloat(maxSizeMb) * 1024 * 1024 : null;

    onFilterChange({
      mimeType,
      starred: starred === "true" ? true : null,
      minSize,
      maxSize,
      createdFrom,
      createdTo,
    });
  };

  const handleClearFilters = () => {
    setSearchTerm("");
    setMimeType("");
    setStarred("");
    setMinSizeMb("");
    setMaxSizeMb("");
    setCreatedFrom("");
    setCreatedTo("");
    setIsFilterOpen(false);
    onFilterChange({});
  };

  const hasActiveFilters =
    mimeType || starred || minSizeMb || maxSizeMb || createdFrom || createdTo;

  return (
    <div style={styles.container}>
      {/* Search Input Bar */}
      <div style={styles.searchWrapper}>
        <svg style={styles.searchIcon} fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
        </svg>
        <input
          type="text"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          placeholder="Search files by name..."
          style={styles.searchInput}
        />
        {searchTerm && (
          <button onClick={() => setSearchTerm("")} style={styles.clearSearchBtn}>
            &times;
          </button>
        )}
      </div>

      {/* Filter Popover Toggle Button */}
      <div style={styles.filterButtonWrapper}>
        <button
          onClick={() => setIsFilterOpen((prev) => !prev)}
          style={{
            ...styles.filterBtn,
            ...(hasActiveFilters ? styles.filterBtnActive : {}),
          }}
        >
          <svg style={styles.filterIcon} fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z" />
          </svg>
          Filters
          {hasActiveFilters && <span style={styles.filterBadge}>•</span>}
        </button>

        {/* Filter Popover Menu */}
        {isFilterOpen && (
          <div style={styles.popover}>
            <div style={styles.popoverHeader}>
              <h4 style={styles.popoverTitle}>Filter Files</h4>
              <button onClick={() => setIsFilterOpen(false)} style={styles.closePopoverBtn}>
                &times;
              </button>
            </div>

            <form onSubmit={handleApplyFilters} style={styles.filterForm}>
              {/* File Type Filter */}
              <div style={styles.formGroup}>
                <label style={styles.label}>File Type</label>
                <select
                  value={mimeType}
                  onChange={(e) => setMimeType(e.target.value)}
                  style={styles.select}
                >
                  <option value="">All Types</option>
                  <option value="pdf">PDF Documents</option>
                  <option value="image">Images (PNG, JPG, SVG)</option>
                  <option value="text">Text Documents</option>
                  <option value="wordprocessingml">Word Documents</option>
                  <option value="zip">Archives (ZIP, RAR)</option>
                  <option value="video">Video & Audio</option>
                </select>
              </div>

              {/* Starred Filter */}
              <div style={styles.formGroup}>
                <label style={styles.label}>Starred Status</label>
                <select
                  value={starred}
                  onChange={(e) => setStarred(e.target.value)}
                  style={styles.select}
                >
                  <option value="">All Files</option>
                  <option value="true">⭐ Starred Only</option>
                </select>
              </div>

              {/* Size Filter */}
              <div style={styles.formRow}>
                <div style={styles.formGroupHalf}>
                  <label style={styles.label}>Min Size (MB)</label>
                  <input
                    type="number"
                    step="0.1"
                    min="0"
                    value={minSizeMb}
                    onChange={(e) => setMinSizeMb(e.target.value)}
                    placeholder="e.g. 0.5"
                    style={styles.input}
                  />
                </div>
                <div style={styles.formGroupHalf}>
                  <label style={styles.label}>Max Size (MB)</label>
                  <input
                    type="number"
                    step="0.1"
                    min="0"
                    value={maxSizeMb}
                    onChange={(e) => setMaxSizeMb(e.target.value)}
                    placeholder="e.g. 10"
                    style={styles.input}
                  />
                </div>
              </div>

              {/* Date Range Filter */}
              <div style={styles.formRow}>
                <div style={styles.formGroupHalf}>
                  <label style={styles.label}>Created From</label>
                  <input
                    type="date"
                    value={createdFrom}
                    onChange={(e) => setCreatedFrom(e.target.value)}
                    style={styles.input}
                  />
                </div>
                <div style={styles.formGroupHalf}>
                  <label style={styles.label}>Created To</label>
                  <input
                    type="date"
                    value={createdTo}
                    onChange={(e) => setCreatedTo(e.target.value)}
                    style={styles.input}
                  />
                </div>
              </div>

              {/* Form Action Buttons */}
              <div style={styles.popoverFooter}>
                <button
                  type="button"
                  onClick={handleClearFilters}
                  style={styles.clearBtn}
                >
                  Reset
                </button>
                <button type="submit" style={styles.applyBtn}>
                  Apply Filters
                </button>
              </div>
            </form>
          </div>
        )}
      </div>
    </div>
  );
};

const styles = {
  container: {
    display: "flex",
    alignItems: "center",
    gap: "12px",
    flex: 1,
    maxWidth: "540px",
  },
  searchWrapper: {
    position: "relative",
    display: "flex",
    alignItems: "center",
    flex: 1,
  },
  searchIcon: {
    position: "absolute",
    left: "12px",
    width: "18px",
    height: "18px",
    color: "#9ca3af",
  },
  searchInput: {
    width: "100%",
    padding: "9px 36px 9px 38px",
    fontSize: "14px",
    border: "1px solid #d1d5db",
    borderRadius: "8px",
    outline: "none",
    backgroundColor: "#f9fafb",
    boxSizing: "border-box",
  },
  clearSearchBtn: {
    position: "absolute",
    right: "10px",
    background: "none",
    border: "none",
    fontSize: "18px",
    color: "#9ca3af",
    cursor: "pointer",
  },
  filterButtonWrapper: {
    position: "relative",
  },
  filterBtn: {
    display: "inline-flex",
    alignItems: "center",
    gap: "6px",
    padding: "9px 14px",
    fontSize: "13px",
    fontWeight: "600",
    color: "#374151",
    backgroundColor: "#ffffff",
    border: "1px solid #d1d5db",
    borderRadius: "8px",
    cursor: "pointer",
  },
  filterBtnActive: {
    color: "#2563eb",
    borderColor: "#2563eb",
    backgroundColor: "#eff6ff",
  },
  filterIcon: {
    width: "16px",
    height: "16px",
  },
  filterBadge: {
    color: "#2563eb",
    fontSize: "16px",
    lineHeight: 1,
  },
  popover: {
    position: "absolute",
    right: 0,
    top: "44px",
    width: "320px",
    backgroundColor: "#ffffff",
    borderRadius: "10px",
    boxShadow: "0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)",
    border: "1px solid #e5e7eb",
    zIndex: 100,
    padding: "16px",
  },
  popoverHeader: {
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: "12px",
    paddingBottom: "8px",
    borderBottom: "1px solid #f3f4f6",
  },
  popoverTitle: {
    margin: 0,
    fontSize: "15px",
    fontWeight: "700",
    color: "#111827",
  },
  closePopoverBtn: {
    background: "none",
    border: "none",
    fontSize: "18px",
    color: "#9ca3af",
    cursor: "pointer",
  },
  filterForm: {
    display: "flex",
    flexDirection: "column",
    gap: "12px",
  },
  formGroup: {
    display: "flex",
    flexDirection: "column",
    gap: "4px",
  },
  formRow: {
    display: "flex",
    gap: "10px",
  },
  formGroupHalf: {
    flex: 1,
    display: "flex",
    flexDirection: "column",
    gap: "4px",
  },
  label: {
    fontSize: "12px",
    fontWeight: "600",
    color: "#374151",
  },
  input: {
    width: "100%",
    padding: "7px 10px",
    fontSize: "13px",
    border: "1px solid #d1d5db",
    borderRadius: "6px",
    outline: "none",
    boxSizing: "border-box",
  },
  select: {
    width: "100%",
    padding: "7px 10px",
    fontSize: "13px",
    border: "1px solid #d1d5db",
    borderRadius: "6px",
    backgroundColor: "#ffffff",
    outline: "none",
    boxSizing: "border-box",
  },
  popoverFooter: {
    display: "flex",
    justifyContent: "space-between",
    marginTop: "8px",
    paddingTop: "10px",
    borderTop: "1px solid #f3f4f6",
  },
  clearBtn: {
    padding: "6px 12px",
    fontSize: "12px",
    fontWeight: "500",
    color: "#6b7280",
    backgroundColor: "transparent",
    border: "none",
    cursor: "pointer",
  },
  applyBtn: {
    padding: "7px 14px",
    fontSize: "12px",
    fontWeight: "600",
    color: "#ffffff",
    backgroundColor: "#2563eb",
    border: "none",
    borderRadius: "6px",
    cursor: "pointer",
  },
};

export default SearchFilterBar;

