import { Button } from "@sharedUi/button"
import { defaultImage64 } from "@/shared/constants/defaultImage"
import { Avatar, AvatarFallback, AvatarImage } from "@sharedUi/avatar"

export default function ProfileHeader() {
  return (
    <div className="w-full relative flex flex-col">
      <div id="gradient-profile" className="bg-profile-header h-36"></div>
      <div>
        <div className="flex items-center gap-4 absolute top-22 left-3 p-2.75 rounded-2xl bg-background/40 backdrop-blur-lg max-w-142 h-46">
          <Avatar className="w-40 h-40">
            <AvatarImage src={defaultImage64} alt="something" className="rounded-xl" />
            <AvatarFallback>something</AvatarFallback>
          </Avatar>
        </div>
        <div className="pl-54 flex justify-between mt-6 px-2">
          <div className="flex gap-4">
            <div className="flex flex-col gap-6 max-w-88">
              <div className="flex flex-col gap-1">
                <h2 className="font-semibold text-foreground text-lg">Andres Rodriguez</h2>
                <p className="text-muted-foreground text-xs">
                  Lorem ipsum dolor sit amet consectetur, adipisicing elit. Minus esse ipsum quasi
                  corporis ullam, aliquam deleniti!
                </p>
              </div>
              <Button>Follow</Button>
            </div>
          </div>

          <div className="flex gap-6 items-center">
            <div className="flex flex-col items-center">
              <p className="text-muted-foreground text-xs">Followers</p>
              <h1 className="text-3xl text-foreground">67</h1>
            </div>
            <div className="flex flex-col items-center">
              <p className="text-muted-foreground text-xs">Following</p>
              <h1 className="text-3xl text-foreground">67</h1>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
