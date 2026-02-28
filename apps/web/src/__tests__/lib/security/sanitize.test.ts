import { sanitizeText, sanitizeHtml, escapeForAttribute } from '@/lib/security/sanitize';

describe('sanitizeText', () => {
  it('encodes HTML tags as entities', () => {
    expect(sanitizeText('<b>bold</b>')).toBe('&lt;b&gt;bold&lt;/b&gt;');
  });

  it('encodes script tags', () => {
    expect(sanitizeText('hello<script>alert("xss")</script>world')).toBe(
      'hello&lt;script&gt;alert(&quot;xss&quot;)&lt;/script&gt;world'
    );
  });

  it('encodes event handler attributes', () => {
    expect(sanitizeText('<div onload="alert(1)">content</div>')).toBe(
      '&lt;div onload=&quot;alert(1)&quot;&gt;content&lt;/div&gt;'
    );
  });

  it('preserves plain text', () => {
    expect(sanitizeText('Hello, world!')).toBe('Hello, world!');
  });

  it('trims whitespace', () => {
    expect(sanitizeText('  hello  ')).toBe('hello');
  });

  it('encodes nested tags', () => {
    expect(sanitizeText('<div><span>text</span></div>')).toBe(
      '&lt;div&gt;&lt;span&gt;text&lt;/span&gt;&lt;/div&gt;'
    );
  });

  it('handles empty string', () => {
    expect(sanitizeText('')).toBe('');
  });

  it('encodes ampersands in text', () => {
    expect(sanitizeText('a & b')).toBe('a &amp; b');
  });
});

describe('sanitizeHtml', () => {
  it('encodes all HTML entities', () => {
    expect(sanitizeHtml('<b>bold</b>')).toBe('&lt;b&gt;bold&lt;/b&gt;');
  });

  it('encodes script tags', () => {
    expect(sanitizeHtml('<script>xss</script>')).toBe('&lt;script&gt;xss&lt;/script&gt;');
  });
});

describe('escapeForAttribute', () => {
  it('escapes ampersands', () => {
    expect(escapeForAttribute('a&b')).toBe('a&amp;b');
  });

  it('escapes double quotes', () => {
    expect(escapeForAttribute('a"b')).toBe('a&quot;b');
  });

  it('escapes angle brackets', () => {
    expect(escapeForAttribute('<script>')).toBe('&lt;script&gt;');
  });

  it('escapes single quotes', () => {
    expect(escapeForAttribute("a'b")).toBe('a&#x27;b');
  });

  it('handles clean strings', () => {
    expect(escapeForAttribute('hello')).toBe('hello');
  });
});
