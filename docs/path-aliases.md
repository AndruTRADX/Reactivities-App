# Path Aliases

Always use them — never long relative paths.

Adding or changing an alias requires updating all three of these files in sync, or the build/editor/type-checker will disagree with each other:
- `tsconfig.json`
- `tsconfig.app.json`
- `vite.config.ts`

| Alias | Resolves to |
|---|---|
| `@/*` | `src/*` |
| `@activities/*` | `src/features/activities/*` |
| `@account/*` | `src/features/account/*` |
| `@profile/*` | `src/features/profile/*` |
| `@sharedUi/*` | `src/shared/components/ui/*` |
| `@sharedForms/*` | `src/shared/components/forms/*` |
| `@sharedHooks/*` | `src/shared/hooks/*` |
| `@sharedSchemas/*` | `src/shared/schemas/*` |
