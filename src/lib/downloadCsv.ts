/**
 * Builds a CSV in the browser and hands it to the download manager.
 *
 * No export dependency — a Blob and an object URL. Extracted because there
 * were already three copies of this (reports, event registrations, and now
 * resource responses), and the one thing worth getting right is the escaping:
 * a prayer request with a comma or a newline in it silently shears a row in
 * two if that is wrong, and nobody notices until the church is reading the
 * wrong person's phone number.
 */
export function downloadCsv(filename: string, rows: Array<Record<string, unknown>>): void {
  if (rows.length === 0) return;
  const headers = Object.keys(rows[0]);
  const escape = (value: unknown) => {
    const str = value == null ? '' : String(value);
    return /[",\n]/.test(str) ? `"${str.replace(/"/g, '""')}"` : str;
  };
  const csv = [headers.join(','), ...rows.map((row) => headers.map((h) => escape(row[h])).join(','))].join('\n');

  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}
