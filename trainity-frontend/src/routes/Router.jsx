import React from "react";
import {
  Route,
  RouterProvider,
  createBrowserRouter,
  createRoutesFromElements,
} from "react-router-dom";
import Home from "../pages/Home";
import Inner2 from "../pages/Inner2";
import Inner from "../pages/Inner";
import About from "../pages/About";
import Layout from "../Layout";
import Error from "../pages/Error";

const Router = createBrowserRouter([
  {
    path: "/",
    element: <Home />,
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
