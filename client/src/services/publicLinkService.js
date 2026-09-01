import api from "./api";

export const createPublicLink = async ({ fileId, expiresAt, password }) => {
  const response = await api.post("/public-links", { fileId, expiresAt, password });
  return response.data;
};

export const getFilePublicLinks = async (fileId) => {
  const response = await api.get(`/public-links/file/${fileId}`);
  return response.data;
};

export const revokePublicLink = async (linkId) => {
  const response = await api.delete(`/public-links/${linkId}`);
  return response.data;
};

export const accessPublicLink = async (token) => {
  const response = await api.get(`/public-links/${token}`);
  return response.data;
};

export const verifyPublicLinkPassword = async (token, password) => {
  const response = await api.post(`/public-links/${token}/verify`, { password });
  return response.data;
};

