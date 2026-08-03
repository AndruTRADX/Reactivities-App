import {
  LaptopIcon,
  LogoutCircle01Icon,
  Menu01Icon,
  Moon02Icon,
  ServerStack03Icon,
  Sun03Icon,
  UserCircleIcon,
  UserSearch,
} from "@hugeicons/core-free-icons"
import { HugeiconsIcon } from "@hugeicons/react"
import { Button } from "@sharedUi/button"
import { NavLink, useNavigate } from "react-router"
import { cn } from "@/shared/lib/utils"
import { useGetCurrentUser, useLogoutAccount } from "@sharedHooks/api/useAccount"
import { useTheme } from "@/app/layout/ThemeProvider"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "./ui/dropdown-menu"
import { useCallback, useState } from "react"
import { Avatar, AvatarFallback, AvatarImage } from "@/shared/components/ui/avatar"
import {
  Sheet,
  SheetClose,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/shared/components/ui/sheet"

export default function Navbar() {
  const { user } = useGetCurrentUser()
  const { logoutAccountAsync } = useLogoutAccount()
  const { theme, setTheme } = useTheme()
  const navigate = useNavigate()
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

  const handleLogout = useCallback(async () => {
    await logoutAccountAsync()
  }, [logoutAccountAsync])

  const handleMobileNavigate = useCallback(
    (to: string) => {
      setMobileMenuOpen(false)
      navigate(to)
    },
    [navigate]
  )

  return (
    <nav className="glass z-50 fixed w-full flex justify-between px-4 sm:px-5.5 py-2.5 bg-primary-foreground/35 backdrop-blur-xl backdrop-saturate-150 inset-ring-1 inset-ring-glass-highlight/60 dark:inset-ring-glass-highlight/40">
      <NavLink to="/activities" end>
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

      <div className="hidden md:flex gap-2">
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

      <div className="hidden md:flex gap-2 items-center">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline" size="icon" className="relative">
              <HugeiconsIcon
                icon={Sun03Icon}
                className="scale-100 rotate-0 transition-all dark:scale-0 dark:-rotate-90"
              />
              <HugeiconsIcon
                icon={Moon02Icon}
                className="absolute scale-0 rotate-90 transition-all dark:scale-100 dark:rotate-0"
              />
              <span className="sr-only">Toggle theme</span>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuRadioGroup
              value={theme}
              onValueChange={value => setTheme(value as "light" | "dark" | "system")}
            >
              <DropdownMenuRadioItem
                value="light"
                className="data-[state=checked]:text-primary [&_svg]:data-[state=checked]:text-primary"
              >
                <HugeiconsIcon icon={Sun03Icon} className="min-w-5" />
                Light
              </DropdownMenuRadioItem>
              <DropdownMenuRadioItem
                value="dark"
                className="data-[state=checked]:text-primary [&_svg]:data-[state=checked]:text-primary"
              >
                <HugeiconsIcon icon={Moon02Icon} className="min-w-5" />
                Dark
              </DropdownMenuRadioItem>
              <DropdownMenuRadioItem
                value="system"
                className="data-[state=checked]:text-primary [&_svg]:data-[state=checked]:text-primary"
              >
                <HugeiconsIcon icon={LaptopIcon} className="min-w-5" />
                System
              </DropdownMenuRadioItem>
            </DropdownMenuRadioGroup>
          </DropdownMenuContent>
        </DropdownMenu>

        {user ? (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline">
                {user.imageUrl && user.imageUrl !== "" ? (
                  <Avatar size="sm">
                    <AvatarImage src={user.imageUrl} alt={user.displayName} />
                    <AvatarFallback>{user.displayName}</AvatarFallback>
                  </Avatar>
                ) : (
                  <HugeiconsIcon icon={UserCircleIcon} className="text-primary min-w-5" />
                )}
                {user.displayName}'s Profile
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="w-40" align="end">
              <DropdownMenuGroup>
                <DropdownMenuLabel>My Account</DropdownMenuLabel>
                <DropdownMenuItem onClick={() => navigate(`/profile/${user.id}`)}>
                  {user.imageUrl ? (
                    <Avatar size="sm">
                      <AvatarImage src={user.imageUrl} alt={user.displayName} />
                      <AvatarFallback>{user.displayName}</AvatarFallback>
                    </Avatar>
                  ) : (
                    <HugeiconsIcon icon={UserCircleIcon} className="text-primary min-w-5" />
                  )}
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
          <>
            <Button onClick={() => navigate("/login")}>Sign In</Button>
            <Button onClick={() => navigate("/register")} variant="outline">
              Register
            </Button>
          </>
        )}
      </div>

      <Sheet open={mobileMenuOpen} onOpenChange={setMobileMenuOpen}>
        <SheetTrigger asChild>
          <Button variant="outline" size="icon" className="md:hidden">
            <HugeiconsIcon icon={Menu01Icon} strokeWidth={2} />
            <span className="sr-only">Open menu</span>
          </Button>
        </SheetTrigger>
        <SheetContent side="right" className="gap-0">
          <SheetHeader>
            <SheetTitle>Menu</SheetTitle>
          </SheetHeader>

          <div className="flex flex-col gap-1 px-6">
            <NavLink to="/activities" end onClick={() => setMobileMenuOpen(false)}>
              {({ isActive }) => (
                <Button
                  variant="ghost"
                  className={cn(
                    "w-full justify-start",
                    isActive ? "text-primary hover:text-primary/80" : "text-foreground"
                  )}
                >
                  Activities
                </Button>
              )}
            </NavLink>

            <NavLink to="/create-activity" onClick={() => setMobileMenuOpen(false)}>
              {({ isActive }) => (
                <Button
                  variant="ghost"
                  className={cn(
                    "w-full justify-start",
                    isActive ? "text-primary hover:text-primary/80" : "text-foreground"
                  )}
                >
                  Create Activity
                </Button>
              )}
            </NavLink>
          </div>

          <DropdownMenuSeparator className="my-2" />

          <div className="flex flex-col gap-1 px-6">
            <span className="text-sm text-muted-foreground px-2">Theme</span>
            <div className="flex gap-2">
              <Button
                variant={theme === "light" ? "secondary" : "ghost"}
                size="icon"
                onClick={() => setTheme("light")}
              >
                <HugeiconsIcon icon={Sun03Icon} className="min-w-5" />
                <span className="sr-only">Light</span>
              </Button>
              <Button
                variant={theme === "dark" ? "secondary" : "ghost"}
                size="icon"
                onClick={() => setTheme("dark")}
              >
                <HugeiconsIcon icon={Moon02Icon} className="min-w-5" />
                <span className="sr-only">Dark</span>
              </Button>
              <Button
                variant={theme === "system" ? "secondary" : "ghost"}
                size="icon"
                onClick={() => setTheme("system")}
              >
                <HugeiconsIcon icon={LaptopIcon} className="min-w-5" />
                <span className="sr-only">System</span>
              </Button>
            </div>
          </div>

          <DropdownMenuSeparator className="my-2" />

          <div className="flex flex-col gap-2 px-6">
            {user ? (
              <>
                <Button
                  variant="ghost"
                  className="w-full justify-start"
                  onClick={() => handleMobileNavigate(`/profile/${user.id}`)}
                >
                  {user.imageUrl && user.imageUrl !== "" ? (
                    <Avatar size="sm">
                      <AvatarImage src={user.imageUrl} alt={user.displayName} />
                      <AvatarFallback>{user.displayName}</AvatarFallback>
                    </Avatar>
                  ) : (
                    <HugeiconsIcon icon={UserCircleIcon} className="text-primary min-w-5" />
                  )}
                  {user.displayName}'s Profile
                </Button>
                <SheetClose asChild>
                  <Button variant="outline" className="w-full justify-start" onClick={handleLogout}>
                    <HugeiconsIcon icon={LogoutCircle01Icon} className="text-destructive min-w-5" />
                    Log out
                  </Button>
                </SheetClose>
              </>
            ) : (
              <>
                <Button className="w-full" onClick={() => handleMobileNavigate("/login")}>
                  Sign In
                </Button>
                <Button
                  variant="outline"
                  className="w-full"
                  onClick={() => handleMobileNavigate("/register")}
                >
                  Register
                </Button>
              </>
            )}
          </div>
        </SheetContent>
      </Sheet>
    </nav>
  )
}
