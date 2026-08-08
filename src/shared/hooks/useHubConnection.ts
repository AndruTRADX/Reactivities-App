import { useEffect, useRef } from "react"
import { HubConnectionState, type HubConnection } from "@microsoft/signalr"
import { createHubConnection } from "@/shared/services/hubConnection"

// eslint-disable-next-line @typescript-eslint/no-explicit-any -- matches HubConnection.on's own (...args: any[]) => any signature
type HubEventHandlers = Record<string, (...args: any[]) => void>

interface UseHubConnectionOptions {
  /** Skip connecting until this is true (e.g. an id the hub route needs isn't known yet). Defaults to true. */
  enabled?: boolean
  /** Registered on the connection before `.start()`, so no early server message can be missed. */
  handlers?: HubEventHandlers
  /** Runs once the connection is live - the place for an initial `connection.invoke(...)`. */
  onConnected?: (connection: HubConnection) => void | Promise<void>
  /** Runs for a connect/onConnected failure. Not called for a connection torn down by this hook's own cleanup. */
  onError?: (err: unknown) => void
  /** Runs on cleanup, after the connection has been told to stop. */
  onDisconnected?: () => void
}

/**
 * Owns a SignalR connection's lifecycle: builds it (via createHubConnection),
 * wires `handlers` before starting, starts it, and stops it on cleanup -
 * guarding against acting on a connection that was torn down mid-negotiate
 * (React StrictMode's double-effect in dev, or a real unmount) so callers
 * never see a spurious "stopped during negotiation" error. Returns a ref to
 * the live connection for callers to `.invoke(...)` from mutations etc.
 *
 * `handlers`/`onConnected`/`onError`/`onDisconnected` are captured once per
 * connection (keyed on `hubPath` + `queryParams`) and intentionally excluded
 * from the effect's dependencies - re-running them on every render would
 * tear down and reconnect the socket for no reason.
 */
export const useHubConnection = (
  hubPath: string,
  queryParams: Record<string, string>,
  { enabled = true, handlers, onConnected, onError, onDisconnected }: UseHubConnectionOptions = {}
) => {
  const connectionRef = useRef<HubConnection | null>(null)
  const queryParamsKey = JSON.stringify(queryParams)

  useEffect(() => {
    if (!enabled) return

    let isCancelled = false
    const connection = createHubConnection(hubPath, queryParams)
    connectionRef.current = connection

    for (const [event, handler] of Object.entries(handlers ?? {})) {
      connection.on(event, handler)
    }

    connection
      .start()
      .then(() => {
        if (isCancelled) return
        return onConnected?.(connection)
      })
      .catch(err => {
        if (isCancelled) return
        onError?.(err)
      })

    return () => {
      isCancelled = true
      connectionRef.current = null
      void connection.stop()
      onDisconnected?.()
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps -- handlers/onConnected/onError/onDisconnected are captured once per connection (see doc comment); queryParams is tracked via queryParamsKey
  }, [enabled, hubPath, queryParamsKey])

  return connectionRef
}

/**
 * Invokes a hub method via the ref returned by useHubConnection, raising a
 * consistent "Not connected" error instead of each caller re-checking
 * connection state before every `.invoke(...)`.
 */
export const invokeHubMethod = <T = void>(
  connectionRef: ReturnType<typeof useHubConnection>,
  methodName: string,
  ...args: unknown[]
): Promise<T> => {
  const connection = connectionRef.current
  if (!connection || connection.state !== HubConnectionState.Connected) {
    throw new Error("Not connected")
  }
  return connection.invoke<T>(methodName, ...args)
}
