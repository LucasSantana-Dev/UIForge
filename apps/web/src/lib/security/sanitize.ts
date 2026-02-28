function stripScriptContent(input: string): string {
  let result = '';
  let i = 0;
  const lower = input.toLowerCase();
  while (i < input.length) {
    if (
      input[i] === '<' &&
      lower.slice(i, i + 7) === '<script' &&
      (i + 7 >= input.length || /[\s>]/.test(input[i + 7]))
    ) {
      const closeIdx = lower.indexOf('</script>', i);
      if (closeIdx !== -1) {
        i = closeIdx + 9;
        continue;
      }
      break;
    }
    result += input[i];
    i++;
  }
  return result;
}

function stripEventHandlers(input: string): string {
  return input.replace(/\bon\w+=\s*["'][^"']*["']/gi, '');
}

function stripAllTags(input: string): string {
  let result = '';
  let inTag = false;
  for (let i = 0; i < input.length; i++) {
    if (input[i] === '<') inTag = true;
    else if (input[i] === '>') inTag = false;
    else if (!inTag) result += input[i];
  }
  return result;
}

export function sanitizeText(input: string): string {
  const noScripts = stripScriptContent(input);
  const noHandlers = stripEventHandlers(noScripts);
  return stripAllTags(noHandlers).trim();
}

export function sanitizeHtml(input: string): string {
  const noScripts = stripScriptContent(input);
  return stripEventHandlers(noScripts).trim();
}

export function escapeForAttribute(input: string): string {
  return input
    .replace(/&/g, '&amp;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#x27;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;');
}
