import { escapeHtml, sanitizeString } from '../src/utils/sanitize';

describe('sanitize utils', () => {
  describe('escapeHtml', () => {
    it('escapes HTML special characters', () => {
      expect(escapeHtml('<script>alert(1)</script>')).toBe(
        '<script>alert(1)<&#x2F;script>',
      );
    });

    it('escapes ampersands', () => {
      expect(escapeHtml('Tom & Jerry')).toBe('Tom & Jerry');
    });
  });

  describe('sanitizeString', () => {
    it('removes control characters and trims', () => {
      expect(sanitizeString('  hello\u0000\u001F world  ')).toBe('hello world');
    });
  });
});
