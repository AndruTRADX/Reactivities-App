import { format } from "date-fns"
import { Calendar01Icon } from "@hugeicons/core-free-icons"
import { HugeiconsIcon } from "@hugeicons/react"
import { type FieldValues, useController, type UseControllerProps } from "react-hook-form"

import { Button } from "@sharedUi/button"
import { Calendar } from "@sharedUi/calendar"
import { Field, FieldDescription, FieldError, FieldLabel } from "@sharedUi/field"
import { Popover, PopoverContent, PopoverTrigger } from "@sharedUi/popover"
import { cn } from "@/shared/lib/utils"

type Props<T extends FieldValues> = {
  label?: string
  description?: string
  placeholder?: string
} & UseControllerProps<T>

export default function DateInput<T extends FieldValues>({
  label,
  description,
  placeholder = "Pick a date",
  ...props
}: Props<T>) {
  const {
    field: { onChange, value, ref },
    fieldState: { error },
  } = useController(props)

  return (
    <Field className="mb-3">
      {label && <FieldLabel htmlFor={props.name}>{label}</FieldLabel>}
      {description && <FieldDescription>{description}</FieldDescription>}
      <Popover>
        <PopoverTrigger asChild>
          <Button
            id={props.name}
            ref={ref}
            variant={"outline"}
            className={cn(
              "w-full justify-start text-left font-normal",
              !value && "text-muted-foreground"
            )}
          >
            <HugeiconsIcon icon={Calendar01Icon} className="mr-2 h-4 w-4" />
            {value ? format(value, "PPP") : <span>{placeholder}</span>}
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-auto p-0">
          <Calendar mode="single" selected={value} onSelect={onChange} initialFocus />
        </PopoverContent>
      </Popover>
      {error && <FieldError>{error.message}</FieldError>}
    </Field>
  )
}