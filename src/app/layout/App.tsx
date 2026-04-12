import { ConfirmDialog } from "@/shared/components/ConfirmDialog"
import Navbar from "@/shared/components/Navbar"
import { Outlet } from "react-router"

function App() {
  return (
    <div>
      <Navbar />
      <ConfirmDialog />
      <main className="pt-17 pb-6 px-5.5 bg-primary-foreground min-h-dvh">
        <Outlet />
      </main>
    </div>
  )
}

export default App
