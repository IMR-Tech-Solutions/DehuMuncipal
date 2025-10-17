import { ReactNode, useEffect } from "react";
import { useDispatch } from "react-redux";
import { setUser, clearUser, setPermissions } from "../redux/userSlice";
import { getToken } from "../authentication/auth";
import api from "../services/baseapi";
import { getusermoduleservice } from "../services/gettingmoduleservice";

const AuthLoader = ({ children }: { children: ReactNode }) => {
  const dispatch = useDispatch();
  useEffect(() => {
    const rehydrateUser = async () => {
      const token = getToken();
      if (!token) return;
      try {
        const res = await api.get("me/");
        dispatch(setUser(res.data));
        const perms = await getusermoduleservice(res.data.role_id);
        dispatch(setPermissions(perms));
      } catch (err) {
        console.error("Token expired or invalid", err);
        dispatch(clearUser());
      }
    };
    rehydrateUser();
  }, [dispatch]);

  return children;
};

export default AuthLoader;
