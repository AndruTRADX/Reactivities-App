# LocationIQ — Address Search & Geocoding

This document covers the LocationIQ integration: address autocomplete and geocoding for an entity's location. It's the first doc under `docs/integrations/` — see [the top of this folder's purpose](../../README.md#integrations) for why third-party service integrations get their own subfolder, separate from this app's business-logic docs.

---

## What it's for

Picking a venue needs two things a plain text field can't give you: search-as-you-type suggestions, and coordinates to actually place a marker on a map. LocationIQ's search API provides both — given a partial address string, it returns matching places with a `lat`/`lon` pair attached. This app currently uses it in one place: the location field on an entity's create/update form.

Rendering the resulting coordinates afterward (`MapDisplay`) is a separate concern from resolving them — see [Reading the result: `MapDisplay`](#reading-the-result-mapdisplay) below.

---

## Why this bypasses `agent.ts`

[`agent.ts`](../api-hooks.md#agentts--the-http-client-in-detail) is built specifically for *this app's own backend*: it assumes every response is wrapped in `ApiResponse<T>` and unwraps it via a response interceptor, and it assumes 4xx/5xx errors follow this app's `ProblemDetailsResponse<T>` shape. LocationIQ is an unrelated external API — it returns a bare JSON array, authenticates via a `key` query-string param instead of a cookie, and has nothing to do with this app's error-toast/redirect conventions. Routing it through `agent` would mean fighting the interceptors, not benefiting from them.

Instead, `LocationInput.tsx` imports the plain `axios` package directly — not the configured `agent` instance:

```ts
import axios from "axios"
```

**The gotcha:** `agent.ts`'s `declare module "axios"` augmentation (documented [here](../api-hooks.md#module-augmentation--removing-the-axiosresponse-wrapper)) patches the `AxiosInstance` type *globally*. That means TypeScript thinks a plain `axios.get<T>(...)` call returns `Promise<T>` directly too — but only the `agent` instance actually has the unwrapping response interceptor attached at runtime. A bare `axios.get` still resolves to the real `AxiosResponse<T>`, with the payload one level deeper, at `.data`. The code handles this with an explicit cast and a comment marking it as intentional, not a mistake to "clean up":

```ts
// agent.ts's axios module augmentation is global, so TS thinks this returns
// LocationIQSuggestion[] directly — but this plain `axios` import has no
// response interceptor to unwrap it, so it's really an AxiosResponse at runtime.
const res = (await axios.get(locationIqUrl(q))) as unknown as { data: LocationIQSuggestion[] }
setSuggestions(Array.isArray(res.data) ? res.data : [])
```

Any future integration that imports plain `axios` (not `agent`) needs the same `.data` unwrap and the same reasoning — the type system won't warn you, because the augmentation makes the wrong code compile cleanly.

---

## The pieces

### 1. Config — `src/shared/config/index.ts`

```ts
const LOCATION_IQ_API_URL = import.meta.env.VITE_LOCATION_IQ_API_URL
const LOCATION_IQ_ACCESS_TOKEN = import.meta.env.VITE_LOCATION_IQ_ACCESS_TOKEN

export const locationIqUrl = (query: string) =>
  `${LOCATION_IQ_API_URL}?key=${LOCATION_IQ_ACCESS_TOKEN}&q=${encodeURIComponent(query)}&limit=5&dedupe=1&format=json&`
```

Both env vars are set up as part of local dev setup — see the [README's environment variable table](../../README.md#2-configure-environment-variables). `locationIqUrl` is the single place the query string (search term, result limit, dedupe, format) is built; nothing else constructs a LocationIQ URL by hand.

### 2. `LocationInput` — `src/shared/components/forms/LocationInput.tsx`

The RHF-bound field, wired via `useController`/`control`/`name` like every other component in `forms/` — see [forms.md](../forms.md) for that pattern generally and [ui-components.md](../ui-components.md#where-a-new-component-belongs-forms-vs-common-vs-ui) for why this lives in `forms/` and not `common/`.

- **Debounced search.** Input changes go through `debounce(fetchSuggestions, 300)` (`src/shared/lib/utils.ts`) — one request per pause in typing, not one per keystroke, against a metered third-party API.
- **3-character minimum.** Below that, suggestions are cleared without a request — too short to return anything useful.
- **The field value is a single composite object**, not a string: `{ venue, city, latitude, longitude }`. Selecting a suggestion sets all four at once via `field.onChange(...)`. This nested shape is exactly the pattern documented in [backend-context.md's "Request shape: flat in backend, nested in frontend"](../backend-context.md#request-shape-flat-in-backend-nested-in-frontend) — the backend's `EntityRequest` takes `Venue`/`City`/`Latitude`/`Longitude` as flat top-level fields, and the form flattens `location` back out at submit time (`const { location, ...rest } = data; const flattenedData = { ...rest, ...location }`).
- **Response shape** — `LocationIQSuggestion`/`LocationIQAddress` in `src/shared/types/index.d.ts` — is the raw LocationIQ payload shape, kept as its own type rather than folded into any app schema, since it's an external contract this app doesn't control.

### 3. Reading the result: `MapDisplay`

`src/shared/components/common/MapDisplay.tsx` renders the *already-resolved* coordinates on a map — it never calls LocationIQ itself:

```tsx
type Props = {
  position: [number, number]
  venue: string
}
```

It's built on `react-leaflet` + OpenStreetMap tiles (no API key required for tile rendering), and lives in `common/` rather than `forms/` because it's a plain, unbound display component — the same `forms/` vs. `common/` split as `LocationInput`. Callers pass the `latitude`/`longitude` already stored on the fetched entity (e.g. `position={[entity.latitude, entity.longitude]}` on a details page) — LocationIQ's job ends the moment those coordinates are saved.

---

## Gotchas

- **Never call LocationIQ through `agent`.** Its envelope and error shape don't match this app's backend — always use plain `axios` with the manual `.data` unwrap shown above.
- **Don't remove the debounce or the 3-character minimum** without a reason — they exist to keep request volume reasonable against a metered API, not as arbitrary polish.
- **Adding a second external API?** Give it its own `docs/integrations/<service>.md` following this doc's shape (why it needs its own client, config, the actual usage, gotchas) — see [CLAUDE.md](../../CLAUDE.md) for the rule.
