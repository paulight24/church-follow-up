/** Fills {{1}}, {{2}}, ... in a WhatsApp template body with the given params, leaving unset ones visible as placeholders. */
export function fillWhatsAppTemplate(body: string, params: string[]): string {
  return body.replace(/\{\{(\d+)\}\}/g, (match, indexStr: string) => {
    const value = params[Number(indexStr) - 1];
    return value && value.trim() ? value : match;
  });
}
