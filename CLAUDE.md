# ReactivitiesApp — Instructions for Claude

## Writing documentation (`docs/*.md`)

These rules apply to every new or edited doc in `docs/` and are non-negotiable — they exist because the docs previously accumulated duplicated explanations and hard-coded app entities, and had to be cleaned up once already. Don't let it happen again.

1. **One topic per doc, single source of truth.** Before writing, skim `docs/` for a doc that already owns the topic. If one exists, extend it — don't create a second doc that re-explains the same thing.
2. **Cross-reference, never repeat.** If a doc needs to mention something fully explained elsewhere, link to it (`[topic](./other-doc.md#anchor)`) instead of restating the explanation in prose. If you catch yourself writing a paragraph that duplicates reasoning already written in another doc, delete it and link instead.
3. **Entity-agnostic examples only — this is the one most likely to be forgotten.** Never illustrate a pattern using this app's real domain entities (`Activity`, `Attendee`, `Comment`, etc.). They are business concepts that can be renamed, removed, or restructured; the docs describe *patterns*, not *this week's schema*. Use generic boilerplate names instead:
   - `Entity` for a top-level domain object — `EntityRequest`, `EntityResponse`, `useGetEntity`, `useGetEntities`, `CreateEntityRequest`, `useCreateEntity`, `["entities"]` / `["entity", id]`.
   - `Item` for a resource nested under an `Entity` — `useGetItems`, `ItemResponse`, `["entity", entityId, "items"]`.
   - `src/features/<feature>/...` for file paths — never a real feature folder name like `activities/`.
   - **Exception:** a doc describing actual, current infrastructure or config may state the real value — e.g. a real `tsconfig` path alias (`path-aliases.md`), a real `localStorage` key. Genericizing those would make the doc factually wrong. The rule is about illustrative examples of a pattern, not about hiding real config.
4. **Split overloaded docs.** If a doc accumulates more than one clearly distinct topic (check its own title — if the title needs "and" twice, it's already overloaded), split it before adding more. One doc, one title, one topic.
5. **Update the index.** Any new or renamed doc must be added/updated in the topic tables in both `README.md` and `.claude/commands/conventions.md`.

Before considering a documentation task done, re-read what you wrote and ask: does any other doc already say this, and did I name-drop a real app entity anywhere?
