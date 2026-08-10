import DOMPurify from 'dompurify';

/**
 * Single chokepoint for sanitising staff-authored rich text before it is ever
 * rendered via `dangerouslySetInnerHTML`.
 *
 * Historically this app's trust model was "staff author it, staff read it" -
 * campaigns and announcements were HTML strings produced by the in-house
 * WYSIWYG editor and only ever shown back to other logged-in staff. The
 * public event registration page (`/e/:slug`) broke that assumption: it
 * renders admin-authored `event.description` HTML to anyone on the internet,
 * logged in or not. That means a compromised or careless staff account (or a
 * bug in the editor that lets raw HTML through) is now a public XSS surface,
 * not just an internal one - so every render site needs to go through this
 * helper, no exceptions.
 *
 * Allowlist rationale - this covers everything the WYSIWYG editor's toolbar
 * can actually produce (headings, bold/italic/underline, lists, links,
 * images, alignment via block-level tags) and nothing else:
 *   - Structure: h1-h4, p, br, blockquote
 *   - Inline emphasis: b, strong, i, em, u, s, strike, del
 *   - Lists: ul, ol, li
 *   - Links: a (href/title only - see hook below for rel/target)
 *   - Media: img (src/alt/width/height only)
 *
 * Everything else - <script>, <style>, <iframe>, <object>, <embed>,
 * <form>, <svg>, event handler attributes (onerror, onload, onclick, ...),
 * inline `style`, and `javascript:`/`data:` URLs - is dropped. We use an
 * explicit ALLOWED_ATTR allowlist rather than trying to blocklist "on*"
 * attributes, since an allowlist can't be bypassed by a new/unexpected
 * handler name the way a blocklist can.
 */

const ALLOWED_TAGS = [
  'h1',
  'h2',
  'h3',
  'h4',
  'p',
  'br',
  'b',
  'strong',
  'i',
  'em',
  'u',
  's',
  'strike',
  'del',
  'ul',
  'ol',
  'li',
  'blockquote',
  'a',
  'img',
];

const ALLOWED_ATTR = ['href', 'title', 'src', 'alt', 'width', 'height'];

// DOMPurify's default ALLOWED_URI_REGEXP only whitelists a handful of
// schemes (http, https, mailto, tel, ...) for every URI attribute (href,
// src, ...) and rejects anything else, including `javascript:`. That
// regexp alone does NOT block `data:`, though: DOMPurify has a separate
// `DATA_URI_TAGS` allowlist (defaulting to img/audio/video/source/...) that
// deliberately lets `data:` URIs through on those tags' `src` for inline
// base64 images - and critically that default can't be cleared via the
// `sanitize()` config (`DATA_URI_TAGS` there is additive-only, merged onto
// the built-in default, never a replacement). Left alone, that would let a
// `data:image/svg+xml,<svg onload=...>` payload through as an <img src>.
// There's no legitimate need for inline data-URI images here (the media
// library returns hosted URLs), so the hook below strips `data:` image
// sources explicitly rather than relying on sanitize() config for it.
const DATA_URI_PREFIX = /^\s*data:/i;

let hooksInstalled = false;

function installHooksOnce() {
  if (hooksInstalled) return;
  hooksInstalled = true;

  DOMPurify.addHook('afterSanitizeAttributes', (node) => {
    // Force every surviving link to be safe to open from admin-authored
    // content rendered to anonymous visitors: `rel="noopener noreferrer"`
    // always (prevents reverse-tabnabbing / leaking a `window.opener`
    // reference), and `target="_blank"` so an external link from a public
    // event page doesn't navigate the visitor away from the registration
    // flow they're in the middle of.
    if (node.tagName === 'A' && node.hasAttribute('href')) {
      node.setAttribute('rel', 'noopener noreferrer');
      node.setAttribute('target', '_blank');
    }

    // See DATA_URI_PREFIX comment above - close the img data: URI gap that
    // DOMPurify's own config can't close.
    if (node.tagName === 'IMG' && DATA_URI_PREFIX.test(node.getAttribute('src') ?? '')) {
      node.removeAttribute('src');
    }
  });
}

/**
 * Sanitise a staff-authored HTML string for safe rendering via
 * `dangerouslySetInnerHTML`. Returns an empty string for null/undefined so
 * call sites don't need their own null-guard.
 */
export function sanitizeHtml(dirty: string | null | undefined): string {
  if (!dirty) return '';

  installHooksOnce();

  return DOMPurify.sanitize(dirty, {
    ALLOWED_TAGS,
    ALLOWED_ATTR,
    ALLOW_DATA_ATTR: false,
    FORBID_TAGS: ['script', 'style', 'iframe', 'object', 'embed', 'form', 'svg', 'link', 'meta', 'base'],
    FORBID_ATTR: ['style'],
  });
}
