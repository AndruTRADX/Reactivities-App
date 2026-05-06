import { type FieldValues, useController, type UseControllerProps } from "react-hook-form"
import { Field, FieldLabel, FieldDescription, FieldError } from "@sharedUi/field"
import { useState } from "react"
import type { LocationIQSuggestion } from "@/shared/types"
import { Input } from "@sharedUi/input"

type Props<T extends FieldValues> = {
  label?: string
  description?: string
} & UseControllerProps<T> &
  Omit<React.InputHTMLAttributes<HTMLInputElement>, "defaultValue" | "name"> &
  Omit<React.TextareaHTMLAttributes<HTMLTextAreaElement>, "defaultValue" | "name">

export default function TextInput<T extends FieldValues>({
  label,
  description,
  ...props
}: Props<T>) {
  const {
    field: { onChange, onBlur, value, ref },
    fieldState: { error },
  } = useController(props)
  const [loading, setLoading] = useState(false)
  const [suggestions, useSuggestions] = useState<LocationIQSuggestion[]>([])

  const renderInput = () => {
    const commonProps = {
      id: props.name,
      onChange,
      onBlur,
      value: value || "",
      ref,
      "aria-invalid": !!error,
      placeholder: props.placeholder,
      disabled: props.disabled,
    }

    return (
      <Input
        {...commonProps}
        type={props.type || "text"}
        {...(props as React.InputHTMLAttributes<HTMLInputElement>)}
        placeholder={loading ? "Loading" : "Find your location"}
      />
    )
  }

  return (
    <Field className="mb-3">
      {label && <FieldLabel htmlFor={props.name}>{label}</FieldLabel>}
      {description && <FieldDescription>{description}</FieldDescription>}
      {renderInput()}
      {error && <FieldError>{error.message}</FieldError>}
    </Field>
  )
}
