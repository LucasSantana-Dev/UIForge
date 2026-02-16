---
description: Update plan.MD with current project state and progress
---

# Update plan.MD Workflow

This workflow guides you through updating the plan.MD file to reflect current project state.

## When to Use This Workflow

Run this workflow:
- ✅ After completing significant features or components
- ✅ After completing a development phase
- ✅ After implementing functional requirements
- ✅ After making architectural decisions
- ✅ At the end of each work session with substantial progress
- ✅ Before starting a new phase or major feature
- ✅ When resuming work after a break (to document current state)

## Step 1: Assess What Changed

Review recent work and identify:
- [ ] Features/components completed
- [ ] Phases progressed or completed
- [ ] Requirements fulfilled
- [ ] Architecture decisions made
- [ ] Technology added or updated
- [ ] Issues discovered or resolved
- [ ] Tests written or updated

## Step 2: Read Current plan.MD

```bash
# Read the current state
cat /Users/lucassantana/Desenvolvimento/uiforge-webapp/plan.MD | head -100
```

Note:
- Current version number
- Last updated date
- Current phase status
- What's in "In Progress"

## Step 3: Determine Version Increment

Choose version increment:
- **Patch (0.1.x → 0.1.y)**: Minor updates, feature completions, small changes
- **Minor (0.x.0 → 0.y.0)**: Phase completions, major milestones
- **Major (x.0.0 → y.0.0)**: Major releases (MVP, production)

## Step 4: Update Header Metadata

Update these fields in plan.MD:
```markdown
> **Last Updated**: YYYY-MM-DD (Time if needed)
> **Version**: X.Y.Z
> **Status**: [Current phase description]
```

## Step 5: Update Project Status Section

Update the "AI Agent Quick Reference" → "Project Status":
```markdown
- **Version**: X.Y.Z (active development)
- **Status**: 🔄 MVP in progress (Month X-Y)
- **Architecture**: ✅ [status]
- **Auth**: ✅ [status]
- **Database**: ✅ [status]
- **Storage**: ✅ [status]
- **UI System**: ✅ [status]
- **Tests**: ⚠️ [status]
```

## Step 6: Update Active Development Phase

Update phase checkmarks:
```markdown
- ✅ **Phase 1**: Architecture & setup (COMPLETE)
- ✅ **Phase 2**: Supabase auth integration (COMPLETE)
- ✅ **Phase 3**: Database schema, RLS & Storage (COMPLETE)
- 🔄 **Phase 4**: Dashboard UI & Project CRUD (IN PROGRESS)
- ⏳ **Phase 5**: Component generation & Editor
- ⏳ **Phase 6**: AI integration (BYOK + Gemini)
```

## Step 7: Update Implementation Progress

Move items between categories:

**Completed** ✅:
- Add newly completed items
- Be specific about what was implemented

**In Progress** 🔄:
- Update with current work
- Remove completed items

**Next Up** ⏳:
- Update with upcoming priorities

## Step 8: Update Functional Requirements

For each affected FR (FR-1, FR-2, etc.):
- Update status: PENDING → IN PROGRESS → COMPLETE
- Add checkmarks to completed acceptance criteria
- Update implementation details
- Update test coverage status
- Add file references if complete

## Step 9: Update Development Phases

For affected phases:
- Update status: PENDING → IN PROGRESS → COMPLETE
- Add checkmarks to completed deliverables
- Update timeline if needed
- Add achievements section when complete

## Step 10: Add Changelog Entry

Add new entry at the TOP of the Changelog section:

```markdown
### X.Y.Z (YYYY-MM-DD [Time])

**Added**:
- ✅ [New feature or capability]
- ✅ [New component or system]

**Changed**:
- 🔄 [Modified functionality]
- 🔄 [Updated approach]

**Fixed**:
- 🐛 [Bug fix]
- 🐛 [Correction]

**Status**: [Current phase and next steps]
```

## Step 11: Update Technology Stack (If Needed)

If new dependencies or tools were added:
- Add to appropriate section (Frontend/Backend/Testing)
- Include version numbers
- Note purpose or usage

## Step 12: Update Current State (If Needed)

Update if there are changes to:
- Production metrics
- Technical debt
- Known issues

## Step 13: Verify Consistency

Check that:
- [ ] Version numbers match everywhere
- [ ] Phase status is consistent across sections
- [ ] Completed items are marked in all relevant places
- [ ] Dates are accurate
- [ ] No contradictory information
- [ ] Changelog is at the top
- [ ] All sections make sense together

## Step 14: Save and Commit

```bash
# Save the file
# Then commit with descriptive message
git add plan.MD
git commit -m "docs: update plan.MD to v{version} - {brief description}"
```

## Example Commit Messages

- `docs: update plan.MD to v0.1.3 - complete dashboard layout`
- `docs: update plan.MD to v0.2.0 - complete Phase 4`
- `docs: update plan.MD to v0.1.4 - add project CRUD operations`

## Quick Checklist

Before finishing, verify:
- [ ] Header metadata updated (version, date, status)
- [ ] Project Status section updated
- [ ] Active Development Phase checkmarks updated
- [ ] Implementation Progress categories updated
- [ ] Relevant Functional Requirements updated
- [ ] Relevant Development Phases updated
- [ ] Changelog entry added at top
- [ ] Technology Stack updated (if needed)
- [ ] All sections are consistent
- [ ] Document is accurate and clear

## Tips

- **Be specific**: "Completed authentication" is better than "Updated auth"
- **Be accurate**: Only mark things complete that are truly done
- **Be consistent**: Use the same terminology throughout
- **Be timely**: Update soon after work, while details are fresh
- **Be thorough**: Update all affected sections, not just one

## Remember

The plan.MD is the project's memory. Keep it accurate, current, and comprehensive so that any agent (or human) can understand the project state at a glance.
