import {
  LaptopIcon,
  LogoutCircle01Icon,
  ServerStack03Icon,
  UserCircleIcon,
  UserSearch,
} from "@hugeicons/core-free-icons"
import { HugeiconsIcon } from "@hugeicons/react"
import { Button } from "@sharedUi/button"
import { NavLink, useNavigate } from "react-router"
import { cn } from "@/shared/lib/utils"
import { useGetCurrentUser, useLogoutAccount } from "@sharedHooks/api/useAccount"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "./ui/dropdown-menu"
import { useCallback } from "react"

export default function Navbar() {
  const { user } = useGetCurrentUser()
  const { logoutAccountAsync } = useLogoutAccount()
  const navigate = useNavigate()

  const handleLogout = useCallback(async () => {
    await logoutAccountAsync()
  }, [logoutAccountAsync])

  return (
    <nav className="z-50 fixed w-full flex justify-between px-5.5 py-2.5 bg-primary-foreground/35 backdrop-blur-xl">
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
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline">
              <HugeiconsIcon icon={UserCircleIcon} className="text-primary min-w-5" />
              {user.displayName}'s Profile
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent className="w-40" align="end">
            <DropdownMenuGroup>
              <DropdownMenuLabel>My Account</DropdownMenuLabel>
              <DropdownMenuItem>
                <HugeiconsIcon icon={UserCircleIcon} className="min-w-5" />
                Profile
              </DropdownMenuItem>
            </DropdownMenuGroup>
            <DropdownMenuSeparator />
            <DropdownMenuGroup>
              <DropdownMenuLabel>GitHub</DropdownMenuLabel>
              <DropdownMenuItem
                onClick={() =>
                  window.open("https://github.com/AndruTRADX/Reactivities-App", "_blank")
                }
              >
                <HugeiconsIcon icon={LaptopIcon} className="min-w-5" />
                Client
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={() =>
                  window.open("https://github.com/AndruTRADX/Reactivities-Api", "_blank")
                }
              >
                <HugeiconsIcon icon={ServerStack03Icon} className="min-w-5" />
                API
              </DropdownMenuItem>
            </DropdownMenuGroup>
            <DropdownMenuSeparator />
            <DropdownMenuGroup>
              <DropdownMenuItem onClick={handleLogout}>
                <HugeiconsIcon icon={LogoutCircle01Icon} className="text-destructive min-w-5" />
                Log out
              </DropdownMenuItem>
            </DropdownMenuGroup>
          </DropdownMenuContent>
        </DropdownMenu>
      ) : (
        <div className="flex gap-2 items-center">
          <Button onClick={() => navigate("/login")}>Sign In</Button>
          <Button onClick={() => navigate("/register")} variant="outline">
            Register
          </Button>
        </div>
      )}
    </nav>
  )
}
