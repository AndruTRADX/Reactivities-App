import { createBrowserRouter, Navigate } from "react-router"
import App from "@/app/layout/App"
import ActivityPage from "@/features/activities/ActivityPage"
import CreateActivityPage from "@/features/activities/pages/create/CreateActivityPage"
import ActivityDetailsPage from "@/features/activities/pages/details/ActivityDetailsPage"
import UpdateActivityPage from "@/features/activities/pages/update/UpdateActivityPage"
import ServerErrorPage from "@/features/errors/ServerErrorPage"
import NotFoundPage from "@/features/errors/NotFoundPage"
import LoginPage from "@/features/account/LoginPage"
import RequireAuth from "./RequireAuth"
import RequireGuest from "./RequireGuest"
import RegisterPage from "@/features/account/RegisterPage"
import ProfilePage from "@/features/profile/ProfilePage"

export const router = createBrowserRouter([
  {
    path: "/",
    element: <App />,
    children: [
      {
        path: "",
        element: <Navigate to="/activities" replace />,
      },
      {
        element: <RequireGuest />,
        children: [
          {
            path: "login",
            element: <LoginPage />,
          },
          {
            path: "register",
            element: <RegisterPage />,
          },
        ],
      },
      {
        element: <RequireAuth />,
        children: [
          {
            path: "activities",
            element: <ActivityPage />,
          },
          {
            path: "activities/:id",
            element: <ActivityDetailsPage />,
          },
          {
            path: "create-activity",
            element: <CreateActivityPage />,
          },
          {
            path: "update-activity/:id",
            element: <UpdateActivityPage />,
          },
          {
            path: "profile/:id",
            element: <ProfilePage />,
          },
        ],
      },
      {
        path: "not-found",
        element: <NotFoundPage />,
      },
      {
        path: "server-error",
        element: <ServerErrorPage />,
      },
      {
        path: "*",
        element: <NotFoundPage />,
      },
    ],
  },
])
