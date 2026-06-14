import { useForm } from "react-hook-form"
import { useLoginAccount } from "../hooks/api/useAccount"
import { zodResolver } from "@hookform/resolvers/zod"
import { LoginRequestSchema, type LoginRequest } from "../schemas/request/LoginRequest"
import { useMemo } from "react"
import { toast } from "sonner"
import { useNavigate } from "react-router"
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@sharedUi/card"
import { HugeiconsIcon } from "@hugeicons/react"
import { Login01Icon } from "@hugeicons/core-free-icons"
import TextInput from "@/shared/components/forms/TextInput"
import { Button } from "@/shared/components/ui/button"
import { Spinner } from "@/shared/components/ui/spinner"

export default function LoginForm() {
  const navigate = useNavigate()
  const { isPendingLoginAccount, loginAccountAsync } = useLoginAccount()

  const form = useForm({
    resolver: zodResolver(LoginRequestSchema),
    mode: "onTouched",
  })

  const {
    formState: { isValid },
  } = form

  async function onSubmit(data: LoginRequest) {
    await loginAccountAsync(data, {
      onSuccess: () => {
        toast.success("Welcome back!")
        form.reset()
        navigate(`/activities`)
      },
      onError: error => {
        toast.error(`Error trying to sign in: ${error.message}`)
      },
    })
  }

  const isSubmitting = useMemo(() => {
    return isPendingLoginAccount
  }, [isPendingLoginAccount])

  const isDisabled = useMemo(() => {
    return isPendingLoginAccount || !isValid
  }, [isPendingLoginAccount, isValid])

  return (
    <Card className="w-full sm:max-w-xl">
      <CardHeader>
        <CardTitle className="flex gap-2">
          <HugeiconsIcon icon={Login01Icon} className="text-primary" /> Sign in
        </CardTitle>
        <CardDescription>
          Join your friends and discover activities happening around you
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form id="form-rhf-demo" onSubmit={form.handleSubmit(onSubmit)}>
          <TextInput
            label="Email"
            type="email"
            control={form.control}
            name="email"
            placeholder="ryangosling@acme.com"
          />
          <TextInput
            label="Password"
            control={form.control}
            type="password"
            name="password"
            placeholder="Enter your password"
          />
        </form>
      </CardContent>
      <CardFooter className="flex gap-2 justify-end">
        <Button type="button" variant="outline" onClick={() => form.reset()}>
          Reset
        </Button>
        <Button type="submit" form="form-rhf-demo" disabled={isDisabled}>
          {isSubmitting ? (
            <>
              <Spinner /> Signing in
            </>
          ) : (
            "Log in"
          )}
        </Button>
      </CardFooter>
    </Card>
  )
}
