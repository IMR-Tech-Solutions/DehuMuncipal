import { all_routes } from "./allroutes";
import Home from "../pages/Dashboard/Home";
import SignIn from "../pages/AuthPages/SignIn";
// import SignUp from "../pages/AuthPages/SignUp";
import UserProfiles from "../pages/UserProfiles";
import Roles from "../pages/Roles/Roles";
import Users from "../pages/Users/Users";
import CreateSurvey from "../pages/Survey/CreateSurvey";
import Surveys from "../pages/Survey/Survey";
import SurveyView from "../pages/Survey/SurveyView";
import EditSurvey from "../pages/Survey/EditSurvey";
import Rolepermissions from "../pages/Roles/Rolepermissions";
import { all_modules } from "../modules/modules";
import Allusers from "../pages/Users/Allusers";
import ResetPasswordLayout from "../pages/ResetPassword/ResetPasswordLayout";
import SurveyReports from "../pages/Reports/surveyreport";

export const websiteRoutes = [
  {
    id: "1",
    name: "Dashboard",
    link: all_routes.home,
    module: all_modules.home,
    element: <Home />,
  },
  {
    id: "2",
    name: "User Profiles",
    link: all_routes.profile,
    module: all_modules.profile,
    element: <UserProfiles />,
  },
  {
    id: "3",
    name: "Roles",
    link: all_routes.roles,
    module: all_modules.roles,
    element: <Roles />,
  },
  {
    id: "4",
    name: "Users",
    link: all_routes.users,
    module: all_modules.users,
    element: <Users />,
  },
  {
    id: "6",
    name: "Surveys",
    link: all_routes.surveys,
    module: all_modules.accesssurvey,
    element: <Surveys />,
  },
  {
    id: "7",
    name: "Create Survey",
    link: all_routes.createsurvey,
    module: all_modules.createsurvey,
    element: <CreateSurvey />,
  },
  {
    id: "8",
    name: "View Survey",
    link: all_routes.viewsurvey,
    module: all_modules.accesssurvey,
    element: <SurveyView />,
  },
  {
    id: "9",
    name: "Edit Survey",
    link: all_routes.editsurvey,
    module: all_modules.editsurvey,
    element: <EditSurvey />,
  },
  {
    id: "10",
    name: "Role permissions",
    link: all_routes.rolepermissions,
    module: all_modules.rolepermissions,
    element: <Rolepermissions />,
  },
  {
    id: "11",
    name: "View Users",
    link: all_routes.viewusers,
    module: all_modules.viewuser,
    element: <Allusers />,
  },
  {
    id: "12",
    name: "Survey Reports",
    link: all_routes.surveyreport,
    module: all_modules.surveyreport,
    element: <SurveyReports/>,
  },
];

export const authRoutes = [
  {
    id: "1",
    name: "SignIn",
    link: all_routes.signIn,
    module: "signin",
    element: <SignIn />,
  },
  // {
  //   id: "2",
  //   name: "SignUp",
  //   link: all_routes.signUp,
  //   module: "siginup",
  //   element: <SignUp />,
  // },
  {
    id: "3",
    name: "Reset Password",
    link: all_routes.resetpassword,
    module: all_modules.resetpassword,
    element: <ResetPasswordLayout/>,
  },
];
