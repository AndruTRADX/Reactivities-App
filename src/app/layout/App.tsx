import { ConfirmDialog } from "@/shared/components/ConfirmDialog"
import Navbar from "@/shared/components/Navbar"
import { Outlet, ScrollRestoration } from "react-router"
import { Toaster } from "sonner"
import { ThemeProvider } from "./ThemeProvider"

function App() {
  return (
    <ThemeProvider defaultTheme="system" storageKey="reactivities-ui-theme">
      <div>
        <Navbar />
        <ConfirmDialog />
        <ScrollRestoration />
        <Toaster richColors />
        <main
          id="reactivities-main-container"
          className="flex flex-col w-full pt-17 px-5.5 bg-primary-foreground h-dvh overflow-y-auto scroll-fade"
        >
          <div className="w-full mx-auto max-w-7xl pt-4 pb-6 flex-1">
            <Outlet />
          </div>
        </main>
      </div>
    </ThemeProvider>
  )
}

export default App
