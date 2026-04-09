import { type FieldValues, useController, type UseControllerProps } from "react-hook-form"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Field, FieldLabel, FieldDescription, FieldError } from "@/components/ui/field"

type Props<T extends FieldValues> = {
  label?: string
  description?: string
  multiline?: boolean
  rows?: number
} & UseControllerProps<T> &
  Omit<React.InputHTMLAttributes<HTMLInputElement>, "defaultValue" | "name"> &
  Omit<React.TextareaHTMLAttributes<HTMLTextAreaElement>, "defaultValue" | "name">

export default function TextInput<T extends FieldValues>({
  label,
  description,
  multiline = false,
  rows = 3,
  ...props
}: Props<T>) {
  const {
    field: { onChange, onBlur, value, ref },
    fieldState: { error },
  } = useController(props)

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

    if (multiline) {
      return (
        <Textarea
          {...commonProps}
          rows={rows}
          {...(props as React.TextareaHTMLAttributes<HTMLTextAreaElement>)}
        />
      )
    }

    return (
      <Input
        {...commonProps}
        type={props.type || "text"}
        {...(props as React.InputHTMLAttributes<HTMLInputElement>)}
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
