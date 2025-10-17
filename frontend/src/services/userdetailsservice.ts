import api from "./baseapi";

export const getUserDetails = async () => {
  const response = await api.get("user-profile/");
  return response.data;
};

export const updateUserDetails = async (userData: FormData) => {
  await api.put("update-profile/", userData);
};