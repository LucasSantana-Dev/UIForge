import { source } from '@/lib/source';
import { DocsBody, DocsPage } from 'fumadocs-ui/layouts/docs/page';
import defaultMdxComponents from 'fumadocs-ui/mdx';
import { notFound } from 'next/navigation';
import type { Metadata } from 'next';
import Callout from '@/components/mdx/Callout';
import CodeBlock from '@/components/mdx/CodeBlock';

const mdxComponents = {
  ...defaultMdxComponents,
  Callout,
  pre: CodeBlock,
};

export default async function Page(props: { params: Promise<{ slug?: string[] }> }) {
  const params = await props.params;
  const page = source.getPage(params.slug);
  if (!page) notFound();

  const Mdx = page.data.body;

  return (
    <DocsPage toc={page.data.toc} full={page.data.full}>
      <DocsBody>
        <div className="prose-docs" style={{ maxWidth: '65ch' }}>
          <h1>{page.data.title}</h1>
          {page.data.description && (
            <p
              style={{
                color: 'rgb(var(--color-fd-muted-foreground))',
                fontSize: '1.125rem',
                lineHeight: 1.7,
                marginBottom: '2rem',
              }}
            >
              {page.data.description}
            </p>
          )}
          <Mdx components={mdxComponents} />
        </div>
      </DocsBody>
    </DocsPage>
  );
}

export function generateStaticParams() {
  return source.generateParams();
}

export async function generateMetadata(props: {
  params: Promise<{ slug?: string[] }>;
}): Promise<Metadata> {
  const params = await props.params;
  const page = source.getPage(params.slug);
  if (!page) notFound();
  return {
    title: page.data.title,
    description: page.data.description,
  };
}
