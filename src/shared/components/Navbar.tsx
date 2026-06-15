import { UserCircleIcon, UserSearch } from "@hugeicons/core-free-icons"
import { HugeiconsIcon } from "@hugeicons/react"
import { Button } from "@sharedUi/button"
import { NavLink } from "react-router"
import { cn } from "../lib/utils"
import { useGetCurrentUser } from "../hooks/api/useAccount"

export default function Navbar() {
  const { user } = useGetCurrentUser()

  return (
    <nav className="z-50 fixed w-full flex justify-between px-5.5 py-2.5 bg-primary-foreground/50 backdrop-blur-xs">
      <NavLink to="/" end>
        {({ isActive }) => (
          <Button
            size="lg"
            variant="ghost"
            className={cn(
              `flex items-center gap-1 cursor-pointer ${isActive ? "text-primary hover:text-primary/80" : "text-foreground"}`
            )}
          >
            <HugeiconsIcon icon={UserSearch} strokeWidth={2} />
            <h3 className="font-semibold text-base">Reactivities</h3>
          </Button>
        )}
      </NavLink>

      <div className="flex gap-2">
        <NavLink to="/activities" end>
          {({ isActive }) => (
            <Button
              variant="ghost"
              className={cn(isActive ? "text-primary hover:text-primary/80" : "text-foreground")}
            >
              Activities
            </Button>
          )}
        </NavLink>

        <NavLink to="/create-activity">
          {({ isActive }) => (
            <Button
              variant="ghost"
              className={cn(isActive ? "text-primary hover:text-primary/80" : "text-foreground")}
            >
              Create Activity
            </Button>
          )}
        </NavLink>
      </div>

      {user ? (
        <div className="flex gap-4 items-center">
          <Button variant="outline">
            <HugeiconsIcon icon={UserCircleIcon} className="text-primary min-w-5" />
            {user.displayName}'s Profile
          </Button>
        </div>
      ) : (
        <Button>Sign In</Button>
      )}
    </nav>
  )
}
