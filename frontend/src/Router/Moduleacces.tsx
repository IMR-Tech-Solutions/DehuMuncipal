import { useSelector } from "react-redux";
import { Navigate } from "react-router";
import Loader from "../Loader/Loader";

const Moduleaccess = ({
  module,
  children,
}: {
  module: string;
  children: React.ReactNode;
}) => {
  const permissions = useSelector((state: any) => state.user?.permissions);

  if (permissions === null) {
    return <Loader />;
  }

  if (permissions === "all" || permissions.includes(module)) {
    return <>{children}</>;
  }

  return <Navigate to="/not-found" replace />;
};

export default Moduleaccess;
