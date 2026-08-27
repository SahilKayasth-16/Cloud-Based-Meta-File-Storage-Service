import api from "./api";

export const getFolders = async (parentId = null) => {
  const params = parentId ? { parentId } : {};
  const response = await api.get("/folders", { params });
  return response.data;
};

export const getFolderById = async (folderId) => {
  const response = await api.get(`/folders/${folderId}`);
  return response.data;
};

export const createFolder = async ({ name, parentId }) => {
  const response = await api.post("/folders", { name, parentId: parentId || null });
  return response.data;
};

export const renameFolder = async (folderId, { name }) => {
  const response = await api.put(`/folders/${folderId}`, { name });
  return response.data;
};

export const deleteFolder = async (folderId) => {
  const response = await api.delete(`/folders/${folderId}`);
  return response.data;
};

export const getBreadcrumbs = async (folderId) => {
  const response = await api.get(`/folders/${folderId}/breadcrumbs`);
  return response.data;
};

