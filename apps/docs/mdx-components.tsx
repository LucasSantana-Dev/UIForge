import type { MDXComponents } from 'mdx/types';
import defaultMdxComponents from 'fumadocs-ui/mdx';
import CodeBlock from '@/components/mdx/CodeBlock';
import Callout from '@/components/mdx/Callout';

export function useMDXComponents(components: MDXComponents): MDXComponents {
  return {
    ...defaultMdxComponents,
    ...components,
    pre: (props) => <CodeBlock {...props} />,
    Callout,
  };
}
