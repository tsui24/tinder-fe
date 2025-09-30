import React from "react";
import { createBrowserRouter } from "react-router-dom";
import { LandingPage } from "../pages";
import { Login, Register } from "../features";
import Layout from "../layouts/Layout";

export const router = createBrowserRouter([
  {
    path: "/",
    element: <Layout />,
    children: [
      {
        index: true,
        element: <LandingPage />,
      },
      {
        path: "login",
        element: <Login />,
      },
      {
        path: "register",
        element: <Register />,
      },
    ],
  },
]);

export default router;
