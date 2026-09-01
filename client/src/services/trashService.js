import api from "./api";

export const getTrashFiles = async () => {
  const response = await api.get("/trash");
  return response.data;
};

export const restoreFile = async (fileId) => {
  const response = await api.post(`/files/${fileId}/restore`);
  return response.data;
};

