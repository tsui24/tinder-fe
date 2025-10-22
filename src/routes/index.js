import React from "react";
import { createBrowserRouter } from "react-router-dom";
import { LandingPage } from "../pages";
import { Login, Register, RegisterInfo, Match } from "../features";
import Settings from "../pages/Settings/Settings";
import Layout from "../layouts/Layout";
import ProtectedRoute from "../components/ProtectedRoute";

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
      {
        path: "match",
        element: (
          <ProtectedRoute>
            <Match />
          </ProtectedRoute>
        ),
      },
      {
        path: "register-info",
        element: (
          <ProtectedRoute>
            <RegisterInfo />
          </ProtectedRoute>
        ),
      },
      {
        path: "settings",
        element: (
          <ProtectedRoute>
            <Settings />
          </ProtectedRoute>
        ),
      },
      {
        path: "*",
        element: (
          <ProtectedRoute>
            <div
              style={{
                display: "flex",
                justifyContent: "center",
                alignItems: "center",
                height: "50vh",
                flexDirection: "column",
                gap: "20px",
              }}
            >
              <h2>404 - Page Not Found</h2>
              <p>The page you're looking for doesn't exist.</p>
            </div>
          </ProtectedRoute>
        ),
      },
    ],
  },
]);

export default router;
