# ReactivitiesApp

Frontend for the Reactivities project. Built with React 19, TypeScript, Vite, TanStack Query, React Hook Form, Zod, and Shadcn/ui.

## Prerequisites

- [Node.js](https://nodejs.org/) 20+
- [pnpm](https://pnpm.io/) — install with `npm install -g pnpm`
- The backend (`ReactivitiesApi`) running locally — the app will not function without it

## Setup

### **1. Install dependencies**

```bash
pnpm install
```

### **2. Configure environment variables**

Copy the example file and fill in the values:

```bash
cp .env.example .env.development
```

| Variable | Description |
|---|---|
| `VITE_API_URL` | Backend base URL (e.g. `https://localhost:5001/api`) |
| `VITE_LOCATION_IQ_API_URL` | LocationIQ autocomplete endpoint |
| `VITE_LOCATION_IQ_ACCESS_TOKEN` | LocationIQ API key |

### **3. Start the dev server**

```bash
pnpm dev
```

The app runs at `http://localhost:5173` by default.

## Other scripts

| Command | Description |
|---|---|
| `pnpm build` | Type-check + production build |
| `pnpm preview` | Serve the production build locally |
| `pnpm lint` | Run ESLint |

## Project conventions

Before writing any form, hook, or schema, read the relevant doc:

| Topic | Doc |
|---|---|
| Pages (naming, feature folder structure, routing) | [docs/pages.md](./docs/pages.md) |
| Path aliases | [docs/path-aliases.md](./docs/path-aliases.md) |
| Zod schemas (request & response) | [docs/schemas.md](./docs/schemas.md) |
| Forms (React Hook Form, components, skeleton) | [docs/forms.md](./docs/forms.md) |
| API hooks (useQuery, useMutation, agent.ts) | [docs/api-hooks.md](./docs/api-hooks.md) |
| Pagination (any paginated list, single or nested) | [docs/pagination.md](./docs/pagination.md) |
| Theming (colors, dark mode, backdrop-blur) | [docs/theming.md](./docs/theming.md) |
| UI components (shadcn, where new components live) | [docs/ui-components.md](./docs/ui-components.md) |
| Loading states (skeletons) | [docs/loading-states.md](./docs/loading-states.md) |
| Confirm dialog (global confirmation, useConfirmDialog) | [docs/confirm-dialog.md](./docs/confirm-dialog.md) |
| Backend context (CQRS, ApiResponse, validation) | [docs/backend-context.md](./docs/backend-context.md) |
