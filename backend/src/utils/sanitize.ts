const HTML_ESCAPES: Record<string, string> = {
  '&': '&',
  '<': '<',
  '>': '>',
  '"': '"',
  "'": '\u0027',
  '/': '&#x2F;',
};

export const escapeHtml = (input: string): string =>
  input.replace(/[&<>"'/]/g, (c) => HTML_ESCAPES[c]);

export const sanitizeString = (input: string): string =>
  input.replace(/[\u0000-\u001F\u007F]/g, '').trim();
