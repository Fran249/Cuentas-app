import type { DataClient } from "./types"
import { createLocalStorageClient } from "./local/localStorageClient"

export type { DataClient } from "./types"

let client: DataClient | null = null

/**
 * Single swap point for the data layer. Replace the factory call with
 * `createSupabaseClient()` when migrating off localStorage.
 */
export function getDataClient(): DataClient {
  if (!client) {
    client = createLocalStorageClient()
  }
  return client
}

/** Overrides the active client (tests, or a future Supabase implementation). */
export function setDataClient(next: DataClient): void {
  client = next
}
