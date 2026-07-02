# Forms — Architecture and Why

This document explains the reasoning behind every decision in the form architecture: why the tools were chosen, how they connect, and the rules that keep form code clean and consistent across the entire app.

---

## The problem with naive form implementations

Before explaining what we do, it helps to understand what we're avoiding.

A naive React form looks like this:

```tsx
// ❌ What we never do
function ActivityForm() {
  const [title, setTitle] = useState("")
  const [titleError, setTitleError] = useState("")
  const [description, setDescription] = useState("")
  const [isSubmitting, setIsSubmitting] = useState(false)

  const validate = () => {
    if (!title) {
      setTitleError("Title is required")
      return false
    }
    if (title.length < 3) {
      setTitleError("Title must be at least 3 characters")
      return false
    }
    setTitleError("")
    return true
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!validate()) return
    setIsSubmitting(true)
    await fetch("/api/activities", { method: "POST", body: JSON.stringify({ title, description }) })
    setIsSubmitting(false)
  }

  return (
    <form onSubmit={handleSubmit}>
      <input value={title} onChange={e => setTitle(e.target.value)} />
      {titleError && <span>{titleError}</span>}
      <input value={description} onChange={e => setDescription(e.target.value)} />
      <button disabled={isSubmitting}>Submit</button>
    </form>
  )
}
```

This is a disaster at scale:

- **Validation logic lives inside the component.** If the same rule needs to apply on the backend, you write it twice. If it changes, you change it in multiple places.
- **Every field needs its own `useState` pair.** A form with 8 fields has 16 state variables before a single line of business logic.
- **Re-renders on every keystroke.** Every `onChange` triggers a full component re-render because state lives in React's tree.
- **No type safety.** The object sent to the API is assembled manually — nothing guarantees it matches what the backend expects.
- **Untestable validation.** The validation logic is buried inside the component and tied to React's rendering cycle.

Our architecture solves every one of these problems.

---

## The architecture: four layers, one responsibility each

```PlainText
┌─────────────────────────────────────────────┐
│  Zod Schema (src/features/.../schemas/)     │  ← What the data looks like + validation rules
├─────────────────────────────────────────────┤
│  Shared Form Components (src/shared/forms/) │  ← How to render a single field
├─────────────────────────────────────────────┤
│  Form Component (src/features/.../forms/)   │  ← How to collect a complete set of data
├─────────────────────────────────────────────┤
│  API Hook (src/features/.../hooks/api/)     │  ← How to send that data to the server
└─────────────────────────────────────────────┘
```

Each layer knows only about the layer below it. The form component doesn't know how the data is sent. The shared components don't know what form they're in. The schema doesn't know about React at all.

---

## Why React Hook Form?

React Hook Form (RHF) solves the two biggest problems with naive forms: **too many re-renders** and **too much boilerplate**.

### Performance: uncontrolled inputs by default

React Hook Form uses **uncontrolled inputs** internally. Instead of storing field values in React state and re-rendering on every keystroke, it uses refs to read the DOM directly. This means:

- Typing in a field does **not** trigger a re-render of the parent form component.
- Only validation state changes (errors appearing/disappearing) trigger re-renders, and only for the affected field.
- A form with 20 fields performs the same as a form with 2 fields.

This matters visibly on slower devices and on forms with expensive renders.

### `useController` — making fields reactive where it counts

Our shared form components use `useController` instead of `register`. The distinction:

- `register` gives you props to spread onto a native input — simple, but limits what you can do.
- `useController` gives you full control over the field: `field.value`, `field.onChange`, `field.onBlur`, `field.ref`, and `fieldState.error`.

`useController` subscribes each field component to only its own slice of form state. When the title field has an error, only `TextInput` for `name="title"` re-renders — not the whole form, not the other fields.

```ts
// Inside TextInput — this is what makes it reactive
const {
  field: { onChange, onBlur, value, ref },
  fieldState: { error },
} = useController(props)
```

The field component is reactive to exactly two things: its own value (via the ref, not state) and its own error state. Nothing else.

### `mode: "onTouched"` — reactivity with good UX

```ts
useForm({ mode: "onTouched" })
```

This controls when validation runs and therefore when errors appear:

| Moment | What happens |
|---|---|
| Component mounts | No validation. `isValid` is `false`. No errors visible. |
| User types in a field | No validation yet. No errors. |
| User leaves the field (blur) | Validation runs for that field. If invalid, error appears. |
| User types again after blur | Validation runs on every keystroke. Error disappears as they fix it. |

The result: errors never appear before the user has interacted with a field, but feedback is instant once they've touched something and moved on. This is the behavior users expect from well-made forms.

---

## Why Zod?

Zod is a TypeScript-first schema validation library. It serves two purposes simultaneously: **runtime validation** and **static type generation**.

```ts
export const EntityRequestSchema = z.object({
  title: requiredString("Title"),
  date: z.coerce.date({ error: "Date is required" }),
  description: requiredString("Description"),
})

export type EntityRequest = z.infer<typeof EntityRequestSchema>
```

`EntityRequest` is not written manually — it is **derived from the schema**. This is the key advantage: the schema and the type are the same thing. There is no way for them to get out of sync.

### Why Zod and RHF work so well together

The bridge is `@hookform/resolvers/zod`:

```ts
const form = useForm<EntityRequest>({
  resolver: zodResolver(EntityRequestSchema),
})
```

`zodResolver` plugs Zod into RHF's validation lifecycle. When RHF needs to validate (on blur, on submit), it passes the current form values to `zodResolver`, which runs them through `EntityRequestSchema.safeParse()` and maps the result back to RHF's error format.

The consequence is a complete separation of concerns:

- **RHF manages form state** — field values, touched state, submission state, dirty state.
- **Zod defines what valid data looks like** — nothing else.
- **`zodResolver` connects them** — a single line, invisible after setup.

### `z.infer` and type safety end to end

Because `EntityRequest` is inferred from the schema, TypeScript enforces the shape at every point in the chain:

```ts
// The form's handleSubmit gives you EntityRequest — guaranteed valid
async function onSubmit(data: EntityRequest) {
  // data.title exists and is a non-empty string — Zod already checked
  // data.date is a Date object — Zod coerced it from whatever the input gave us
  await createEntityAsync(data)  // the hook expects EntityRequest — types match
}
```

If you add a required field to the schema, TypeScript immediately flags every place that constructs that type without the new field. The compiler catches shape mismatches before the app runs.

---

## The shared form components

All form inputs live in `src/shared/components/forms/` and are imported via `@sharedForms/`.

### Why only these components?

**Rule: every input in a form must use a shared form component. No raw `<input>`, `<textarea>`, or `<select>` tags in form code.**

Reasons:

1. **Consistent field layout.** Every field in the app has the same structure: label → description → input → error message. This comes from the `<Field>` → `<FieldLabel>` → `<FieldError>` wrapper inside each shared component. If you use a raw `<input>`, you have to rebuild this structure manually — and it will inevitably differ slightly from every other field.

2. **Automatic error display.** The shared components read `fieldState.error` from RHF and render `<FieldError>` automatically. You never manually wire up error messages. If you use a raw input, you have to do this yourself — and you will forget, and users will see no error message on an invalid field.

   This also means: **there must be no other element in the UI that shows validation errors.** No `{errors.title && <p>...</p>}` next to inputs, no manual error state, no toast on failed validation. The `<FieldError>` inside the shared component is the one and only place where field-level errors appear. If a user submits invalid data, they will see the error directly under the field — nothing else is needed, and adding anything else creates duplicate, inconsistent feedback.

3. **Correct `aria-invalid`.** Each component sets `aria-invalid={!!error}` on the native input element. This is how screen readers know a field has an error. A raw input won't have this unless you add it manually.

4. **One place to change.** If the design system changes how field errors look, you update `TextInput.tsx` and every field in every form in the entire app updates. With raw inputs, you hunt through every form.

### What each component does

#### `TextInput`

The general-purpose text component. Renders either an `<Input>` or `<Textarea>` depending on the `multiline` prop.

```tsx
// Single line
<TextInput control={form.control} name="title" label="Title" placeholder="..." />

// Multiline textarea
<TextInput control={form.control} name="description" multiline rows={3} />
```

Internally defaults `value` to `""` to prevent React's uncontrolled→controlled warning when a field starts as `undefined`.

#### `SelectInput`

Wraps a custom `Combobox` component, not a native `<select>`. The options are a `{ label: string; value: string }[]` array defined locally in the consuming form:

```tsx
const categories = [
  { label: "Music", value: "music" },
  { label: "Culture", value: "culture" },
]

<SelectInput control={form.control} name="category" items={categories} placeholder="Pick a category" />
```

Options are defined in the form component, not inside `SelectInput` — the shared component doesn't know what options any specific form needs.

#### `DateInput`

The most complex shared component. It maintains its own local React state for the selected date and time string, synced with `field.value` via `useEffect`. This is necessary because the date picker and time input are two separate UI elements that must be combined into a single `Date` value for RHF.

```tsx
<DateInput control={form.control} name="date" withTime fromDate={new Date()} />
```

The `field.ref` is forwarded to the calendar trigger button so RHF can programmatically focus the field when needed (e.g. when the user submits with an empty date field).

### Adding a new shared component

If you need an input type that doesn't exist yet, **do not** build it inline in a feature form. Create it in `src/shared/components/forms/` following the same pattern:

```ts
// Every shared form component has this shape
function MyInput<T extends FieldValues>({ label, description, ...props }: MyInputProps<T>) {
  const { field, fieldState: { error } } = useController(props)

  return (
    <Field>
      {label && <FieldLabel>{label}</FieldLabel>}
      {description && <FieldDescription>{description}</FieldDescription>}
      <MyNativeElement {...field} aria-invalid={!!error} />
      {error && <FieldError>{error.message}</FieldError>}
    </Field>
  )
}
```

The pattern is always: `useController` → wrap with `<Field>` → show `<FieldError>` when `error` exists.

---

## Validation lives only in Zod schemas

**Rule: the only place validation logic exists is in the Zod request schema for that feature. Never in components. Never in hooks. Never in `onSubmit`.**

```ts
// ✅ Validation here — and only here
export const EntityRequestSchema = z.object({
  title: requiredString("Title"),           // required, min 1 char
  date: z.coerce.date({ error: "Date is required" }),
  description: requiredString("Description"),
})
```

```tsx
// ❌ Never this — validation does not belong in a component
function onSubmit(data: EntityRequest) {
  if (!data.title) {   // Zod already enforced this — this check is redundant noise
    setError("title", { message: "Title is required" })
    return
  }
  // ...
}
```

Why this matters:

- **Single source of truth.** The validation rule for "title is required" exists in one place. If the rule changes, you change it once.
- **Consistent error messages.** `requiredString("Title")` always produces `"Title is required"`. A manual `if (!data.title)` check produces whatever string you happen to write that day.
- **The form component stays clean.** `onSubmit` receives data that has already passed Zod validation — it can trust the shape completely and focus only on what to do with it.
- **Backend validation is separate.** The backend also validates with FluentValidation. The frontend's Zod validation is not a replacement — it's a UX layer that gives instant feedback without a round trip. Both exist intentionally.

---

## How it all connects

The complete data flow from user input to server response:

```
User types in TextInput
       ↓
useController reads value via ref (no re-render)
       ↓
User blurs the field → RHF triggers zodResolver
       ↓
zodResolver runs EntityRequestSchema.safeParse(formValues)
       ↓
If invalid: fieldState.error is set → FieldError renders → component re-renders
If valid: isValid becomes true → isDisabled becomes false → Submit button enables
       ↓
User clicks Submit → form.handleSubmit(onSubmit) is called
       ↓
zodResolver runs one final full validation pass
       ↓
onSubmit(data: EntityRequest) receives guaranteed-valid, fully-typed data
       ↓
await createEntityAsync(data, { onSuccess: ... })
       ↓
mutationFn: agent.post("/entities", data)
       ↓
Response interceptor unwraps ApiResponse<T> → returns payload
       ↓
onSuccess in hook: queryClient.invalidateQueries(["entities"])
onSuccess at call site: toast + navigate + form.reset()
```

Every step has a single job. The component never validates. The schema never renders. The hook never knows about the form. The agent never knows about React Query.

---

## Handlers and `useCallback`

**Rule: every event handler defined in a component should be wrapped in `useCallback`. If a handler is passed as a prop to another component, this is non-negotiable.**

```ts
// ✅ Handler consumed locally — useCallback preferred
const handleToggleMap = useCallback(() => {
  setMapOpen(prev => !prev)
}, [])

// ✅ Handler passed to a child/modal — useCallback required
const handleCancel = useCallback(async ({ reason }: CancelEntityRequest) => {
  if (!entity) return
  await cancelEntityAsync(
    { id: entity.id, reason },
    {
      onSuccess: () => {
        toast.success("Entity cancelled")
        navigate("/entities")
      },
    }
  )
}, [entity, cancelEntityAsync, navigate])

// Then passed down:
<CancelEntityDialog onConfirm={handleCancel} ... />
```

### Why `useCallback` on every handler

- **Referential stability.** Without `useCallback`, a new function reference is created on every render. Any child component that receives the handler as a prop will see a new prop on every parent render — potentially causing unnecessary re-renders or breaking `React.memo`.
- **Explicit dependencies.** `useCallback` forces you to declare what the handler closes over. This makes stale closure bugs visible at the call site instead of hiding them inside the function body.

### Why it is non-negotiable when crossing component boundaries

When a handler is passed as a prop to a modal, a dialog, or any child component, the child has no way of knowing when the function "changed" in a meaningful way vs. when React just recreated it during a normal re-render. Without `useCallback`:

- The child re-renders every time the parent does, even if nothing relevant changed.
- If the child uses the handler inside its own `useEffect` or `useMemo` dependency array, it will run on every render, potentially causing infinite loops or duplicate API calls.

```ts
// ❌ No useCallback — new function reference on every render
const handleCancel = async ({ reason }: CancelEntityRequest) => {
  await cancelEntityAsync({ id: entity.id, reason })
}

// Passed to a dialog — the dialog sees a "new" onConfirm on every parent render
<CancelEntityDialog onConfirm={handleCancel} />
```

### Placement: before early returns

Hooks cannot be called conditionally in React. Since `useCallback` is a hook, all handlers must be defined **before any early returns** in the component — even if the handler depends on data that may not exist yet (e.g. an entity loaded asynchronously):

```ts
export default function EntityDetailsPage() {
  const { entity } = useGetEntityById(id)

  // ✅ Defined unconditionally, before early returns
  const handleCancel = useCallback(async (data: CancelEntityRequest) => {
    if (!entity) return  // guard inside, not outside the hook
    await cancelEntityAsync(...)
  }, [entity, cancelEntityAsync])

  if (!entity) return <NotFound />  // early return after all hooks

  return <div>...</div>
}
```

---

## Form component skeleton

Baseline structure every form component should follow.

```tsx
import { useMemo } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { toast } from "sonner"
import { useNavigate } from "react-router"

import { Button } from "@sharedUi/button"
import { Spinner } from "@sharedUi/spinner"
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@sharedUi/card"
import TextInput from "@sharedForms/TextInput"

import { EntityRequestSchema, type EntityRequest } from "@<feature>/schemas/request/EntityRequest"
import { useCreateEntity } from "@<feature>/hooks/api/useEntities"

export default function EntityForm() {
  const { createEntityAsync, isPendingCreateEntity } = useCreateEntity()
  const navigate = useNavigate()

  const form = useForm<EntityRequest>({
    resolver: zodResolver(EntityRequestSchema),
    defaultValues: { name: "" },
    mode: "onTouched",
  })

  const { formState: { isValid } } = form

  const isSubmitting = useMemo(() => isPendingCreateEntity, [isPendingCreateEntity])
  const isDisabled = useMemo(() => isPendingCreateEntity || !isValid, [isPendingCreateEntity, isValid])

  async function onSubmit(data: EntityRequest) {
    await createEntityAsync(data, {
      onSuccess: (id) => {
        toast.success("Entity created successfully")
        form.reset()
        navigate(`/entities/${id}`)
      },
    })
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Create Entity</CardTitle>
      </CardHeader>
      <CardContent>
        <form id="entity-form" onSubmit={form.handleSubmit(onSubmit)}>
          <TextInput
            control={form.control}
            name="name"
            label="Name"
            placeholder="Enter name"
          />
        </form>
      </CardContent>
      <CardFooter className="justify-end">
        <Button type="submit" form="entity-form" disabled={isDisabled}>
          {isSubmitting ? (
            <>
              <Spinner /> Submitting
            </>
          ) : (
            "Submit"
          )}
        </Button>
      </CardFooter>
    </Card>
  )
}
```

### `isSubmitting` and `isDisabled` with `useMemo`

These are always derived with `useMemo`, never computed inline in JSX.

```ts
const isSubmitting = useMemo(() => isPendingMutation, [isPendingMutation])
const isDisabled = useMemo(() => isPendingMutation || !isValid, [isPendingMutation, isValid])
```

Why `useMemo` for a boolean:

- **Consistency.** Every form in the project has these two variables in this exact shape. A developer reading any form knows exactly where to look.
- **Extensibility.** When the condition grows — two mutations, a custom gate — the `useMemo` is already there with its dependency array ready to extend.
- **Readability.** JSX stays clean: `disabled={isDisabled}` instead of `disabled={isPendingCreate || isPendingUpdate || !isValid || someOtherCondition}`.

### The `form id` pattern

When the `<form>` element and the `<Button type="submit">` are separated in the DOM (form inside `CardContent`, button inside `CardFooter`), use the HTML `id` attribute to associate them:

```tsx
<form id="entity-form" onSubmit={form.handleSubmit(onSubmit)}>
  ...
</form>

{/* Anywhere in the DOM — standard HTML association, not React magic */}
<Button type="submit" form="entity-form">Submit</Button>
```
