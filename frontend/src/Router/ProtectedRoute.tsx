import { getToken } from "../authentication/auth";
import { Navigate } from "react-router";
import { Outlet } from "react-router";

const ProtectedRoute = () => {
  const token = getToken();
  if (!token) {
    return <Navigate to="/signin" replace />;
  }
  return <Outlet />;
};

export default ProtectedRoute;
