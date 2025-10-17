import {
  // BoxCubeIcon,
  GridIcon,
  // ListIcon,
  GroupIcon,
  TaskIcon,
  // ChatIcon,
  // DocsIcon,
  PlusIcon,
  // PlugInIcon,
  // PieChartIcon,
} from "../icons";
import { NavItem } from "../types/types";
import { all_modules } from "../modules/modules";

export const navItems: NavItem[] = [
  {
    icon: <GridIcon />,
    name: "Dashboard",
    path: "/",
    module: all_modules.home,
  },
];

export const management: NavItem[] = [
  {
    icon: <TaskIcon />,
    name: "Survey",
    path: "/surveys",
    module: all_modules.accesssurvey,
  },
  {
    icon: <PlusIcon />,
    name: "Create Survey",
    path: "/create-survey",
    module: all_modules.createsurvey,
  },
];

export const settings: NavItem[] = [
   {
    icon: <GroupIcon />,
    name: "Users",
    subItems: [
      {
        name: "Create Roles",
        path: "/roles",
        module: all_modules.roles,
      },
      {
        name: "Create Users",
        path: "/users",
        module: all_modules.users,
      },
    ],
  },
];

export const configration: NavItem[] = [
 
];

export const surveyReports: NavItem[] = [
  
];

export const allSidebarSections = {
  navItems,
  management,
  configration,
  surveyReports,
  settings,
};
