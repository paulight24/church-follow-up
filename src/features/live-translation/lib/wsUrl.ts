/** WebSocket endpoints live on the API server's origin (same HTTP server),
 *  not under the /api/v1 path — derive ws(s)://host from VITE_API_URL. */
export function wsBaseUrl(): string {
  const api = new URL(import.meta.env.VITE_API_URL as string, window.location.origin);
  const proto = api.protocol === 'https:' ? 'wss:' : 'ws:';
  return `${proto}//${api.host}`;
}
