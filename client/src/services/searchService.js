import api from "./api";

export const searchFiles = async (params = {}) => {
  const cleanParams = {};

  Object.keys(params).forEach((key) => {
    const val = params[key];
    if (val !== null && val !== undefined && val !== "") {
      cleanParams[key] = val;
    }
  });

  const response = await api.get("/files/search", { params: cleanParams });
  return response.data;
};

