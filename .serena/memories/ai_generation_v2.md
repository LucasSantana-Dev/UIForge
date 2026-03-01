# AI Generation v2 Platform

## Overview
Complete redesign of the AI generation system with multi-turn conversation, design-to-code analysis, and generation history tracking. Replaces the single-shot generator form with a conversational refinement workflow.

## Implementation Phases

### Phase 1: Conversation Mode (COMPLETED — PR #194)
- **Multi-turn refinement**: parent_generation_id chain for iterative improvements
- **RefinementInput component**: Textarea with "Refine" CTA, replaces one-shot form
- **Conversation history**: Display previous generations with ability to refine from any point
- **Key files**: 
  - `apps/web/src/components/generation/RefinementInput.tsx`
  - `apps/web/src/hooks/use-generation.ts` (parent_generation_id support)
  - `apps/web/src/app/(dashboard)/generate/page.tsx` (conversation UI)

### Phase 2: Design-to-Code (COMPLETED — PR #220)
- **DesignAnalysisPanel integration**: Wired to GeneratorForm via handleApplyAnalysis callback
- **Design context mapping**: Transforms image analysis results (colors, layout, typography) into structured DesignContext
- **Suggested prompts**: Auto-generates prompt from design analysis to guide user input
- **Feature flag**: ENABLE_DESIGN_ANALYSIS controls visibility
- **Key files**:
  - `apps/web/src/components/generation/GeneratorForm.tsx` (handleApplyAnalysis callback)
  - `apps/web/src/components/generation/DesignAnalysisPanel.tsx` (analysis UI)
  - `apps/web/src/lib/ai/image-analysis.ts` (Anthropic Vision API integration)
  - `apps/web/src/app/api/generate/analyze/route.ts` (analysis endpoint)

### Phase 3: Generation History (NOT STARTED)
- **Plan location**: `.claude/plans/noble-juggling-abelson.md`
- **Planned features**:
  - Persistent history sidebar showing all user generations
  - Ability to browse, search, and restore previous generations
  - Version tree visualization for conversation chains
  - Export/share functionality

### Phase 4: Ship (NOT STARTED)
- **Plan location**: `.claude/plans/noble-juggling-abelson.md`
- **Planned features**:
  - One-click deployment to Vercel/Netlify/Cloudflare
  - GitHub integration for push-to-repo
  - Component library extraction

## Infrastructure Components

All core components existed before wiring phase:
- **ImageUpload**: Drag-and-drop image upload with preview
- **DesignContext**: Type-safe design analysis result structure
- **Vision API integration**: Anthropic Claude 3.5 Sonnet with vision support
- **/api/generate/analyze**: Analysis endpoint returning structured design data

## Current Status (2026-02-28)
- **Version**: v0.19.0
- **Completed**: Phase 1 (Conversation) + Phase 2 (Design-to-Code)
- **Remaining**: Phase 3 (History) + Phase 4 (Ship)
- **Tests**: 8 new tests for DesignAnalysisPanel (mocking, color parsing, callback)
- **Total tests**: 597+ passing across 47+ suites
