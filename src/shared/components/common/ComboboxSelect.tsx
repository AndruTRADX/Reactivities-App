import {
  Combobox,
  ComboboxContent,
  ComboboxEmpty,
  ComboboxInput,
  ComboboxItem,
  ComboboxList,
} from "@sharedUi/combobox"

type Item = {
  label: string
  value: string
}

type Props = {
  items: Item[]
  value: string | undefined
  onValueChange: (value: string | undefined) => void
  placeholder?: string
  disabled?: boolean
}

export function ComboboxSelect({ items, value, onValueChange, placeholder, disabled }: Props) {
  const selectedItem = items.find(item => item.value === value) ?? null

  const handleSelect = (selected: Item | null) => {
    onValueChange(selected?.value)
  }

  return (
    <Combobox
      items={items}
      itemToStringValue={(item: Item) => item.label}
      value={selectedItem}
      onValueChange={handleSelect}
    >
      <ComboboxInput placeholder={placeholder || "Select..."} disabled={disabled} />
      <ComboboxContent>
        <ComboboxEmpty>No items found.</ComboboxEmpty>
        <ComboboxList>
          {item => (
            <ComboboxItem key={item.value} value={item}>
              {item.label}
            </ComboboxItem>
          )}
        </ComboboxList>
      </ComboboxContent>
    </Combobox>
  )
}
