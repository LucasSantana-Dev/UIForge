# plan.MD Maintenance Rules

## Purpose

The `plan.MD` file is the **ABSOLUTE SOURCE OF TRUTH** for the UIForge project. It must be treated as a living document that accurately reflects the current state, progress, and future direction of the project at all times.

## Core Principles

1. **Always Current**: plan.MD must reflect the actual state of the project, not aspirational or outdated information
2. **Single Source of Truth**: All agents must consult plan.MD before making decisions or changes
3. **Comprehensive**: Covers architecture, requirements, progress, decisions, and roadmap
4. **Accessible**: Written for both humans and AI agents to understand quickly

## Mandatory Update Triggers

Update plan.MD whenever:

### Immediate Updates Required
- ✅ Completing a development phase
- ✅ Implementing a functional requirement
- ✅ Making architectural decisions
- ✅ Adding/removing technology stack items
- ✅ Changing project status or timelines
- ✅ Discovering new constraints or requirements
- ✅ Completing significant features or components

### Regular Updates Required
- 📅 After each work session with substantial progress
- 📅 Daily if actively developing
- 📅 Weekly minimum during active development
- 📅 Before starting new phases

### Context Updates Required
- 🔄 When AI agents need current context
- 🔄 When onboarding new team members or agents
- 🔄 When resuming work after a break

## Update Protocol

### Step 1: Read Current State
```bash
# Always read plan.MD first to understand current state
read_file /Users/lucassantana/Desenvolvimento/uiforge-webapp/plan.MD
```

### Step 2: Identify Changes
Determine what has changed since last update:
- New features implemented
- Phases completed or progressed
- Requirements fulfilled
- Architecture decisions made
- Technology added/updated
- Issues discovered or resolved

### Step 3: Update Sections

#### Critical Sections (Update Every Time)
1. **Header Metadata**
   - Last Updated: Current date and time
   - Version: Increment appropriately (0.1.x for minor, 0.x.0 for phases)
   - Status: Current development phase

2. **Project Status (AI Agent Quick Reference)**
   - Version number
   - Status emoji and description
   - Architecture checkmarks
   - Auth/Database/Storage/UI/Tests status

3. **Active Development Phase**
   - Update phase checkmarks (✅/🔄/⏳)
   - Reflect current phase progress

4. **Implementation Progress**
   - Move items from "In Progress" to "Completed" when done
   - Add new items to "In Progress" when started
   - Update "Next Up" with upcoming work

5. **Changelog**
   - Add new entry at the top
   - Use version number and date
   - List all changes in categories: Added, Changed, Fixed, Status

#### Important Sections (Update When Relevant)
6. **Functional Requirements**
   - Update status (PENDING → IN PROGRESS → COMPLETE)
   - Add checkmarks to acceptance criteria
   - Update test coverage status
   - Add implementation details when complete

7. **Development Phases**
   - Update phase status (PENDING → IN PROGRESS → COMPLETE)
   - Add checkmarks to deliverables
   - Update timelines if needed
   - Note achievements when phase completes

8. **Current State**
   - Update production metrics
   - Update technical debt section
   - Update known issues

9. **Technology Stack**
   - Add new dependencies
   - Update version numbers
   - Note new tools or libraries

### Step 4: Ensure Consistency
- Version numbers match across document
- Phase status consistent everywhere
- Completed items marked in all relevant sections
- Dates are accurate
- No contradictory information

### Step 5: Validate
- Document is readable and clear
- All sections make sense together
- Timeline is logical
- Status accurately reflects reality

## Version Numbering

Follow semantic versioning for plan.MD:

- **0.1.x**: Minor updates, feature completions, small changes
- **0.x.0**: Phase completions, major milestones
- **x.0.0**: Major releases (MVP launch, production release)

Examples:
- `0.1.0` → `0.1.1`: Completed auth implementation
- `0.1.1` → `0.1.2`: Completed database schema
- `0.1.2` → `0.2.0`: Completed Phase 3 (Database & Storage)
- `0.2.0` → `1.0.0`: MVP launch

## Changelog Format

```markdown
### X.Y.Z (YYYY-MM-DD [Time if multiple same day])

**Added**:
- ✅ New features, capabilities, or components
- ✅ New sections or documentation

**Changed**:
- 🔄 Modified functionality or approach
- 🔄 Updated architecture or decisions

**Fixed**:
- 🐛 Bug fixes
- 🐛 Corrections to documentation

**Status**: Current phase and next steps
```

## Common Mistakes to Avoid

❌ **Don't**:
- Leave plan.MD outdated for multiple days
- Update only one section and forget others
- Skip the changelog
- Use vague or unclear status descriptions
- Forget to increment version number
- Leave contradictory information
- Update without reading current state first

✅ **Do**:
- Update immediately after significant work
- Keep all sections synchronized
- Be specific and clear in descriptions
- Use consistent terminology
- Maintain the changelog chronologically
- Verify accuracy before saving
- Read the full document periodically

## Integration with Workflow

### Before Starting Work
1. Read plan.MD to understand current state
2. Identify which phase/feature you're working on
3. Note what sections will need updates

### During Work
1. Keep mental note of progress made
2. Track completed items
3. Note any architectural decisions

### After Work Session
1. Update plan.MD with all progress
2. Move items between status categories
3. Add changelog entry
4. Increment version if appropriate
5. Commit changes with descriptive message

### When Resuming Work
1. Read plan.MD to get current context
2. Review "In Progress" and "Next Up" sections
3. Continue from documented state

## Automation Opportunities

Consider these for future automation:
- Automatic version incrementing based on changes
- Changelog generation from git commits
- Phase progress calculation
- Consistency validation
- Outdated section detection

## Responsibility

**All AI agents** working on UIForge must:
1. Consult plan.MD before making decisions
2. Update plan.MD after significant work
3. Maintain accuracy and consistency
4. Treat it as the authoritative source

**The plan.MD is not optional documentation—it is the project's memory and compass.**
