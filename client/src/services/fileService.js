import api from "./api";

export const getFiles = async (folderId = null) => {
  const params = folderId ? { folderId } : {};
  const response = await api.get("/files", { params });
  return response.data;
};

export const getFolderFiles = async (folderId) => {
  if (!folderId) return getFiles(null);
  const response = await api.get(`/folders/${folderId}/files`);
  return response.data;
};

export const getSharedFiles = async () => {
  const response = await api.get("/files/shared-with-me");
  return response.data;
};

export const getFileMetadata = async (fileId) => {
  const response = await api.get(`/files/${fileId}`);
  return response.data;
};

export const uploadFile = async (file, folderId = null, onUploadProgress) => {
  const formData = new FormData();
  formData.append("file", file);
  if (folderId) {
    formData.append("folderId", folderId);
  }

  const response = await api.post("/files/upload", formData, {
    headers: {
      "Content-Type": "multipart/form-data",
    },
    onUploadProgress,
  });
  return response.data;
};

export const getDownloadUrl = async (fileId) => {
  const response = await api.get(`/files/${fileId}/download-url`);
  return response.data;
};

export const deleteFile = async (fileId) => {
  const response = await api.delete(`/files/${fileId}`);
  return response.data;
};
