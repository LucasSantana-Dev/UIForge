import defaultMdxComponents from 'fumadocs-ui/mdx';
import type { MDXComponents } from 'mdx/types';
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

export function useMDXComponents(
  components: MDXComponents,
): MDXComponents {
  return {
    ...defaultMdxComponents,
    ...components,
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
}
