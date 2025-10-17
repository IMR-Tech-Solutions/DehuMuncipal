import api from "./baseapi";

// particular user modules
export const getusermoduleservice = async (userID: number | string) => {
  const response = await api.get(`available-modules/${userID}/`);
  return response.data.modules;
};
