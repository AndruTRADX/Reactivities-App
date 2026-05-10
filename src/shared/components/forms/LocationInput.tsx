import { type FieldValues, useController, type UseControllerProps } from "react-hook-form"
import { Field, FieldLabel, FieldDescription, FieldError } from "@sharedUi/field"
import { useCallback, useEffect, useMemo, useState } from "react"
import type { LocationIQSuggestion } from "@/shared/types"
import { Command, CommandInput, CommandList, CommandItem, CommandEmpty } from "@sharedUi/command"
import axios from "axios"
import { locationIqUrl } from "@/shared/config"
import { Spinner } from "@sharedUi/spinner"
import { debounce } from "@/shared/lib/utils"
import { HugeiconsIcon } from "@hugeicons/react"
import { MapPin } from "@hugeicons/core-free-icons"

type Props<T extends FieldValues> = {
  label?: string
  description?: string
  placeholder?: string
} & UseControllerProps<T>

export default function LocationInput<T extends FieldValues>({
  label,
  description,
  placeholder,
  ...props
}: Props<T>) {
  const {
    field,
    fieldState: { error },
  } = useController(props)

  const [query, setQuery] = useState("")
  const [suggestions, setSuggestions] = useState<LocationIQSuggestion[]>([])
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    const value = field.value
    if (value && typeof value === "object" && "venue" in value) {
      setQuery(value.venue)
    } else if (typeof value === "string") {
      setQuery(value)
    } else {
      setQuery("")
    }
  }, [field.value])

  const fetchSuggestions = useCallback(async (q: string) => {
    if (!q || q.length < 3) {
      setSuggestions([])
      return
    }
    setLoading(true)
    try {
      const res = await axios.get(locationIqUrl(q))
      const data = Array.isArray(res) ? res : (res as any).data
      setSuggestions(Array.isArray(data) ? data : [])
    } catch (error) {
      setSuggestions([])
    } finally {
      setLoading(false)
    }
  }, [])

  const debouncedFetch = useMemo(() => debounce(fetchSuggestions, 300), [fetchSuggestions])

  const handleInputChange = (value: string) => {
    setQuery(value)
    debouncedFetch(value)

    if (value === "") {
      field.onChange({ venue: "", city: "", latitude: 0, longitude: 0 })
      setSuggestions([])
    }
  }

  const handleSelect = (placeId: string) => {
    const location = suggestions.find(s => s.place_id === placeId)
    if (!location) return

    const city = location.address?.city || ""
    const venue = location.display_name
    const latitude = parseFloat(location.lat)
    const longitude = parseFloat(location.lon)

    setQuery(venue)
    field.onChange({ city, venue, latitude, longitude })
    setSuggestions([])
  }

  return (
    <Field className="mb-3">
      {label && <FieldLabel htmlFor={props.name}>{label}</FieldLabel>}
      {description && <FieldDescription>{description}</FieldDescription>}

      <Command shouldFilter={false} className="relative">
        <CommandInput
          placeholder={placeholder || "Search location..."}
          value={query}
          onValueChange={handleInputChange}
          onBlur={field.onBlur}
          disabled={props.disabled}
          aria-invalid={!!error}
        />
        {loading && (
          <div className="absolute right-3 top-1/2 -translate-y-1/2">
            <Spinner />
          </div>
        )}

        {(loading || suggestions.length > 0 || (query.length > 0 && query.length < 3)) && (
          <CommandList className="mt-2">
            {loading && suggestions.length === 0 && (
              <CommandEmpty>
                <Spinner /> Loading...
              </CommandEmpty>
            )}
            {!loading && query.length > 0 && query.length < 3 && (
              <CommandEmpty>Keep typing to search...</CommandEmpty>
            )}
            {!loading && query.length >= 3 && suggestions.length === 0 && (
              <CommandEmpty>No results found.</CommandEmpty>
            )}
            {suggestions.map((item, index) => (
              <CommandItem
                key={`${item.place_id}-${item.class}-${item.type}-${index}`}
                value={item.place_id}
                onSelect={() => handleSelect(item.place_id)}
              >
                <HugeiconsIcon icon={MapPin}  />
                {item.display_name}
              </CommandItem>
            ))}
          </CommandList>
        )}
      </Command>

      {error && <FieldError>{error.message}</FieldError>}
    </Field>
  )
}
