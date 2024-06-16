import { lazy } from "react";

const routes = [
  {
    path: "home",
    component: lazy(() => import("../pages/Home/Home")),
    // isPayed: true,
    exact: true,
  },
  {
    path: "user/profile",
    component: lazy(() => import("../pages/Profile/Edit")),
    exact: true,
  },
  {
    path: "admin/",
    component: lazy(() => import("../pages/Admin/Dashboard")),
    exact: true,
    isAdmin: true,
  },
  {
    path: "admin/users",
    component: lazy(() => import("../pages/Admin/Users")),
    exact: true,
    isAdmin: true,
  },
  {
    path: "admin/problems",
    component: lazy(() => import("../pages/Admin/Problems")),
    exact: true,
    isAdmin: true,
  },
  {
    path: "admin/exams",
    component: lazy(() => import("../pages/Admin/Exams")),
    exact: true,
    isAdmin: true,
  },
];

export default routes;
