import React from "react";
import {
  Route,
  RouterProvider,
  createBrowserRouter,
  createRoutesFromElements,
} from "react-router-dom";

import Inner2 from "../pages/Inner2";
import Inner from "../pages/Inner";
import About from "../pages/About";
import Layout from "../Layout";
import Error from "../pages/Error";
import DashBoard from "../pages/DashBoard";
const Router = createBrowserRouter([
  {
    path: "/",
    element: <DashBoard />,
    errorElement: <Error />,
  },
  {
    path: "/about",
    element: <About />,
    errorElement: <Error />,
  },
  {
    path: "/inner",
    element: <Inner />,
    errorElement: <Error />,
  },
]);

export default Router;
