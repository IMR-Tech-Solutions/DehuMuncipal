import { BrowserRouter as Router, Routes, Route } from "react-router";
import { ScrollToTop } from "../components/common/ScrollToTop";
import AppLayout from "../layout/AppLayout";
import { websiteRoutes, authRoutes } from "./router.link";
import NotFound from "../pages/OtherPage/NotFound";
import { ToastContainer } from "react-toastify";
import ProtectedRoute from "./ProtectedRoute";
import Moduleaccess from "./Moduleacces";

const AppRouter = () => {
  return (
    <Router>
      <ToastContainer
        position="bottom-right"
        autoClose={2000}
        hideProgressBar={true}
        newestOnTop={false}
        closeOnClick
        rtl={false}
        pauseOnHover
        theme="light"
        className="!z-[9999] !text-inherit"
      />
      <ScrollToTop />
      <Routes>
        {/* Main Routes */}
        <Route element={<ProtectedRoute />}>
          <Route element={<AppLayout />}>
            {websiteRoutes.map((item) => (
              <Route key={item.id} path={item.link}  element={
                   <Moduleaccess module={item.module}>
                    {item.element}
                   </Moduleaccess>}
                 />
            ))}
          </Route>
        </Route>
        {/* Not Found Route*/}
        <Route path="*" element={<NotFound />} />
        {/* Authetication Routes*/}
        {authRoutes.map((item) => (
          <Route key={item.id} path={item.link} element={item.element} />
        ))}
      </Routes>
    </Router>
  );
};

export default AppRouter;
