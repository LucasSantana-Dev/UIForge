import { reactSnippets, type Snippet } from './snippets/react-snippets';
import { tailwindSnippets } from './snippets/tailwind-snippets';
import { shadcnSnippets } from './snippets/shadcn-snippets';

type Monaco = any;

function toCompletionItems(monaco: Monaco, snippets: Snippet[], range: any) {
  return snippets.map((s) => ({
    label: s.label,
    kind: monaco.languages.CompletionItemKind.Snippet,
    insertText: s.insertText,
    insertTextRules: monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet,
    detail: s.detail,
    documentation: s.documentation,
    range,
  }));
}

export function registerSizaCompletions(
  monaco: Monaco,
  framework: string,
  componentLibrary: string
) {
  const disposables: any[] = [];

  const languages = ['typescript', 'typescriptreact', 'javascript', 'javascriptreact'];
  for (const lang of languages) {
    const disposable = monaco.languages.registerCompletionItemProvider(lang, {
      triggerCharacters: ['<', '.', 'u', 'c'],
      provideCompletionItems(model: any, position: any) {
        const word = model.getWordUntilPosition(position);
        const range = {
          startLineNumber: position.lineNumber,
          endLineNumber: position.lineNumber,
          startColumn: word.startColumn,
          endColumn: word.endColumn,
        };

        const items: any[] = [];

        if (framework === 'react' || framework === 'nextjs') {
          items.push(...toCompletionItems(monaco, reactSnippets, range));
        }

        items.push(...toCompletionItems(monaco, tailwindSnippets, range));

        if (componentLibrary === 'shadcn') {
          items.push(...toCompletionItems(monaco, shadcnSnippets, range));
        }

        return { suggestions: items };
      },
    });
    disposables.push(disposable);
  }

  return () => disposables.forEach((d) => d.dispose());
}
