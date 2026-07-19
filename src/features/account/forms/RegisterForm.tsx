import { useForm } from "react-hook-form"
import { useRegisterAccount } from "@account/hooks/api/useAccount"
import { zodResolver } from "@hookform/resolvers/zod"
import {
  RegisterUserRequestSchema,
  type RegisterUserRequest,
} from "@account/schemas/request/RegisterUserRequest"
import { useMemo } from "react"
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@sharedUi/card"
import { HugeiconsIcon } from "@hugeicons/react"
import { UserAdd01Icon } from "@hugeicons/core-free-icons"
import TextInput from "@sharedForms/TextInput"
import { Button } from "@sharedUi/button"
import { Spinner } from "@sharedUi/spinner"
import { Link } from "react-router"
import { FieldDescription, FieldGroup, FieldSeparator } from "@sharedUi/field"

export default function RegisterForm() {
  const { isPendingRegisterAccount, registerAccountAsync } = useRegisterAccount()

  const form = useForm<RegisterUserRequest>({
    resolver: zodResolver(RegisterUserRequestSchema),
    mode: "onTouched",
  })

  const {
    formState: { isValid },
  } = form

  async function onSubmit(data: RegisterUserRequest) {
    await registerAccountAsync(data, {
      onSuccess: () => {
        form.reset()
      },
    })
  }

  const isSubmitting = useMemo(() => {
    return isPendingRegisterAccount
  }, [isPendingRegisterAccount])

  const isDisabled = useMemo(() => {
    return isPendingRegisterAccount || !isValid
  }, [isPendingRegisterAccount, isValid])

  return (
    <Card className="w-full sm:max-w-xl">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-xl">
          <span className="bg-primary/10 text-primary flex h-9 w-9 items-center justify-center rounded-full">
            <HugeiconsIcon icon={UserAdd01Icon} className="h-5 w-5" />
          </span>
          Create account
        </CardTitle>
        <CardDescription className="mt-2">
          Join your friends and discover activities happening around you
        </CardDescription>
      </CardHeader>

      <CardContent>
        <form id="form-register" onSubmit={form.handleSubmit(onSubmit)}>
          <FieldGroup>
            <TextInput
              label="Email"
              type="email"
              control={form.control}
              name="email"
              placeholder="ryangosling@acme.com"
            />
            <TextInput
              label="Display name"
              control={form.control}
              name="displayName"
              placeholder="Ryan Gosling"
            />
            <TextInput
              label="Password"
              control={form.control}
              type="password"
              name="password"
              placeholder="At least 6 characters"
            />
            <TextInput
              label="Confirm password"
              control={form.control}
              type="password"
              name="confirmPassword"
              placeholder="Re-enter your password"
            />
            <TextInput
              label="Biography"
              control={form.control}
              name="biography"
              placeholder="Tell us a bit about yourself (optional)"
            />
          </FieldGroup>
        </form>

        <FieldSeparator className="my-4" />

        <FieldDescription className="text-center">
          Already have an account?{" "}
          <Link to="/login" className="text-primary underline underline-offset-4">
            Sign in.
          </Link>
        </FieldDescription>
      </CardContent>

      <CardFooter className="flex flex-col gap-2 sm:flex-row sm:justify-end">
        <Button
          type="button"
          variant="outline"
          onClick={() => form.reset()}
          className="w-full sm:w-auto"
        >
          Reset
        </Button>
        <Button
          type="submit"
          form="form-register"
          disabled={isDisabled}
          className="w-full sm:w-auto"
        >
          {isSubmitting ? (
            <>
              <Spinner /> Creating account
            </>
          ) : (
            "Register"
          )}
        </Button>
      </CardFooter>
    </Card>
  )
}
