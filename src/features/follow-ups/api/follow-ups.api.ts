// The old flat `/follow-ups` endpoint no longer exists on the backend - it
// was split into follow-up cycles and follow-up tasks (two route groups).
// This barrel re-exports both so existing `import { X } from './follow-ups.api'`
// call sites keep working; prefer importing directly from the split files in
// new code.
export * from './follow-up-cycles.api';
export * from './follow-up-tasks.api';
