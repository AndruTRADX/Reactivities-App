import { useForm } from "react-hook-form"
import { useRegisterAccount } from "../hooks/api/useAccount"
import { zodResolver } from "@hookform/resolvers/zod"
import { RegisterUserRequestSchema, type RegisterUserRequest } from "../schemas/request/RegisterUserRequest"
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
import { UserAdd01Icon } from "@hugeicons/core-free-icons"
import TextInput from "@/shared/components/forms/TextInput"
import { Button } from "@/shared/components/ui/button"
import { Spinner } from "@/shared/components/ui/spinner"
import { useNavigate } from "react-router"

export default function RegisterForm() {
  const { isPendingRegisterAccount, registerAccountAsync } = useRegisterAccount()
  const navigate = useNavigate()

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
        toast.success("Account created successfully!")
        form.reset()
        navigate("/login")
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
        <CardTitle className="flex gap-2">
          <HugeiconsIcon icon={UserAdd01Icon} className="text-primary" /> Create account
        </CardTitle>
        <CardDescription>
          Join your friends and discover activities happening around you
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form id="form-register" onSubmit={form.handleSubmit(onSubmit)}>
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
            label="Biography"
            control={form.control}
            name="biography"
            placeholder="Tell us a bit about yourself (optional)"
          />
          <TextInput
            label="Profile image URL"
            control={form.control}
            name="imageUrl"
            placeholder="https://example.com/avatar.png (optional)"
          />
        </form>
      </CardContent>
      <CardFooter className="flex gap-2 justify-end">
        <Button type="button" variant="outline" onClick={() => form.reset()}>
          Reset
        </Button>
        <Button type="submit" form="form-register" disabled={isDisabled}>
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