# Backend Context

This document covers backend patterns that are relevant when writing frontend code — understanding them prevents shape mismatches and explains why certain frontend conventions exist.

## CQRS with MediatR

Every operation is an `IRequest<T>` dispatched by MediatR to its handler. Controllers only call `mediator.Send(...)` — no business logic lives in them.

The base route is `api/[controller]`, so `EntitiesController` → `api/entities`.

### Entity endpoints

| Method | Route | Body | Returns |
|---|---|---|---|
| GET | `/api/entities/{id}` | — | `ApiResponse<EntityResponse>` |
| GET | `/api/entities` | `[FromQuery]` pagination params | `ApiResponse<PagedResponse<EntityResponse>>` |
| POST | `/api/entities` | `CreateEntityRequest` | `ApiResponse<string>` (the new id) |
| PUT | `/api/entities` | `UpdateEntityRequest` | `ApiResponse<Unit>` |
| PATCH | `/api/entities/{id}/cancel` | `CancelEntityRequest` | `ApiResponse<Unit>` |

## `ApiResponse<T>` — the response envelope

```csharp
new ApiResponse()          // { success: true, message: "Operation successful", data: null }
new ApiResponse(T data)    // { success: true, data: data }
```

The frontend never sees `success: false` through the success interceptor — errors always arrive as HTTP exceptions (4xx, 5xx) and are handled by dedicated `ExceptionHandler` classes.

## Backend validation (FluentValidation)

Validation runs as a MediatR pipeline behavior before the handler executes. On failure it returns HTTP 400 with:

```json
{
  "errors": {
    "Title": ["Title is required", "Title must have at least 3 characters"],
    "Date": ["Date must be in the future"]
  }
}
```

`agent.ts` formats this into a readable toast automatically. The frontend also validates with Zod before sending — **double validation is intentional** so neither side depends solely on the other.

## Request shape: flat in backend, nested in frontend

A backend request can have related fields at the top level:

```csharp
public string Street { get; set; }
public string City { get; set; }
public double Latitude { get; set; }
public double Longitude { get; set; }
```

The frontend can group fields like these into a nested object (e.g. `address`) so a single custom shared form component binds them as one controlled field, following the pattern in [forms.md](./forms.md#adding-a-new-shared-component). The flattening back to a flat shape happens in `onSubmit`, before calling the mutation hook.

## Exception handling

All HTTP error shapes match the `ProblemDetailsResponse<T>` frontend type. The `errors` field is `Record<string, string[]>` on the frontend, matching `Dictionary<string, string[]>` on the backend — this is what the 400 error interceptor in `agent.ts` iterates to build per-field toast messages.
