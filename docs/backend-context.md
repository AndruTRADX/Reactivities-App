# Backend Context

This document covers backend patterns that are relevant when writing frontend code — understanding them prevents shape mismatches and explains why certain frontend conventions exist.

## CQRS with MediatR

Every operation is an `IRequest<T>` dispatched by MediatR to its handler. Controllers only call `mediator.Send(...)` — no business logic lives in them.

The base route is `api/[controller]`, so `ActivitiesController` → `api/activities`.

### Activities endpoints

| Method | Route | Body | Returns |
|---|---|---|---|
| GET | `/api/activities/{id}` | — | `ApiResponse<EntityResponse>` |
| GET | `/api/activities` | `[FromQuery]` pagination params | `ApiResponse<PagedResponse<EntityResponse>>` |
| POST | `/api/activities` | `CreateEntityRequest` | `ApiResponse<string>` (the new id) |
| PUT | `/api/activities` | `UpdateEntityRequest` | `ApiResponse<Unit>` |
| PATCH | `/api/activities/{id}/cancel` | `CancelEntityRequest` | `ApiResponse<Unit>` |

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

The backend `CreateEntityRequest` has location fields at the top level:

```csharp
public string Venue { get; set; }
public string City { get; set; }
public double Latitude { get; set; }
public double Longitude { get; set; }
```

The frontend groups them into a `location` object so `LocationInput` works as a single controlled field. The flattening happens in `onSubmit` before calling the mutation hook — see [forms.md](./forms.md#locationinput).

## Exception handling

All HTTP error shapes match the `ProblemDetailsResponse<T>` frontend type. The `errors` field is `Record<string, string[]>` on the frontend, matching `Dictionary<string, string[]>` on the backend — this is what the 400 error interceptor in `agent.ts` iterates to build per-field toast messages.
