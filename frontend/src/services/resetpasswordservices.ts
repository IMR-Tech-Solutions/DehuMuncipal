import api from "./baseapi";


export const requestPasswordResetService = async (userEmail: string) => {
  const response = await api.post("password-reset/request/", { email: userEmail });
  return response.data;
};


export const confirmPasswordResetService = async (resetData: {
  email: string;
  token: string;
  new_password: string;
}) => {
  const response = await api.post("password-reset/confirm/", resetData);
  return response.data;
};
