import {
  sanitizeText,
  sanitizeHtml,
  escapeForAttribute,
} from '@/lib/security/sanitize';

describe('sanitizeText', () => {
  it('strips HTML tags', () => {
    expect(sanitizeText('<b>bold</b>')).toBe('bold');
  });

  it('strips script tags with content', () => {
    expect(
      sanitizeText('hello<script>alert("xss")</script>world')
    ).toBe('helloworld');
  });

  it('strips event handlers', () => {
    expect(
      sanitizeText('<div onload="alert(1)">content</div>')
    ).toBe('content');
  });

  it('preserves plain text', () => {
    expect(sanitizeText('Hello, world!')).toBe('Hello, world!');
  });

  it('trims whitespace', () => {
    expect(sanitizeText('  hello  ')).toBe('hello');
  });

  it('handles nested tags', () => {
    expect(
      sanitizeText('<div><span>text</span></div>')
    ).toBe('text');
  });

  it('handles empty string', () => {
    expect(sanitizeText('')).toBe('');
  });

  it('strips multiple script tags', () => {
    expect(
      sanitizeText(
        '<script>a</script>safe<script>b</script>'
      )
    ).toBe('safe');
  });
});

describe('sanitizeHtml', () => {
  it('removes script tags but keeps other HTML', () => {
    expect(
      sanitizeHtml('<b>bold</b><script>xss</script>')
    ).toBe('<b>bold</b>');
  });

  it('removes event handlers', () => {
    expect(
      sanitizeHtml('<div onclick="alert(1)">click</div>')
    ).toBe('<div >click</div>');
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
    expect(escapeForAttribute('<script>')).toBe(
      '&lt;script&gt;'
    );
  });

  it('escapes single quotes', () => {
    expect(escapeForAttribute("a'b")).toBe('a&#x27;b');
  });

  it('handles clean strings', () => {
    expect(escapeForAttribute('hello')).toBe('hello');
  });
});
