import React, { useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useAuth } from "../context/AuthContext";
import {
  getFolders,
  createFolder,
  renameFolder,
  deleteFolder,
  getBreadcrumbs,
} from "../services/folderService";
import {
  getFolderFiles,
  uploadFile,
  getDownloadUrl,
  deleteFile,
} from "../services/fileService";

import Breadcrumbs from "../components/Breadcrumbs";
import FolderCard from "../components/FolderCard";
import FileCard from "../components/FileCard";
import FileListView from "../components/FileListView";
import CreateFolderModal from "../components/CreateFolderModal";
import RenameFolderModal from "../components/RenameFolderModal";
import DeleteFolderModal from "../components/DeleteFolderModal";
import FileUploadModal from "../components/FileUploadModal";
import DeleteFileModal from "../components/DeleteFileModal";

const DashboardPage = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const queryClient = useQueryClient();

  const currentFolderId = searchParams.get("folderId") || null;

  // View Mode: 'grid' or 'list'
  const [viewMode, setViewMode] = useState("grid");

  // Modal States - Folder
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [createError, setCreateError] = useState("");

  const [renameTargetFolder, setRenameTargetFolder] = useState(null);
  const [renameError, setRenameError] = useState("");

  const [deleteTargetFolder, setDeleteTargetFolder] = useState(null);
  const [deleteError, setDeleteError] = useState("");

  // Modal States - File
  const [isUploadOpen, setIsUploadOpen] = useState(false);
  const [uploadError, setUploadError] = useState("");

  const [deleteTargetFile, setDeleteTargetFile] = useState(null);
  const [deleteFileError, setDeleteFileError] = useState("");

  // React Query - Folders List
  const {
    data: folders = [],
    isLoading: isLoadingFolders,
    isError: isErrorFolders,
    error: foldersError,
  } = useQuery({
    queryKey: ["folders", currentFolderId],
    queryFn: () => getFolders(currentFolderId),
  });

  // React Query - Files List (non-deleted files)
  const {
    data: files = [],
    isLoading: isLoadingFiles,
    isError: isErrorFiles,
    error: filesError,
  } = useQuery({
    queryKey: ["files", currentFolderId],
    queryFn: () => getFolderFiles(currentFolderId),
  });

  // React Query - Breadcrumbs Hierarchy
  const { data: breadcrumbs = [] } = useQuery({
    queryKey: ["breadcrumbs", currentFolderId],
    queryFn: () => (currentFolderId ? getBreadcrumbs(currentFolderId) : Promise.resolve([])),
    enabled: !!currentFolderId,
  });

  // Folder Mutations
  const createFolderMutation = useMutation({
    mutationFn: (name) => createFolder({ name, parentId: currentFolderId }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["folders", currentFolderId] });
      setIsCreateOpen(false);
      setCreateError("");
    },
    onError: (err) => {
      setCreateError(err.response?.data?.message || "Failed to create folder");
    },
  });

  const renameFolderMutation = useMutation({
    mutationFn: ({ id, name }) => renameFolder(id, { name }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["folders", currentFolderId] });
      queryClient.invalidateQueries({ queryKey: ["breadcrumbs"] });
      setRenameTargetFolder(null);
      setRenameError("");
    },
    onError: (err) => {
      setRenameError(err.response?.data?.message || "Failed to rename folder");
    },
  });

  const deleteFolderMutation = useMutation({
    mutationFn: (folderId) => deleteFolder(folderId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["folders", currentFolderId] });
      queryClient.invalidateQueries({ queryKey: ["breadcrumbs"] });
      setDeleteTargetFolder(null);
      setDeleteError("");
    },
    onError: (err) => {
      setDeleteError(err.response?.data?.message || "Failed to delete folder");
    },
  });

  // File Mutations
  const uploadFileMutation = useMutation({
    mutationFn: ({ file, onProgress }) => uploadFile(file, currentFolderId, onProgress),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["files", currentFolderId] });
      setIsUploadOpen(false);
      setUploadError("");
    },
    onError: (err) => {
      setUploadError(err.response?.data?.message || "Failed to upload file");
    },
  });

  const deleteFileMutation = useMutation({
    mutationFn: (fileId) => deleteFile(fileId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["files", currentFolderId] });
      setDeleteTargetFile(null);
      setDeleteFileError("");
    },
    onError: (err) => {
      setDeleteFileError(err.response?.data?.message || "Failed to delete file");
    },
  });

  // Secure File Download Handler
  const handleDownloadFile = async (file) => {
    try {
      const response = await getDownloadUrl(file.id);
      if (response && response.downloadUrl) {
        let finalUrl = response.downloadUrl;
        const token = sessionStorage.getItem("auth_token");
        if (token && finalUrl.includes("localhost:8080") && !finalUrl.includes("token=")) {
          finalUrl += (finalUrl.includes("?") ? "&" : "?") + "token=" + encodeURIComponent(token);
        }

        const link = document.createElement("a");
        link.href = finalUrl;
        link.download = file.filename;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
      }
    } catch (err) {
      alert(err.response?.data?.message || "Failed to generate download URL");
    }
  };

  // Navigation Handler
  const handleNavigateFolder = (folderId) => {
    if (folderId) {
      setSearchParams({ folderId });
    } else {
      setSearchParams({});
    }
  };

  const handleOpenFolder = (folder) => {
    handleNavigateFolder(folder.id);
  };

  const handleLogout = () => {
    logout();
    navigate("/login", { replace: true });
  };

  const isLoading = isLoadingFolders || isLoadingFiles;
  const isError = isErrorFolders || isErrorFiles;
  const errorMessage = foldersError?.response?.data?.message || filesError?.response?.data?.message;

  return (
    <div style={styles.container}>
      {/* Top Header */}
      <header style={styles.header}>
        <div style={styles.logoSection}>
          <svg style={styles.logoIcon} viewBox="0 0 24 24" fill="#2563eb">
            <path d="M19.35 10.04C18.67 6.59 15.64 4 12 4 9.11 4 6.6 5.64 5.35 8.04 2.34 8.36 0 10.91 0 14c0 3.31 2.69 6 6 6h13c2.76 0 5-2.24 5-5 0-2.64-2.05-4.78-4.65-4.96zM19 18H6c-2.21 0-4-1.79-4-4 0-2.05 1.53-3.76 3.56-3.97l1.07-.11.5-.95C8.08 7.14 9.94 6 12 6c2.62 0 4.88 1.86 5.39 4.43l.3 1.5 1.53.11c1.56.1 2.78 1.41 2.78 2.96 0 1.65-1.35 3-3 3z" />
          </svg>
          <h1 style={styles.appTitle}>Cloud Meta Storage</h1>
        </div>

        <div style={styles.userSection}>
          <div style={styles.userInfo}>
            <span style={styles.userName}>{user?.name}</span>
            <span style={styles.userRole}>{user?.role}</span>
          </div>
          <button onClick={handleLogout} style={styles.logoutButton}>
            Logout
          </button>
        </div>
      </header>

      {/* Main Content Area */}
      <main style={styles.main}>
        {/* Drive Action Bar */}
        <div style={styles.actionBar}>
          <div style={styles.actionButtonGroup}>
            <button
              onClick={() => {
                setCreateError("");
                setIsCreateOpen(true);
              }}
              style={styles.newFolderButton}
            >
              <svg style={styles.buttonIcon} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4" />
              </svg>
              New Folder
            </button>

            <button
              onClick={() => {
                setUploadError("");
                setIsUploadOpen(true);
              }}
              style={styles.uploadFileButton}
            >
              <svg style={styles.buttonIcon} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
              </svg>
              Upload File
            </button>
          </div>

          {/* Grid / List View Toggle */}
          <div style={styles.viewToggleGroup}>
            <button
              onClick={() => setViewMode("grid")}
              style={{
                ...styles.viewToggleButton,
                ...(viewMode === "grid" ? styles.viewToggleActive : {}),
              }}
              title="Grid View"
            >
              <svg style={styles.toggleIcon} fill="currentColor" viewBox="0 0 24 24">
                <path d="M4 4h4v4H4V4zm6 0h4v4h-4V4zm6 0h4v4h-4V4zM4 10h4v4H4v-4zm6 0h4v4h-4v-4zm6 0h4v4h-4v-4zM4 16h4v4H4v-4zm6 0h4v4h-4v-4zm6 0h4v4h-4v-4z" />
              </svg>
              Grid
            </button>
            <button
              onClick={() => setViewMode("list")}
              style={{
                ...styles.viewToggleButton,
                ...(viewMode === "list" ? styles.viewToggleActive : {}),
              }}
              title="List View"
            >
              <svg style={styles.toggleIcon} fill="currentColor" viewBox="0 0 24 24">
                <path d="M4 14h16v-2H4v2zm0 5h16v-2H4v2zM4 5v2h16V5H4z" />
              </svg>
              List
            </button>
          </div>
        </div>

        {/* Breadcrumb Navigation */}
        <Breadcrumbs breadcrumbs={breadcrumbs} onNavigate={handleNavigateFolder} />

        {/* Folder & File Content Grid / List / States */}
        {isLoading ? (
          <div style={styles.loadingContainer}>
            <div style={styles.spinner}></div>
            <p style={styles.loadingText}>Loading directory contents...</p>
          </div>
        ) : isError ? (
          <div style={styles.errorContainer}>
            <p style={styles.errorText}>
              {errorMessage || "Failed to load directory contents."}
            </p>
            <button
              onClick={() => handleNavigateFolder(null)}
              style={styles.returnHomeButton}
            >
              Return to My Drive
            </button>
          </div>
        ) : folders.length === 0 && files.length === 0 ? (
          <div style={styles.emptyContainer}>
            <svg style={styles.emptyIcon} fill="none" stroke="#9ca3af" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-6l-2-2H5a2 2 0 00-2 2z" />
            </svg>
            <h3 style={styles.emptyTitle}>This folder is empty</h3>
            <p style={styles.emptyText}>Create a new folder or upload a file to get started.</p>
          </div>
        ) : viewMode === "list" ? (
          <FileListView
            folders={folders}
            files={files}
            onOpenFolder={handleOpenFolder}
            onRenameFolder={(f) => {
              setRenameError("");
              setRenameTargetFolder(f);
            }}
            onDeleteFolder={(f) => {
              setDeleteError("");
              setDeleteTargetFolder(f);
            }}
            onDownloadFile={handleDownloadFile}
            onDeleteFile={(f) => {
              setDeleteFileError("");
              setDeleteTargetFile(f);
            }}
          />
        ) : (
          <div>
            {/* Folders Section */}
            {folders.length > 0 && (
              <div style={styles.section}>
                <h2 style={styles.sectionTitle}>Folders ({folders.length})</h2>
                <div style={styles.grid}>
                  {folders.map((folder) => (
                    <FolderCard
                      key={folder.id}
                      folder={folder}
                      onOpen={handleOpenFolder}
                      onRename={(f) => {
                        setRenameError("");
                        setRenameTargetFolder(f);
                      }}
                      onDelete={(f) => {
                        setDeleteError("");
                        setDeleteTargetFolder(f);
                      }}
                    />
                  ))}
                </div>
              </div>
            )}

            {/* Files Section */}
            {files.length > 0 && (
              <div style={styles.section}>
                <h2 style={styles.sectionTitle}>Files ({files.length})</h2>
                <div style={styles.grid}>
                  {files.map((file) => (
                    <FileCard
                      key={file.id}
                      file={file}
                      onDownload={handleDownloadFile}
                      onDelete={(f) => {
                        setDeleteFileError("");
                        setDeleteTargetFile(f);
                      }}
                    />
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </main>

      {/* Folder Modals */}
      <CreateFolderModal
        isOpen={isCreateOpen}
        onClose={() => setIsCreateOpen(false)}
        onSubmit={(name) => createFolderMutation.mutate(name)}
        isLoading={createFolderMutation.isPending}
        errorMessage={createError}
      />

      <RenameFolderModal
        isOpen={!!renameTargetFolder}
        folder={renameTargetFolder}
        onClose={() => setRenameTargetFolder(null)}
        onSubmit={(name) =>
          renameFolderMutation.mutate({ id: renameTargetFolder.id, name })
        }
        isLoading={renameFolderMutation.isPending}
        errorMessage={renameError}
      />

      <DeleteFolderModal
        isOpen={!!deleteTargetFolder}
        folder={deleteTargetFolder}
        onClose={() => setDeleteTargetFolder(null)}
        onConfirm={(folderId) => deleteFolderMutation.mutate(folderId)}
        isLoading={deleteFolderMutation.isPending}
        errorMessage={deleteError}
      />

      {/* File Modals */}
      <FileUploadModal
        isOpen={isUploadOpen}
        onClose={() => setIsUploadOpen(false)}
        onUpload={(file, onProgress) =>
          uploadFileMutation.mutate({ file, onProgress })
        }
        isLoading={uploadFileMutation.isPending}
        errorMessage={uploadError}
      />

      <DeleteFileModal
        isOpen={!!deleteTargetFile}
        file={deleteTargetFile}
        onClose={() => setDeleteTargetFile(null)}
        onConfirm={(fileId) => deleteFileMutation.mutate(fileId)}
        isLoading={deleteFileMutation.isPending}
        errorMessage={deleteFileError}
      />
    </div>
  );
};

const styles = {
  container: {
    minHeight: "100vh",
    backgroundColor: "#f9fafb",
    fontFamily: "system-ui, -apple-system, sans-serif",
  },
  header: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    padding: "16px 32px",
    backgroundColor: "#ffffff",
    borderBottom: "1px solid #e5e7eb",
  },
  logoSection: {
    display: "flex",
    alignItems: "center",
    gap: "12px",
  },
  logoIcon: {
    width: "32px",
    height: "32px",
  },
  appTitle: {
    margin: 0,
    fontSize: "20px",
    fontWeight: "700",
    color: "#111827",
  },
  userSection: {
    display: "flex",
    alignItems: "center",
    gap: "16px",
  },
  userInfo: {
    display: "flex",
    flexDirection: "column",
    alignItems: "flex-end",
  },
  userName: {
    fontSize: "14px",
    fontWeight: "600",
    color: "#1f2937",
  },
  userRole: {
    fontSize: "11px",
    fontWeight: "600",
    color: "#2563eb",
    backgroundColor: "#eff6ff",
    padding: "2px 6px",
    borderRadius: "4px",
    marginTop: "2px",
    textTransform: "uppercase",
  },
  logoutButton: {
    padding: "8px 14px",
    fontSize: "13px",
    fontWeight: "500",
    color: "#dc2626",
    backgroundColor: "#fef2f2",
    border: "1px solid #fecaca",
    borderRadius: "6px",
    cursor: "pointer",
  },
  main: {
    padding: "24px 32px",
    maxWidth: "1200px",
    margin: "0 auto",
  },
  actionBar: {
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: "16px",
  },
  actionButtonGroup: {
    display: "flex",
    alignItems: "center",
    gap: "12px",
  },
  newFolderButton: {
    display: "inline-flex",
    alignItems: "center",
    gap: "8px",
    padding: "10px 18px",
    fontSize: "14px",
    fontWeight: "600",
    color: "#374151",
    backgroundColor: "#ffffff",
    border: "1px solid #d1d5db",
    borderRadius: "8px",
    cursor: "pointer",
    boxShadow: "0 1px 2px rgba(0,0,0,0.05)",
  },
  uploadFileButton: {
    display: "inline-flex",
    alignItems: "center",
    gap: "8px",
    padding: "10px 18px",
    fontSize: "14px",
    fontWeight: "600",
    color: "#ffffff",
    backgroundColor: "#2563eb",
    border: "none",
    borderRadius: "8px",
    cursor: "pointer",
    boxShadow: "0 1px 2px rgba(0,0,0,0.05)",
  },
  buttonIcon: {
    width: "18px",
    height: "18px",
  },
  viewToggleGroup: {
    display: "flex",
    alignItems: "center",
    backgroundColor: "#e5e7eb",
    padding: "2px",
    borderRadius: "6px",
  },
  viewToggleButton: {
    display: "inline-flex",
    alignItems: "center",
    gap: "6px",
    padding: "6px 12px",
    fontSize: "13px",
    fontWeight: "500",
    color: "#4b5563",
    backgroundColor: "transparent",
    border: "none",
    borderRadius: "4px",
    cursor: "pointer",
  },
  viewToggleActive: {
    backgroundColor: "#ffffff",
    color: "#111827",
    fontWeight: "600",
    boxShadow: "0 1px 2px rgba(0,0,0,0.05)",
  },
  toggleIcon: {
    width: "16px",
    height: "16px",
  },
  section: {
    marginBottom: "28px",
  },
  sectionTitle: {
    fontSize: "15px",
    fontWeight: "600",
    color: "#4b5563",
    margin: "0 0 12px 0",
  },
  grid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fill, minmax(220px, 1fr))",
    gap: "16px",
  },
  loadingContainer: {
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "center",
    padding: "64px 0",
  },
  spinner: {
    width: "36px",
    height: "36px",
    border: "3px solid #e5e7eb",
    borderTopColor: "#2563eb",
    borderRadius: "50%",
    animation: "spin 1s linear infinite",
  },
  loadingText: {
    marginTop: "16px",
    color: "#6b7280",
    fontSize: "14px",
  },
  errorContainer: {
    backgroundColor: "#fef2f2",
    border: "1px solid #fecaca",
    borderRadius: "8px",
    padding: "24px",
    textAlign: "center",
    marginTop: "16px",
  },
  errorText: {
    color: "#991b1b",
    fontSize: "14px",
    fontWeight: "500",
    marginBottom: "12px",
  },
  returnHomeButton: {
    padding: "8px 16px",
    fontSize: "13px",
    fontWeight: "600",
    color: "#2563eb",
    backgroundColor: "#ffffff",
    border: "1px solid #bfdbfe",
    borderRadius: "6px",
    cursor: "pointer",
  },
  emptyContainer: {
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "center",
    padding: "64px 24px",
    backgroundColor: "#ffffff",
    borderRadius: "8px",
    border: "1px stroke #e5e7eb",
    marginTop: "16px",
  },
  emptyIcon: {
    width: "48px",
    height: "48px",
    marginBottom: "12px",
  },
  emptyTitle: {
    margin: "0 0 4px 0",
    fontSize: "16px",
    fontWeight: "600",
    color: "#374151",
  },
  emptyText: {
    margin: 0,
    fontSize: "14px",
    color: "#6b7280",
  },
};

export default DashboardPage;
