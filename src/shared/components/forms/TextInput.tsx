import { type FieldValues, useController, type UseControllerProps } from "react-hook-form"
import { Input } from "@sharedUi/input"
import { Textarea } from "@sharedUi/textarea"
import { Field, FieldLabel, FieldDescription, FieldError } from "@sharedUi/field"

type BaseProps<T extends FieldValues> = {
  label?: string
  description?: string
} & UseControllerProps<T>

type TextInputProps<T extends FieldValues> = BaseProps<T> & (
  | ({ multiline?: false } & Omit<React.InputHTMLAttributes<HTMLInputElement>, "defaultValue" | "name">)
  | ({ multiline: true; rows?: number } & Omit<React.TextareaHTMLAttributes<HTMLTextAreaElement>, "defaultValue" | "name">)
)

export default function TextInput<T extends FieldValues>({
  label,
  description,
  multiline = false,
  ...props
}: TextInputProps<T>) {
  const {
    field: { onChange, onBlur, value, ref },
    fieldState: { error },
  } = useController(props)

  const commonProps = {
    id: props.name,
    onChange,
    onBlur,
    value: value ?? "",
    ref,
    "aria-invalid": !!error,
  }

  return (
    <Field className="mb-3">
      {label && <FieldLabel htmlFor={props.name}>{label}</FieldLabel>}
      {description && <FieldDescription>{description}</FieldDescription>}

      {multiline ? (
        <Textarea
          {...(props as React.TextareaHTMLAttributes<HTMLTextAreaElement>)}
          {...commonProps}
          rows={"rows" in props ? props.rows : 3}
        />
      ) : (
        <Input
          {...(props as React.InputHTMLAttributes<HTMLInputElement>)}
          {...commonProps}
        />
      )}

      {error && <FieldError>{error.message}</FieldError>}
    </Field>
  )
}