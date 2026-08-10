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
import { HugeiconsIcon, type HugeiconsIconProps } from "@hugeicons/react"
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

type Theme = "light" | "dark" | "system"

type NavItem = { to: string; label: string; end?: boolean }

const NAV_ITEMS: NavItem[] = [
  { to: "/activities", label: "Activities", end: true },
  { to: "/create-activity", label: "Create Activity" },
]

const THEME_OPTIONS: { value: Theme; label: string; icon: HugeiconsIconProps["icon"] }[] = [
  { value: "light", label: "Light", icon: Sun03Icon },
  { value: "dark", label: "Dark", icon: Moon02Icon },
  { value: "system", label: "System", icon: LaptopIcon },
]

const GITHUB_LINKS = [
  { href: "https://github.com/AndruTRADX/Reactivities-App", label: "Client", icon: LaptopIcon },
  { href: "https://github.com/AndruTRADX/Reactivities-Api", label: "API", icon: ServerStack03Icon },
]

function NavItemLink({
  item,
  mobile,
  onNavigate,
}: {
  item: NavItem
  mobile?: boolean
  onNavigate?: () => void
}) {
  return (
    <NavLink to={item.to} end={item.end} onClick={onNavigate}>
      {({ isActive }) => (
        <Button
          variant="ghost"
          className={cn(
            mobile && "w-full justify-start",
            isActive ? "text-primary hover:text-primary/80" : "text-foreground"
          )}
        >
          {item.label}
        </Button>
      )}
    </NavLink>
  )
}

function UserAvatar({ imageUrl, displayName }: { imageUrl?: string | null; displayName: string }) {
  if (!imageUrl) return <HugeiconsIcon icon={UserCircleIcon} className="text-primary min-w-5" />

  return (
    <Avatar size="sm">
      <AvatarImage
        src={imageUrl.replace("/upload/", "/upload/w_30,h_30,c_fill,f_auto,dpr_2/")}
        alt={displayName}
      />
      <AvatarFallback>{displayName}</AvatarFallback>
    </Avatar>
  )
}

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

  const closeMobileMenu = useCallback(() => setMobileMenuOpen(false), [])

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
        {NAV_ITEMS.map(item => (
          <NavItemLink key={item.to} item={item} />
        ))}
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
            <DropdownMenuRadioGroup value={theme} onValueChange={value => setTheme(value as Theme)}>
              {THEME_OPTIONS.map(({ value, label, icon }) => (
                <DropdownMenuRadioItem
                  key={value}
                  value={value}
                  className="data-[state=checked]:text-primary [&_svg]:data-[state=checked]:text-primary"
                >
                  <HugeiconsIcon icon={icon} className="min-w-5" />
                  {label}
                </DropdownMenuRadioItem>
              ))}
            </DropdownMenuRadioGroup>
          </DropdownMenuContent>
        </DropdownMenu>

        {user ? (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline">
                <UserAvatar imageUrl={user.imageUrl} displayName={user.displayName} />
                {user.displayName}'s Profile
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="w-40" align="end">
              <DropdownMenuGroup>
                <DropdownMenuLabel>My Account</DropdownMenuLabel>
                <DropdownMenuItem onClick={() => navigate(`/profile/${user.id}`)}>
                  <UserAvatar imageUrl={user.imageUrl} displayName={user.displayName} />
                  Profile
                </DropdownMenuItem>
              </DropdownMenuGroup>
              <DropdownMenuSeparator />
              <DropdownMenuGroup>
                <DropdownMenuLabel>GitHub</DropdownMenuLabel>
                {GITHUB_LINKS.map(({ href, label, icon }) => (
                  <DropdownMenuItem key={href} onClick={() => window.open(href, "_blank")}>
                    <HugeiconsIcon icon={icon} className="min-w-5" />
                    {label}
                  </DropdownMenuItem>
                ))}
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
            {NAV_ITEMS.map(item => (
              <NavItemLink key={item.to} item={item} mobile onNavigate={closeMobileMenu} />
            ))}
          </div>

          <DropdownMenuSeparator className="my-2" />

          <div className="flex flex-col gap-1 px-6">
            <span className="text-sm text-muted-foreground px-2">Theme</span>
            <div className="flex gap-2">
              {THEME_OPTIONS.map(({ value, label, icon }) => (
                <Button
                  key={value}
                  variant={theme === value ? "secondary" : "ghost"}
                  size="icon"
                  onClick={() => setTheme(value)}
                >
                  <HugeiconsIcon icon={icon} className="min-w-5" />
                  <span className="sr-only">{label}</span>
                </Button>
              ))}
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
                  <UserAvatar imageUrl={user.imageUrl} displayName={user.displayName} />
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
