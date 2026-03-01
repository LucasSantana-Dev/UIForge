import { source } from '@/lib/source';
import {
  ArchitectureDiagram,
  DataFlow,
  FlowStep,
  FlowArrow,
} from '@/components/ArchitectureDiagram';
import {
  ContribHero,
  ContribType,
  ContribTypes,
  ContribStep,
  ContribSteps,
  ContribRepo,
  ContribRepos,
  IconCode,
  IconBug,
  IconBook,
  IconLightbulb,
  IconTestTube,
  IconGitPR,
} from '@/components/ContributingGuide';
import { DocsBody, DocsPage } from 'fumadocs-ui/layouts/docs/page';
import defaultMdxComponents from 'fumadocs-ui/mdx';
import { notFound } from 'next/navigation';
import type { Metadata } from 'next';

const mdxComponents = {
  ...defaultMdxComponents,
  ArchitectureDiagram,
  DataFlow,
  FlowStep,
  FlowArrow,
  ContribHero,
  ContribType,
  ContribTypes,
  ContribStep,
  ContribSteps,
  ContribRepo,
  ContribRepos,
  IconCode,
  IconBug,
  IconBook,
  IconLightbulb,
  IconTestTube,
  IconGitPR,
};

export default async function Page(
  props: { params: Promise<{ slug?: string[] }> },
) {
  const params = await props.params;
  const page = source.getPage(params.slug);
  if (!page) notFound();

  const Mdx = page.data.body;

  return (
    <DocsPage toc={page.data.toc} full={page.data.full}>
      <DocsBody>
        <h1>{page.data.title}</h1>
        {page.data.description && (
          <p className="fd-description">{page.data.description}</p>
        )}
        <Mdx components={mdxComponents} />
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
