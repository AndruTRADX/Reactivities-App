import { useForm } from "react-hook-form"
import { useLoginAccount } from "@account/hooks/api/useAccount"
import { zodResolver } from "@hookform/resolvers/zod"
import { LoginRequestSchema, type LoginRequest } from "@account/schemas/request/LoginRequest"
import { useMemo } from "react"
import { toast } from "sonner"
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
import TextInput from "@sharedForms/TextInput"
import { Button } from "@sharedUi/button"
import { Spinner } from "@sharedUi/spinner"
import { Link, useLocation, useNavigate } from "react-router"
import { FieldDescription, FieldGroup, FieldSeparator } from "@sharedUi/field"

export default function LoginForm() {
  const { isPendingLoginAccount, loginAccountAsync } = useLoginAccount()
  const navigate = useNavigate()
  const location = useLocation()

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
        navigate(location.state?.from || "/activities")
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
        <CardTitle className="flex items-center gap-2 text-xl">
          <span className="bg-primary/10 text-primary flex h-9 w-9 items-center justify-center rounded-full">
            <HugeiconsIcon icon={Login01Icon} className="h-5 w-5" />
          </span>
          Sign in
        </CardTitle>
        <CardDescription className="mt-2">
          Join your friends and discover activities happening around you
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form id="login-form" onSubmit={form.handleSubmit(onSubmit)}>
          <FieldGroup>
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
          </FieldGroup>
        </form>

        <FieldSeparator className="my-4" />

        <FieldDescription className="text-center">
          Don't have an account?{" "}
          <Link to="/register" className="text-primary underline">
            Register.
          </Link>
        </FieldDescription>
      </CardContent>
      <CardFooter className="flex gap-2 justify-end">
        <Button type="button" variant="outline" onClick={() => form.reset()}>
          Reset
        </Button>
        <Button type="submit" form="login-form" disabled={isDisabled}>
          {isSubmitting ? (
            <>
              <Spinner /> Signing in
            </>
          ) : (
            "Sign in"
          )}
        </Button>
      </CardFooter>
    </Card>
  )
}
