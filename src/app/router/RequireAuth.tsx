import { Spinner } from "@sharedUi/spinner"
import { useGetCurrentUser } from "@sharedHooks/api/useAccount"
import { Navigate, Outlet, useLocation } from "react-router"

export default function RequireAuth() {
  const { user, isLoadingUser } = useGetCurrentUser()
  const location = useLocation()

  if (isLoadingUser) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Spinner />
      </div>
    )
  }

  if (!user) {
    return <Navigate to="/login" replace state={{ from: location }} />
  }

  return <Outlet />
}
