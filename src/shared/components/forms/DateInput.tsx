import { useState, useEffect, useMemo } from "react"
import { format } from "date-fns"
import type { Matcher } from "react-day-picker"
import { Calendar01Icon } from "@hugeicons/core-free-icons"
import { HugeiconsIcon } from "@hugeicons/react"
import { type FieldValues, useController, type UseControllerProps } from "react-hook-form"

import { Button } from "@sharedUi/button"
import { Calendar } from "@sharedUi/calendar"
import { Field, FieldDescription, FieldError, FieldLabel } from "@sharedUi/field"
import { Input } from "@sharedUi/input"
import { Popover, PopoverContent, PopoverTrigger } from "@sharedUi/popover"
import { cn } from "@/shared/lib/utils"

type Props<T extends FieldValues> = {
  label?: string
  description?: string
  placeholder?: string
  withTime?: boolean
  fromDate?: Date
  toDate?: Date
} & UseControllerProps<T>

export default function DateInput<T extends FieldValues>({
  label,
  description,
  placeholder = "Pick a date",
  withTime = false,
  fromDate,
  toDate,
  ...props
}: Props<T>) {
  const {
    field: { onChange, value, ref },
    fieldState: { error },
  } = useController(props)

  const [selectedDate, setSelectedDate] = useState<Date | undefined>(undefined)
  const [timeString, setTimeString] = useState<string>("")

  useEffect(() => {
    if (value) {
      const date = (value as any) instanceof Date ? (value as Date) : new Date(value as any)
      setSelectedDate(date)
      setTimeString(format(date, "HH:mm:ss"))
    } else {
      setSelectedDate(undefined)
      setTimeString("")
    }
  }, [value])

  const startMonth = useMemo(() => {
    return fromDate ? new Date(fromDate.getFullYear(), fromDate.getMonth(), 1) : undefined
  }, [fromDate])

  const endMonth = useMemo(() => {
    return toDate ? new Date(toDate.getFullYear(), toDate.getMonth(), 1) : undefined
  }, [toDate])

  const defaultMonth = useMemo(() => {
    const month = selectedDate || fromDate || new Date()
    if (startMonth && month < startMonth) return startMonth
    if (endMonth && month > endMonth) return endMonth
    return new Date(month.getFullYear(), month.getMonth(), 1)
  }, [selectedDate, startMonth, endMonth, fromDate])

  const updateValue = (date: Date | undefined, time: string) => {
    if (!date) {
      onChange(undefined)
      return
    }

    const [hours, minutes, seconds] = time ? time.split(":").map(Number) : [0, 0, 0]

    const combined = new Date(
      date.getFullYear(),
      date.getMonth(),
      date.getDate(),
      hours,
      minutes,
      seconds
    )
    onChange(combined)
  }

  const handleDateSelect = (date: Date | undefined) => {
    setSelectedDate(date)
    updateValue(date ?? undefined, timeString)
  }

  const handleTimeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newTime = e.target.value
    setTimeString(newTime)
    updateValue(selectedDate, newTime)
  }

  const hiddenMatchers: Matcher[] = []
  if (fromDate) {
    hiddenMatchers.push({ before: fromDate })
  }
  if (toDate) {
    hiddenMatchers.push({ after: toDate })
  }

  const displayText = value
    ? withTime
      ? format(value, "PPP - hh:mm:ss aa")
      : format(value, "PPP")
    : placeholder

  return (
    <Field className="mb-3">
      {label && <FieldLabel htmlFor={props.name}>{label}</FieldLabel>}
      {description && <FieldDescription>{description}</FieldDescription>}

      <div className={cn("flex gap-2", withTime && "items-center")}>
        <Popover>
          <PopoverTrigger asChild>
            <Button
              id={props.name}
              ref={ref}
              variant={"outline"}
              className={cn(
                "justify-start text-left font-normal",
                withTime ? "flex-1" : "w-full",
                !value && "text-muted-foreground"
              )}
            >
              <HugeiconsIcon icon={Calendar01Icon} className="mr-2 h-4 w-4" />
              {displayText}
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-auto p-0">
            <Calendar
              mode="single"
              selected={selectedDate}
              onSelect={handleDateSelect}
              defaultMonth={defaultMonth}
              startMonth={startMonth}
              endMonth={endMonth}
              hidden={hiddenMatchers.length > 0 ? hiddenMatchers : undefined}
            />
          </PopoverContent>
        </Popover>

        {withTime && (
          <Input
            type="time"
            step="1"
            value={timeString}
            onChange={handleTimeChange}
            className="w-36"
          />
        )}
      </div>

      {error && <FieldError>{error.message}</FieldError>}
    </Field>
  )
}
