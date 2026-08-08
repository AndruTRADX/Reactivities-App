import * as signalR from "@microsoft/signalr"

const getHubBaseUrl = () => import.meta.env.VITE_HUB_URL

/**
 * Builds a configured SignalR connection, the socket-transport equivalent of
 * `agent.ts`'s `axios.create({...})`. Unlike `agent`, this can't be a shared
 * instance - a HubConnection is stateful and scoped to one hub connection for
 * its whole life - so this centralizes shared *config* (base URL, credentials,
 * reconnect policy) instead, and callers own the connection's lifecycle
 * (`.start()`/`.stop()`, event handlers) themselves.
 */
export const createHubConnection = (hubPath: string, queryParams: Record<string, string> = {}) => {
  const query = new URLSearchParams(queryParams).toString()
  const url = `${getHubBaseUrl()}${hubPath}${query ? `?${query}` : ""}`

  const builder = new signalR.HubConnectionBuilder()
    .withUrl(url, { withCredentials: true })
    .withAutomaticReconnect()

  if (import.meta.env.DEV) {
    builder.configureLogging(signalR.LogLevel.Critical)
  }

  return builder.build()
}
