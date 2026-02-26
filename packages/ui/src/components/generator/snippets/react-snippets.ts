export interface Snippet {
  label: string;
  insertText: string;
  detail: string;
  documentation?: string;
}

export const reactSnippets: Snippet[] = [
  {
    label: 'useState',
    insertText:
      'const [${1:state}, set${1/(.*)/${1:/capitalize}/}] = useState(${2:initialValue});',
    detail: 'React useState hook',
    documentation:
      'Declare a state variable with its setter function.',
  },
  {
    label: 'useEffect',
    insertText: [
      'useEffect(() => {',
      '\t${1:// effect}',
      '\treturn () => {',
      '\t\t${2:// cleanup}',
      '\t};',
      '}, [${3:deps}]);',
    ].join('\n'),
    detail: 'React useEffect hook',
  },
  {
    label: 'useRef',
    insertText:
      'const ${1:ref} = useRef<${2:HTMLDivElement}>(null);',
    detail: 'React useRef hook',
  },
  {
    label: 'useMemo',
    insertText:
      'const ${1:value} = useMemo(() => ${2:computation}, [${3:deps}]);',
    detail: 'React useMemo hook',
  },
  {
    label: 'component',
    insertText: [
      'interface ${1:Component}Props {',
      '\t${2:children: React.ReactNode;}',
      '}',
      '',
      'export function ${1:Component}({ ${3:children} }: ${1:Component}Props) {',
      '\treturn (',
      '\t\t<div>${4:}</div>',
      '\t);',
      '}',
    ].join('\n'),
    detail: 'React function component',
    documentation:
      'Create a typed React function component with props interface.',
  },
  {
    label: 'forwardRef',
    insertText: [
      'const ${1:Component} = React.forwardRef<${2:HTMLDivElement}, ${1:Component}Props>(',
      '\t({ ${3:children}, ...props }, ref) => {',
      '\t\treturn <div ref={ref} {...props}>${4:}</div>;',
      '\t}',
      ');',
      '${1:Component}.displayName = "${1:Component}";',
    ].join('\n'),
    detail: 'React forwardRef component',
  },
  {
    label: 'event-handler',
    insertText:
      'const handle${1:Click} = (e: React.${2:MouseEvent}<${3:HTMLButtonElement}>) => {\n\t${4:}\n};',
    detail: 'Typed event handler',
  },
  {
    label: 'context',
    insertText: [
      'const ${1:Name}Context = React.createContext<${2:ContextType} | null>(null);',
      '',
      'export function use${1:Name}() {',
      '\tconst ctx = React.useContext(${1:Name}Context);',
      '\tif (!ctx) throw new Error("use${1:Name} must be used within ${1:Name}Provider");',
      '\treturn ctx;',
      '}',
    ].join('\n'),
    detail: 'React context with typed hook',
  },
  {
    label: 'cn-classname',
    insertText:
      'className={cn("${1:base-classes}", ${2:conditional && "active-class"})}',
    detail: 'Conditional className with cn()',
  },
  {
    label: 'async-handler',
    insertText: [
      'const handle${1:Submit} = async () => {',
      '\ttry {',
      '\t\t${2:}',
      '\t} catch (err) {',
      '\t\tconsole.error(err);',
      '\t}',
      '};',
    ].join('\n'),
    detail: 'Async event handler with error handling',
  },
];
