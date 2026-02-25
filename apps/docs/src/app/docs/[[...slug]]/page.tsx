import { source } from '@/lib/source';
import { DocsBody, DocsPage } from 'fumadocs-ui/layouts/docs/page';
import { notFound } from 'next/navigation';
import type { Metadata } from 'next';

export default async function Page(props: { params: Promise<{ slug?: string[] }> }) {
  const params = await props.params;
  const page = source.getPage(params.slug);
  if (!page) notFound();

  const Mdx = page.data.body;

  return (
    <DocsPage toc={page.data.toc}>
      <h1 className="text-3xl font-bold">{page.data.title}</h1>
      <p className="text-fd-muted-foreground mb-4">{page.data.description}</p>
      <DocsBody>
        <Mdx />
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
