import { ConfirmDialog } from "@/shared/components/ConfirmDialog"
import Navbar from "@/shared/components/Navbar"
import { Outlet } from "react-router"

function App() {
  return (
    <div>
      <Navbar />
      <ConfirmDialog />
      <main className="flex justify-center w-full pt-17 pb-6 px-5.5 bg-primary-foreground min-h-dvh">
        <div className="w-full max-w-7xl gap-3 mt-4">
          <Outlet />
        </div>
      </main>
    </div>
  )
}

export default App
