import { createBrowserRouter } from "react-router"
import App from "../layout/App"
import HomePage from "@/features/home/HomePage"
import ActivityPage from "@/features/activities/ActivityPage"
import CreateActivityPage from "@/features/activities/pages/create/CreateActivityPage"
import ActivityDetailsPage from "@/features/activities/pages/details/ActivityDetailsPage"
import UpdateActivityPage from "@/features/activities/pages/update/UpdateActivityPage"
import ServerErrorPage from "@/features/errors/ServerErrorPage"
import NotFoundPage from "@/features/errors/NotFoundPage"
import LoginPage from "@/features/account/LoginPage"
import RequireAuth from "./RequireAuth"

export const router = createBrowserRouter([
  {
    path: "/",
    element: <App />,
    children: [
      {
        path: "",
        element: <HomePage />,
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
        ],
      },
      {
        path: "login",
        element: <LoginPage />,
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
