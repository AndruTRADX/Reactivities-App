import { UserSearch } from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react";
import { Button } from "../ui/button";


export default function Navbar() {
  return (
    <nav className="z-50 fixed w-full flex justify-between px-5.5 py-2.5 bg-primary-foreground/50 backdrop-blur-xs border-b border-border">
      <div className="flex text-primary items-center gap-1">
        <HugeiconsIcon icon={UserSearch} strokeWidth={2} />
        <h3 className="font-semibold text-lg">Reactivities</h3>
      </div>

      <div className="flex gap-2">
        <Button variant='ghost'>Activities</Button>
        <Button variant='ghost'>About</Button>
        <Button variant='ghost'>Contact</Button>
      </div>

      <Button>Create Activity</Button>
    </nav>
  )
}