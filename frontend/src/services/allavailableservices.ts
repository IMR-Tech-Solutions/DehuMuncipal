import api from "./baseapi";

// Get all available Modules
export const getavailableservices = async () => {
  const response = await api.get("available-modules/");
  return response.data.available_services;
};
