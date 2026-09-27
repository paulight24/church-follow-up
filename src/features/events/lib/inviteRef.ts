/**
 * The per-person link code a visitor arrived with (`/e/slug?r=abc123`).
 *
 * It has to survive longer than the URL that carried it. A visitor switches
 * the page to Spanish, or reloads after a validation error, or comes back
 * from the Open Mic form — and each of those drops the query string. Losing
 * the code there would quietly hand the registrant to nobody, which is the
 * one failure this feature cannot report: the form still succeeds, the
 * attribution just never happens.
 *
 * sessionStorage rather than localStorage: it belongs to this visit. A phone
 * passed around a room should not keep giving everyone afterwards to
 * whoever's link was opened first.
 */
const KEY_PREFIX = 'eventInviteRef:';

function key(slug: string): string {
  return `${KEY_PREFIX}${slug}`;
}

/** Reads `?r=` and remembers it for the rest of this visit. */
export function captureInviteRef(slug: string, search: string = window.location.search): string | null {
  const fromUrl = new URLSearchParams(search).get('r')?.trim();
  if (fromUrl) {
    try {
      sessionStorage.setItem(key(slug), fromUrl);
    } catch {
      // Private browsing can throw. The code is still used for this page
      // load, it just will not survive a reload.
    }
    return fromUrl;
  }
  try {
    return sessionStorage.getItem(key(slug));
  } catch {
    return null;
  }
}

/** Cleared once a registration is in, so a second person on the same phone
 *  is not attributed to the first one's link. */
export function clearInviteRef(slug: string): void {
  try {
    sessionStorage.removeItem(key(slug));
  } catch {
    // Nothing to do — a stale code only matters if it is read back.
  }
}
