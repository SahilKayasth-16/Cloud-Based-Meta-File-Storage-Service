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
  getSharedFiles,
  uploadFile,
  getDownloadUrl,
  deleteFile,
} from "../services/fileService";
import {
  starFile,
  unstarFile,
  getStarredFileIds,
} from "../services/starService";
import { searchFiles } from "../services/searchService";

import Breadcrumbs from "../components/Breadcrumbs";
import FolderCard from "../components/FolderCard";
import FileCard from "../components/FileCard";
import FileListView from "../components/FileListView";
import CreateFolderModal from "../components/CreateFolderModal";
import RenameFolderModal from "../components/RenameFolderModal";
import DeleteFolderModal from "../components/DeleteFolderModal";
import FileUploadModal from "../components/FileUploadModal";
import DeleteFileModal from "../components/DeleteFileModal";
import ShareModal from "../components/ShareModal";
import FileDetailsModal from "../components/FileDetailsModal";
import SearchFilterBar from "../components/SearchFilterBar";
import { useToast } from "../context/ToastContext";

const DashboardPage = () => {
  const { user, logout } = useAuth();
  const { showToast } = useToast();
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const queryClient = useQueryClient();

  const currentFolderId = searchParams.get("folderId") || null;

  // Active Tab: 'my-drive' or 'shared-with-me'
  const [activeTab, setActiveTab] = useState("my-drive");

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

  const [shareTargetFile, setShareTargetFile] = useState(null);
  const [detailsTargetFile, setDetailsTargetFile] = useState(null);

  // Search & Filter State
  const [searchFilters, setSearchFilters] = useState({
    q: "",
    mimeType: "",
    starred: null,
    minSize: null,
    maxSize: null,
    createdFrom: "",
    createdTo: "",
  });
  const [searchPage, setSearchPage] = useState(0);

  const isSearchActive =
    !!searchFilters.q ||
    !!searchFilters.mimeType ||
    searchFilters.starred !== null ||
    searchFilters.minSize !== null ||
    searchFilters.maxSize !== null ||
    !!searchFilters.createdFrom ||
    !!searchFilters.createdTo;

  // React Query - File Search (Server-Side)
  const {
    data: searchData,
    isLoading: isLoadingSearch,
    isError: isErrorSearch,
    error: searchError,
  } = useQuery({
    queryKey: ["fileSearch", searchFilters, searchPage],
    queryFn: () => searchFiles({ ...searchFilters, page: searchPage, size: 20 }),
    enabled: isSearchActive,
  });

  // React Query - Starred File IDs
  const { data: starredFileIds = [] } = useQuery({
    queryKey: ["starredFileIds"],
    queryFn: getStarredFileIds,
  });

  const toggleStarMutation = useMutation({
    mutationFn: (file) => {
      const isStarred = starredFileIds.includes(file.id);
      return isStarred ? unstarFile(file.id) : starFile(file.id);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["starredFileIds"] });
      queryClient.invalidateQueries({ queryKey: ["starredFiles"] });
    },
  });

  // React Query - Folders List (My Drive)
  const {
    data: folders = [],
    isLoading: isLoadingFolders,
    isError: isErrorFolders,
    error: foldersError,
  } = useQuery({
    queryKey: ["folders", currentFolderId],
    queryFn: () => getFolders(currentFolderId),
    enabled: activeTab === "my-drive",
  });

  // React Query - Files List (My Drive)
  const {
    data: files = [],
    isLoading: isLoadingFiles,
    isError: isErrorFiles,
    error: filesError,
  } = useQuery({
    queryKey: ["files", currentFolderId],
    queryFn: () => getFolderFiles(currentFolderId),
    enabled: activeTab === "my-drive",
  });

  // React Query - Shared Files List (Shared with Me)
  const {
    data: sharedFiles = [],
    isLoading: isLoadingSharedFiles,
    isError: isErrorSharedFiles,
    error: sharedFilesError,
  } = useQuery({
    queryKey: ["sharedFiles"],
    queryFn: () => getSharedFiles(),
    enabled: activeTab === "shared-with-me",
  });

  // React Query - Breadcrumbs Hierarchy
  const { data: breadcrumbs = [] } = useQuery({
    queryKey: ["breadcrumbs", currentFolderId],
    queryFn: () => (currentFolderId ? getBreadcrumbs(currentFolderId) : Promise.resolve([])),
    enabled: !!currentFolderId && activeTab === "my-drive",
  });

  // Folder Mutations
  const createFolderMutation = useMutation({
    mutationFn: (name) => createFolder({ name, parentId: currentFolderId }),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["folders", currentFolderId] });
      setIsCreateOpen(false);
      setCreateError("");
      showToast(`Folder "${data.name}" created successfully`);
    },
    onError: (err) => {
      setCreateError(err.response?.data?.message || "Failed to create folder");
    },
  });

  const renameFolderMutation = useMutation({
    mutationFn: ({ id, name }) => renameFolder(id, { name }),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["folders", currentFolderId] });
      queryClient.invalidateQueries({ queryKey: ["breadcrumbs"] });
      setRenameTargetFolder(null);
      setRenameError("");
      showToast(`Folder renamed to "${data.name}"`);
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
      showToast(`Folder deleted successfully`);
    },
    onError: (err) => {
      setDeleteError(err.response?.data?.message || "Failed to delete folder");
    },
  });

  // File Mutations
  const uploadFileMutation = useMutation({
    mutationFn: ({ file, onProgress }) => uploadFile(file, currentFolderId, onProgress),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["files", currentFolderId] });
      setIsUploadOpen(false);
      setUploadError("");
      showToast(`File "${data.filename}" uploaded successfully`);
    },
    onError: (err) => {
      setUploadError(err.response?.data?.message || "Failed to upload file");
    },
  });

  const deleteFileMutation = useMutation({
    mutationFn: (fileId) => deleteFile(fileId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["files", currentFolderId] });
      queryClient.invalidateQueries({ queryKey: ["sharedFiles"] });
      setDeleteTargetFile(null);
      setDeleteFileError("");
      showToast(`File moved to Trash`);
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

  const isLoading = activeTab === "my-drive" ? (isLoadingFolders || isLoadingFiles) : isLoadingSharedFiles;
  const isError = activeTab === "my-drive" ? (isErrorFolders || isErrorFiles) : isErrorSharedFiles;
  const errorMessage = activeTab === "my-drive"
    ? (foldersError?.response?.data?.message || filesError?.response?.data?.message)
    : sharedFilesError?.response?.data?.message;

  const currentFiles = activeTab === "my-drive" ? files : sharedFiles;

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

        <SearchFilterBar
          activeFilters={searchFilters}
          onSearchChange={(q) => {
            setSearchPage(0);
            setSearchFilters((prev) => ({ ...prev, q }));
          }}
          onFilterChange={(filters) => {
            setSearchPage(0);
            setSearchFilters((prev) => ({ ...prev, ...filters }));
          }}
        />

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
        {/* Navigation Tabs (My Drive vs Shared with Me) */}
        <div style={styles.tabsContainer}>
          <button
            onClick={() => {
              setActiveTab("my-drive");
              setSearchParams({});
            }}
            style={{
              ...styles.tabButton,
              ...(activeTab === "my-drive" ? styles.tabActive : {}),
            }}
          >
            <svg style={styles.tabIcon} fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-6l-2-2H5a2 2 0 00-2 2z" />
            </svg>
            My Drive
          </button>

          <button
            onClick={() => {
              setActiveTab("shared-with-me");
              setSearchParams({});
            }}
            style={{
              ...styles.tabButton,
              ...(activeTab === "shared-with-me" ? styles.tabActive : {}),
            }}
          >
            <svg style={styles.tabIcon} fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
            </svg>
            Shared with me
          </button>

          <button
            onClick={() => navigate("/starred")}
            style={styles.tabButton}
          >
            <span style={{ marginRight: "6px" }}>⭐</span>
            Starred
          </button>

          <button
            onClick={() => navigate("/trash")}
            style={styles.tabButton}
          >
            <span style={{ marginRight: "6px" }}>🗑️</span>
            Trash
          </button>
        </div>

        {/* Drive Action Bar */}
        <div style={styles.actionBar}>
          <div style={styles.actionButtonGroup}>
            {activeTab === "my-drive" && (
              <>
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
              </>
            )}
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

        {/* Breadcrumb Navigation (My Drive mode) */}
        {activeTab === "my-drive" && (
          <Breadcrumbs breadcrumbs={breadcrumbs} onNavigate={handleNavigateFolder} />
        )}

        {/* Folder & File Content Grid / List / States */}
        {isSearchActive ? (
          <div>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "16px" }}>
              <h2 style={styles.sectionTitle}>
                Search Results ({searchData?.totalElements || 0} files found)
              </h2>
              <button
                onClick={() => {
                  setSearchFilters({ q: "", mimeType: "", starred: null, minSize: null, maxSize: null, createdFrom: "", createdTo: "" });
                  setSearchPage(0);
                }}
                style={{
                  padding: "6px 12px",
                  fontSize: "13px",
                  fontWeight: "600",
                  color: "#dc2626",
                  backgroundColor: "#fef2f2",
                  border: "1px solid #fecaca",
                  borderRadius: "6px",
                  cursor: "pointer",
                }}
              >
                Clear Search
              </button>
            </div>

            {isLoadingSearch ? (
              <div style={styles.loadingContainer}>
                <div style={styles.spinner}></div>
                <p style={styles.loadingText}>Searching files in PostgreSQL...</p>
              </div>
            ) : isErrorSearch ? (
              <div style={styles.errorContainer}>
                <p style={styles.errorText}>
                  {searchError?.response?.data?.message || "Search failed."}
                </p>
              </div>
            ) : !searchData?.content || searchData.content.length === 0 ? (
              <div style={styles.emptyContainer}>
                <svg style={styles.emptyIcon} fill="none" stroke="#9ca3af" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
                <h3 style={styles.emptyTitle}>No files found</h3>
                <p style={styles.emptyText}>Try adjusting your search query or filters.</p>
              </div>
            ) : viewMode === "list" ? (
              <FileListView
                folders={[]}
                files={searchData.content}
                starredFileIds={starredFileIds}
                onToggleStarFile={(f) => toggleStarMutation.mutate(f)}
                onDownloadFile={handleDownloadFile}
                onShareFile={(f) => setShareTargetFile(f)}
                onViewDetailsFile={(f) => setDetailsTargetFile(f)}
                onDeleteFile={(f) => {
                  setDeleteFileError("");
                  setDeleteTargetFile(f);
                }}
              />
            ) : (
              <div style={styles.grid}>
                {searchData.content.map((file) => (
                  <FileCard
                    key={file.id}
                    file={file}
                    isStarred={starredFileIds.includes(file.id)}
                    onToggleStar={(f) => toggleStarMutation.mutate(f)}
                    onDownload={handleDownloadFile}
                    onShare={(f) => setShareTargetFile(f)}
                    onViewDetails={(f) => setDetailsTargetFile(f)}
                    onDelete={(f) => {
                      setDeleteFileError("");
                      setDeleteTargetFile(f);
                    }}
                  />
                ))}
              </div>
            )}

            {/* Pagination Controls */}
            {searchData && searchData.totalPages > 1 && (
              <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: "16px", marginTop: "24px" }}>
                <button
                  onClick={() => setSearchPage((prev) => Math.max(0, prev - 1))}
                  disabled={searchPage === 0}
                  style={{
                    padding: "8px 16px",
                    fontSize: "13px",
                    fontWeight: "600",
                    color: searchPage === 0 ? "#9ca3af" : "#374151",
                    backgroundColor: "#ffffff",
                    border: "1px solid #d1d5db",
                    borderRadius: "6px",
                    cursor: searchPage === 0 ? "not-allowed" : "pointer",
                  }}
                >
                  Previous
                </button>
                <span style={{ fontSize: "14px", color: "#4b5563", fontWeight: "500" }}>
                  Page {searchData.page + 1} of {searchData.totalPages}
                </span>
                <button
                  onClick={() => setSearchPage((prev) => prev + 1)}
                  disabled={searchData.last}
                  style={{
                    padding: "8px 16px",
                    fontSize: "13px",
                    fontWeight: "600",
                    color: searchData.last ? "#9ca3af" : "#374151",
                    backgroundColor: "#ffffff",
                    border: "1px solid #d1d5db",
                    borderRadius: "6px",
                    cursor: searchData.last ? "not-allowed" : "pointer",
                  }}
                >
                  Next
                </button>
              </div>
            )}
          </div>
        ) : isLoading ? (
          <div style={styles.loadingContainer}>
            <div style={styles.spinner}></div>
            <p style={styles.loadingText}>
              {activeTab === "my-drive" ? "Loading directory contents..." : "Loading shared files..."}
            </p>
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
        ) : (activeTab === "my-drive" && folders.length === 0 && files.length === 0) ||
          (activeTab === "shared-with-me" && sharedFiles.length === 0) ? (
          <div style={styles.emptyContainer}>
            <svg style={styles.emptyIcon} fill="none" stroke="#9ca3af" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-6l-2-2H5a2 2 0 00-2 2z" />
            </svg>
            <h3 style={styles.emptyTitle}>
              {activeTab === "my-drive" ? "This folder is empty" : "No shared files yet"}
            </h3>
            <p style={styles.emptyText}>
              {activeTab === "my-drive"
                ? "Create a new folder or upload a file to get started."
                : "Files shared with you by other owners will appear here."}
            </p>
          </div>
        ) : viewMode === "list" ? (
          <FileListView
            folders={activeTab === "my-drive" ? folders : []}
            files={currentFiles}
            starredFileIds={starredFileIds}
            onOpenFolder={handleOpenFolder}
            onRenameFolder={(f) => {
              setRenameError("");
              setRenameTargetFolder(f);
            }}
            onDeleteFolder={(f) => {
              setDeleteError("");
              setDeleteTargetFolder(f);
            }}
            onToggleStarFile={(f) => toggleStarMutation.mutate(f)}
            onDownloadFile={handleDownloadFile}
            onShareFile={activeTab === "my-drive" ? (f) => setShareTargetFile(f) : null}
            onViewDetailsFile={(f) => setDetailsTargetFile(f)}
            onDeleteFile={(f) => {
              setDeleteFileError("");
              setDeleteTargetFile(f);
            }}
          />
        ) : (
          <div>
            {/* Folders Section (My Drive Mode) */}
            {activeTab === "my-drive" && folders.length > 0 && (
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
            {currentFiles.length > 0 && (
              <div style={styles.section}>
                <h2 style={styles.sectionTitle}>
                  {activeTab === "my-drive"
                    ? `Files (${currentFiles.length})`
                    : `Shared Documents (${currentFiles.length})`}
                </h2>
                <div style={styles.grid}>
                  {currentFiles.map((file) => (
                    <FileCard
                      key={file.id}
                      file={file}
                      isStarred={starredFileIds.includes(file.id)}
                      onToggleStar={(f) => toggleStarMutation.mutate(f)}
                      onDownload={handleDownloadFile}
                      onShare={activeTab === "my-drive" ? (f) => setShareTargetFile(f) : null}
                      onViewDetails={(f) => setDetailsTargetFile(f)}
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

      <ShareModal
        isOpen={!!shareTargetFile}
        file={shareTargetFile}
        onClose={() => setShareTargetFile(null)}
      />

      <FileDetailsModal
        isOpen={!!detailsTargetFile}
        fileId={detailsTargetFile?.id}
        file={detailsTargetFile}
        onClose={() => setDetailsTargetFile(null)}
        onDownload={handleDownloadFile}
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
  tabsContainer: {
    display: "flex",
    gap: "12px",
    borderBottom: "2px solid #e5e7eb",
    marginBottom: "20px",
  },
  tabButton: {
    display: "inline-flex",
    alignItems: "center",
    gap: "8px",
    padding: "10px 16px",
    fontSize: "15px",
    fontWeight: "500",
    color: "#6b7280",
    backgroundColor: "transparent",
    border: "none",
    borderBottom: "3px solid transparent",
    marginBottom: "-2px",
    cursor: "pointer",
  },
  tabActive: {
    color: "#2563eb",
    fontWeight: "700",
    borderBottomColor: "#2563eb",
  },
  tabIcon: {
    width: "20px",
    height: "20px",
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
    minHeight: "42px",
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
    border: "1px solid #e5e7eb",
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
