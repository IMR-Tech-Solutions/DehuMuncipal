import api from "./baseapi";
import { getAllPaginatedData } from "./getpaginateddata";

//Add New user --admin only
export const addnewuserservice = async (userData: FormData) => {
  await api.post("admin/add-user/", userData);
};

//Get all users --admin only
export const getallusersservice = () => {
  const allUsers = getAllPaginatedData("admin/all-users/");
  return allUsers;
};

//Get single user data --admin only
export const getsingleuserservice = async (userID: number) => {
  const response = await api.get(`admin/user-profile/${userID}/`);
  const singleUser = response.data;
  return singleUser;
};

//update user data --admin only
export const updateuserservice = async (
  userID: number,
  updatedData: FormData
) => {
  await api.put(`admin/update-profile/${userID}/`, updatedData);
};

//delete user data --admin only
export const deleteuserservice = async (userID: number) => {
  await api.delete(`admin/delete-profile/${userID}/`);
};
