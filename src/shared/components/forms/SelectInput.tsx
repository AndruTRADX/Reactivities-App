import {
  Combobox,
  ComboboxContent,
  ComboboxEmpty,
  ComboboxInput,
  ComboboxItem,
  ComboboxList,
} from "@sharedUi/combobox"
import { Field, FieldLabel, FieldDescription, FieldError } from "@sharedUi/field"
import { useController, type FieldValues, type UseControllerProps } from "react-hook-form"

type Item = {
  label: string
  value: string
}

type Props<T extends FieldValues> = {
  label?: string
  description?: string
  placeholder?: string
  items: Item[]
} & UseControllerProps<T>

export function SelectInput<T extends FieldValues>({
  label,
  description,
  placeholder,
  items,
  ...props
}: Props<T>) {
  const {
    field,
    fieldState: { error },
  } = useController(props)

  const selectedItem = items.find(item => item.value === field.value) ?? null

  const handleSelect = (selected: Item | null) => {
    if (selected) {
      field.onChange(selected.value)
    } else {
      field.onChange('') // or whatever default, maybe empty string
    }
  }

  return (
    <Field className="mb-3">
      {label && <FieldLabel htmlFor={props.name}>{label}</FieldLabel>}
      {description && <FieldDescription>{description}</FieldDescription>}

      <Combobox
        items={items}
        itemToStringValue={(item: Item) => item.label}
        value={selectedItem}
        onValueChange={handleSelect}
      >
        <ComboboxInput placeholder={placeholder || "Select..."} aria-invalid={!!error} disabled={props.disabled} />
        <ComboboxContent>
          <ComboboxEmpty>No items found.</ComboboxEmpty>
          <ComboboxList>
            {(item) => (
              <ComboboxItem key={item.value} value={item}>
                {item.label}
              </ComboboxItem>
            )}
          </ComboboxList>
        </ComboboxContent>
      </Combobox>

      {error && <FieldError>{error.message}</FieldError>}
    </Field>
  )
}