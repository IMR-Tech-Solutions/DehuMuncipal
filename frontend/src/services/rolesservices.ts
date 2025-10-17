import api from "./baseapi";
import { getAllPaginatedData } from "./getpaginateddata";

// Add new role service
export const addnewroleservice = async (rolename: FormData) => {
  await api.post("new-role/", rolename);
};

// Get all roles
export const getallrolesservice = () => {
  const allRoles = getAllPaginatedData("all-roles/");
  return allRoles;
};

//Delete a Role
export const deleteroleservice = async (roleID: number) => {
  await api.delete(`delete-role/${roleID}/`);
};

//get role-permissions
export const getrolepermissionsservice = async (roleID: number) => {
  const response = await api.get(`user-permission/${roleID}/`);
  return response.data;
};

// update role-permissions
export const updaterolepermissionsservice = async (
  roleID: number,
  payload: { module_permissions: string[] }
) => {
  await api.post(`user-permission/${roleID}/`, payload);
};
