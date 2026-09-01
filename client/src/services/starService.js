import api from "./api";

export const starFile = async (fileId) => {
  const response = await api.post(`/files/${fileId}/star`);
  return response.data;
};

export const unstarFile = async (fileId) => {
  const response = await api.delete(`/files/${fileId}/star`);
  return response.data;
};

export const getStarredFiles = async () => {
  const response = await api.get("/starred");
  return response.data;
};

export const getStarredFileIds = async () => {
  const response = await api.get("/starred/ids");
  return response.data;
};

