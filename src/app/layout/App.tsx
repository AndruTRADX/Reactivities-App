import { ConfirmDialog } from "@/components/shared/ConfirmDialog"
import Navbar from "@/components/shared/Navbar"
import ActivityPage from "@/features/activities/ActivityPage"

function App() {
  return (
    <div>
      <Navbar />
      <ConfirmDialog />
      <main className="pt-17 pb-6 px-5.5 bg-primary-foreground min-h-dvh">
        <ActivityPage />
      </main>
    </div>
  )
}

export default App
