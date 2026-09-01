import React, { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { createShare, getFileShares, removeShare } from "../services/shareService";
import {
  createPublicLink,
  getFilePublicLinks,
  revokePublicLink,
} from "../services/publicLinkService";

const ShareModal = ({ isOpen, file, onClose }) => {
  const [activeTab, setActiveTab] = useState("user-share"); // 'user-share' | 'public-link'

  // User Share Form State
  const [email, setEmail] = useState("");
  const [role, setRole] = useState("VIEWER");

  // Public Link Form State
  const [expirationDays, setExpirationDays] = useState("0"); // 0 = Never
  const [linkPassword, setLinkPassword] = useState("");
  const [copiedLinkId, setCopiedLinkId] = useState(null);

  const [errorMessage, setErrorMessage] = useState("");
  const [successMessage, setSuccessMessage] = useState("");

  const queryClient = useQueryClient();

  // Fetch active shares for this file
  const { data: shares = [], isLoading: isLoadingShares } = useQuery({
    queryKey: ["fileShares", file?.id],
    queryFn: () => (file?.id ? getFileShares(file.id) : Promise.resolve([])),
    enabled: !!isOpen && !!file?.id && activeTab === "user-share",
  });

  // Fetch public links for this file
  const { data: publicLinks = [], isLoading: isLoadingPublicLinks } = useQuery({
    queryKey: ["publicLinks", file?.id],
    queryFn: () => (file?.id ? getFilePublicLinks(file.id) : Promise.resolve([])),
    enabled: !!isOpen && !!file?.id && activeTab === "public-link",
  });

  // Share Creation Mutation
  const createShareMutation = useMutation({
    mutationFn: (data) => createShare(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["fileShares", file?.id] });
      setEmail("");
      setErrorMessage("");
      setSuccessMessage("File shared successfully!");
      setTimeout(() => setSuccessMessage(""), 3000);
    },
    onError: (err) => {
      setSuccessMessage("");
      setErrorMessage(err.response?.data?.message || "Failed to share file");
    },
  });

  // Remove Share Mutation
  const removeShareMutation = useMutation({
    mutationFn: (shareId) => removeShare(shareId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["fileShares", file?.id] });
      setErrorMessage("");
      setSuccessMessage("Share revoked successfully!");
      setTimeout(() => setSuccessMessage(""), 3000);
    },
    onError: (err) => {
      setErrorMessage(err.response?.data?.message || "Failed to revoke share");
    },
  });

  // Create Public Link Mutation
  const createLinkMutation = useMutation({
    mutationFn: (data) => createPublicLink(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["publicLinks", file?.id] });
      setLinkPassword("");
      setErrorMessage("");
      setSuccessMessage("Public share link created!");
      setTimeout(() => setSuccessMessage(""), 3000);
    },
    onError: (err) => {
      setSuccessMessage("");
      setErrorMessage(err.response?.data?.message || "Failed to create public link");
    },
  });

  // Revoke Public Link Mutation
  const revokeLinkMutation = useMutation({
    mutationFn: (linkId) => revokePublicLink(linkId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["publicLinks", file?.id] });
      setErrorMessage("");
      setSuccessMessage("Public link revoked!");
      setTimeout(() => setSuccessMessage(""), 3000);
    },
    onError: (err) => {
      setErrorMessage(err.response?.data?.message || "Failed to revoke public link");
    },
  });

  if (!isOpen || !file) return null;

  const handleUserShareSubmit = (e) => {
    e.preventDefault();
    if (!email.trim()) return;
    setErrorMessage("");
    setSuccessMessage("");
    createShareMutation.mutate({
      fileId: file.id,
      email: email.trim(),
      role: role,
    });
  };

  const handlePublicLinkSubmit = (e) => {
    e.preventDefault();
    setErrorMessage("");
    setSuccessMessage("");

    let expiresAt = null;
    const days = parseInt(expirationDays, 10);
    if (days > 0) {
      const date = new Date();
      date.setDate(date.getDate() + days);
      expiresAt = date.toISOString().slice(0, 19);
    }

    createLinkMutation.mutate({
      fileId: file.id,
      expiresAt: expiresAt,
      password: linkPassword.trim() || null,
    });
  };

  const handleCopyLink = (url, linkId) => {
    navigator.clipboard.writeText(url);
    setCopiedLinkId(linkId);
    setTimeout(() => setCopiedLinkId(null), 2000);
  };

  const handleClose = () => {
    setEmail("");
    setRole("VIEWER");
    setLinkPassword("");
    setExpirationDays("0");
    setErrorMessage("");
    setSuccessMessage("");
    onClose();
  };

  return (
    <div style={styles.overlay}>
      <div style={styles.modal}>
        <div style={styles.header}>
          <h3 style={styles.title}>Share "{file.filename}"</h3>
          <button onClick={handleClose} style={styles.closeButton}>
            &times;
          </button>
        </div>

        {/* Modal Tab Controls */}
        <div style={styles.tabsHeader}>
          <button
            onClick={() => {
              setActiveTab("user-share");
              setErrorMessage("");
              setSuccessMessage("");
            }}
            style={{
              ...styles.tabBtn,
              ...(activeTab === "user-share" ? styles.tabBtnActive : {}),
            }}
          >
            User Sharing
          </button>

          <button
            onClick={() => {
              setActiveTab("public-link");
              setErrorMessage("");
              setSuccessMessage("");
            }}
            style={{
              ...styles.tabBtn,
              ...(activeTab === "public-link" ? styles.tabBtnActive : {}),
            }}
          >
            Public Link
          </button>
        </div>

        <div style={styles.body}>
          {errorMessage && <div style={styles.errorAlert}>{errorMessage}</div>}
          {successMessage && <div style={styles.successAlert}>{successMessage}</div>}

          {/* Tab 1: User Sharing */}
          {activeTab === "user-share" ? (
            <div>
              <form onSubmit={handleUserShareSubmit} style={styles.form}>
                <div style={styles.formGroup}>
                  <label style={styles.label}>User Email</label>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="user@example.com"
                    required
                    style={styles.input}
                    disabled={createShareMutation.isPending}
                  />
                </div>

                <div style={styles.formGroup}>
                  <label style={styles.label}>Permission Role</label>
                  <div style={styles.radioGroup}>
                    <label style={styles.radioLabel}>
                      <input
                        type="radio"
                        name="shareRole"
                        value="VIEWER"
                        checked={role === "VIEWER"}
                        onChange={(e) => setRole(e.target.value)}
                      />
                      <span style={styles.radioText}>Viewer (Read & Download)</span>
                    </label>
                    <label style={styles.radioLabel}>
                      <input
                        type="radio"
                        name="shareRole"
                        value="EDITOR"
                        checked={role === "EDITOR"}
                        onChange={(e) => setRole(e.target.value)}
                      />
                      <span style={styles.radioText}>Editor (Read, Download, Modify & Delete)</span>
                    </label>
                  </div>
                </div>

                <button
                  type="submit"
                  style={styles.shareButton}
                  disabled={createShareMutation.isPending || !email.trim()}
                >
                  {createShareMutation.isPending ? "Sharing..." : "Share Access"}
                </button>
              </form>

              {/* Active Shares List */}
              <div style={styles.sharesSection}>
                <h4 style={styles.sharesTitle}>People with access</h4>
                {isLoadingShares ? (
                  <p style={styles.loadingText}>Loading shares...</p>
                ) : shares.length === 0 ? (
                  <p style={styles.emptyText}>Not shared with anyone yet.</p>
                ) : (
                  <div style={styles.sharesList}>
                    {shares.map((share) => (
                      <div key={share.id} style={styles.shareItem}>
                        <div style={styles.shareInfo}>
                          <span style={styles.shareEmail}>{share.userEmail}</span>
                          <span
                            style={{
                              ...styles.roleBadge,
                              ...(share.role === "EDITOR" ? styles.editorBadge : styles.viewerBadge),
                            }}
                          >
                            {share.role}
                          </span>
                        </div>

                        <button
                          onClick={() => removeShareMutation.mutate(share.id)}
                          style={styles.revokeButton}
                          disabled={removeShareMutation.isPending}
                        >
                          Revoke
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          ) : (
            /* Tab 2: Public Share Links */
            <div>
              <form onSubmit={handlePublicLinkSubmit} style={styles.form}>
                <div style={styles.formGroup}>
                  <label style={styles.label}>Link Expiration</label>
                  <select
                    value={expirationDays}
                    onChange={(e) => setExpirationDays(e.target.value)}
                    style={styles.select}
                  >
                    <option value="0">Never</option>
                    <option value="1">1 Day</option>
                    <option value="7">7 Days</option>
                    <option value="30">30 Days</option>
                  </select>
                </div>

                <div style={styles.formGroup}>
                  <label style={styles.label}>Password Protection (Optional)</label>
                  <input
                    type="password"
                    value={linkPassword}
                    onChange={(e) => setLinkPassword(e.target.value)}
                    placeholder="Leave empty for open link"
                    style={styles.input}
                    disabled={createLinkMutation.isPending}
                  />
                </div>

                <button
                  type="submit"
                  style={styles.shareButton}
                  disabled={createLinkMutation.isPending}
                >
                  {createLinkMutation.isPending ? "Generating..." : "Generate Public Link"}
                </button>
              </form>

              {/* Active Public Links List */}
              <div style={styles.sharesSection}>
                <h4 style={styles.sharesTitle}>Active Public Links</h4>
                {isLoadingPublicLinks ? (
                  <p style={styles.loadingText}>Loading public links...</p>
                ) : publicLinks.filter((l) => l.active).length === 0 ? (
                  <p style={styles.emptyText}>No active public share links.</p>
                ) : (
                  <div style={styles.sharesList}>
                    {publicLinks
                      .filter((link) => link.active)
                      .map((link) => (
                        <div key={link.id} style={styles.linkCard}>
                          <div style={styles.linkHeader}>
                            <input
                              type="text"
                              readOnly
                              value={link.publicUrl}
                              style={styles.linkUrlInput}
                            />
                            <button
                              onClick={() => handleCopyLink(link.publicUrl, link.id)}
                              style={styles.copyButton}
                            >
                              {copiedLinkId === link.id ? "Copied!" : "Copy"}
                            </button>
                          </div>

                          <div style={styles.linkMetaRow}>
                            <div style={styles.metaBadges}>
                              {link.isPasswordProtected && (
                                <span style={styles.pwdBadge}>🔒 Password Protected</span>
                              )}
                              <span style={styles.expireBadge}>
                                {link.expiresAt
                                  ? `Expires: ${new Date(link.expiresAt).toLocaleDateString()}`
                                  : "Never expires"}
                              </span>
                            </div>

                            <button
                              onClick={() => revokeLinkMutation.mutate(link.id)}
                              style={styles.revokeButton}
                              disabled={revokeLinkMutation.isPending}
                            >
                              Revoke
                            </button>
                          </div>
                        </div>
                      ))}
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

        <div style={styles.footer}>
          <button type="button" onClick={handleClose} style={styles.closeModalButton}>
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
  tabsHeader: {
    display: "flex",
    borderBottom: "1px solid #e5e7eb",
    backgroundColor: "#f9fafb",
  },
  tabBtn: {
    flex: 1,
    padding: "10px",
    fontSize: "14px",
    fontWeight: "600",
    color: "#6b7280",
    backgroundColor: "transparent",
    border: "none",
    borderBottom: "2px solid transparent",
    cursor: "pointer",
  },
  tabBtnActive: {
    color: "#2563eb",
    backgroundColor: "#ffffff",
    borderBottomColor: "#2563eb",
  },
  body: {
    padding: "20px",
    maxHeight: "75vh",
    overflowY: "auto",
  },
  form: {
    marginBottom: "20px",
  },
  formGroup: {
    marginBottom: "14px",
  },
  label: {
    display: "block",
    fontSize: "13px",
    fontWeight: "600",
    color: "#374151",
    marginBottom: "6px",
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
  select: {
    width: "100%",
    padding: "10px 12px",
    fontSize: "14px",
    border: "1px solid #d1d5db",
    borderRadius: "6px",
    backgroundColor: "#ffffff",
    outline: "none",
    boxSizing: "border-box",
  },
  radioGroup: {
    display: "flex",
    flexDirection: "column",
    gap: "8px",
  },
  radioLabel: {
    display: "flex",
    alignItems: "center",
    gap: "8px",
    cursor: "pointer",
    fontSize: "13px",
    color: "#374151",
  },
  radioText: {
    fontSize: "13px",
  },
  shareButton: {
    width: "100%",
    padding: "10px",
    fontSize: "14px",
    fontWeight: "600",
    color: "#ffffff",
    backgroundColor: "#2563eb",
    border: "none",
    borderRadius: "6px",
    cursor: "pointer",
    marginTop: "8px",
  },
  sharesSection: {
    borderTop: "1px solid #f3f4f6",
    paddingTop: "16px",
  },
  sharesTitle: {
    margin: "0 0 12px 0",
    fontSize: "14px",
    fontWeight: "600",
    color: "#374151",
  },
  sharesList: {
    display: "flex",
    flexDirection: "column",
    gap: "10px",
  },
  shareItem: {
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    padding: "8px 12px",
    backgroundColor: "#f9fafb",
    borderRadius: "6px",
    border: "1px solid #f3f4f6",
  },
  shareInfo: {
    display: "flex",
    alignItems: "center",
    gap: "8px",
  },
  shareEmail: {
    fontSize: "13px",
    fontWeight: "500",
    color: "#1f2937",
  },
  roleBadge: {
    fontSize: "11px",
    fontWeight: "700",
    padding: "2px 6px",
    borderRadius: "4px",
    textTransform: "uppercase",
  },
  viewerBadge: {
    backgroundColor: "#eff6ff",
    color: "#2563eb",
  },
  editorBadge: {
    backgroundColor: "#fef3c7",
    color: "#d97706",
  },
  linkCard: {
    display: "flex",
    flexDirection: "column",
    gap: "8px",
    padding: "10px 12px",
    backgroundColor: "#f9fafb",
    borderRadius: "6px",
    border: "1px solid #e5e7eb",
  },
  linkHeader: {
    display: "flex",
    gap: "8px",
  },
  linkUrlInput: {
    flex: 1,
    fontSize: "12px",
    fontFamily: "monospace",
    padding: "6px 8px",
    border: "1px solid #d1d5db",
    borderRadius: "4px",
    backgroundColor: "#ffffff",
  },
  copyButton: {
    padding: "6px 12px",
    fontSize: "12px",
    fontWeight: "600",
    color: "#2563eb",
    backgroundColor: "#eff6ff",
    border: "1px solid #bfdbfe",
    borderRadius: "4px",
    cursor: "pointer",
  },
  linkMetaRow: {
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
  },
  metaBadges: {
    display: "flex",
    alignItems: "center",
    gap: "8px",
  },
  pwdBadge: {
    fontSize: "11px",
    color: "#92400e",
    backgroundColor: "#fef3c7",
    padding: "2px 6px",
    borderRadius: "4px",
    fontWeight: "600",
  },
  expireBadge: {
    fontSize: "11px",
    color: "#6b7280",
  },
  revokeButton: {
    background: "none",
    border: "none",
    color: "#dc2626",
    fontSize: "12px",
    fontWeight: "600",
    cursor: "pointer",
  },
  errorAlert: {
    marginBottom: "14px",
    padding: "8px 12px",
    backgroundColor: "#fef2f2",
    color: "#991b1b",
    fontSize: "13px",
    borderRadius: "6px",
    border: "1px solid #fecaca",
  },
  successAlert: {
    marginBottom: "14px",
    padding: "8px 12px",
    backgroundColor: "#ecfdf5",
    color: "#065f46",
    fontSize: "13px",
    borderRadius: "6px",
    border: "1px solid #a7f3d0",
  },
  loadingText: {
    fontSize: "13px",
    color: "#6b7280",
  },
  emptyText: {
    fontSize: "13px",
    color: "#9ca3af",
    fontStyle: "italic",
  },
  footer: {
    display: "flex",
    justifyContent: "flex-end",
    padding: "12px 20px",
    backgroundColor: "#f9fafb",
    borderTop: "1px solid #f3f4f6",
  },
  closeModalButton: {
    padding: "8px 16px",
    fontSize: "14px",
    fontWeight: "500",
    color: "#4b5563",
    backgroundColor: "#ffffff",
    border: "1px solid #d1d5db",
    borderRadius: "6px",
    cursor: "pointer",
  },
};

export default ShareModal;
