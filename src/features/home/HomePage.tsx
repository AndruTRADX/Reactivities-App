import { Activity } from "@hugeicons/core-free-icons"
import { HugeiconsIcon } from "@hugeicons/react"
import { Button } from "@sharedUi/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@sharedUi/card"
import { Link } from "react-router"

export default function HomePage() {
  return (
    <div className="flex items-center justify-center h-full">
      <Card className="w-full max-w-md -mt-20">
        <CardHeader className="text-center">
          <CardTitle className="flex justify-center items-center gap-2 text-4xl font-bold">
            <HugeiconsIcon icon={Activity} size={44} className="text-primary" />
            Reactivities</CardTitle>
          <CardDescription className="text-base mt-3">
            Discover and join activities in your community. Connect with others and make memorable experiences.
          </CardDescription>
        </CardHeader>
        <CardContent className="flex justify-center pt-6">
          <Link to="/activities" className="w-full">
            <Button size="lg" className="w-full">
              Start Now
            </Button>
          </Link>
        </CardContent>
      </Card>
    </div>
  )
}