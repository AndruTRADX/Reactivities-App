import {
  activityFilterOptions,
  activitySortLabels,
  activitySortOptions,
  type ActivityFilter,
  type ActivitySort,
} from "@activities/schemas/request/ActivitySpecificationParams"
import { ComboboxSelect } from "@/shared/components/common/ComboboxSelect"
import { RadioGroup, RadioGroupItem } from "@sharedUi/radio-group"
import { Label } from "@sharedUi/label"

const filterLabels: Record<"toolbar" | "sidebar", Record<ActivityFilter, string>> = {
  toolbar: { all: "All", going: "Going", hosting: "Hosting" },
  sidebar: { all: "All", going: "I'm going", hosting: "I'm hosting" },
}

interface Props {
  variant: "toolbar" | "sidebar"
  sort: ActivitySort | undefined
  filter: ActivityFilter
  onSortChange: (sort: ActivitySort) => void
  onFilterChange: (filter: ActivityFilter) => void
}

export function ActivityFilters({ variant, sort, filter, onSortChange, onFilterChange }: Props) {
  const labels = filterLabels[variant]

  const sortSelect = (
    <ComboboxSelect
      value={sort}
      onValueChange={value => value && onSortChange(value as ActivitySort)}
      placeholder="Default"
      items={activitySortOptions.map(option => ({
        label: activitySortLabels[option],
        value: option,
      }))}
    />
  )

  const filterGroup = (
    <RadioGroup
      value={filter}
      onValueChange={value => value && onFilterChange(value as ActivityFilter)}
      className={variant === "toolbar" ? "flex w-fit flex-row flex-wrap gap-3" : "w-fit"}
    >
      {activityFilterOptions.map(option => (
        <div
          key={option}
          className={
            variant === "toolbar" ? "flex items-center gap-1.5" : "flex items-center gap-3"
          }
        >
          <RadioGroupItem value={option} id={`activity-filter-${variant}-${option}`} />
          <Label htmlFor={`activity-filter-${variant}-${option}`}>{labels[option]}</Label>
        </div>
      ))}
    </RadioGroup>
  )

  if (variant === "toolbar") {
    return (
      <>
        <div className="min-w-36 flex-1">{sortSelect}</div>
        {filterGroup}
      </>
    )
  }

  return (
    <>
      <div className="flex flex-col gap-2">
        <Label>Sort by</Label>
        {sortSelect}
      </div>
      {filterGroup}
    </>
  )
}
