import api from "./api";

export const createShare = async ({ fileId, email, role }) => {
  const response = await api.post("/shares", { fileId, email, role });
  return response.data;
};

export const getFileShares = async (fileId) => {
  const response = await api.get(`/shares/file/${fileId}`);
  return response.data;
};

export const removeShare = async (shareId) => {
  const response = await api.delete(`/shares/${shareId}`);
  return response.data;
};

