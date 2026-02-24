# Context Management

Optimize Claude Code context window and token usage for Siza.

## Context Commands:
/context clear - Clear all context and start fresh
/context compact - Compress current context to save tokens
/context save "name" - Save current context state
/context load "name" - Load saved context state
/context status - Show current context usage
/context optimize - Optimize context for current task

## Token Optimization:
- Remove irrelevant files from context
- Summarize long conversations
- Focus on current task scope
- Use @file references instead of full content
- Clear between major tasks

## Context Strategies:
1. **Task-Specific Context**: Only load relevant files
2. **Progressive Loading**: Add files as needed
3. **Regular Cleanup**: Clear context every 20-30 turns
4. **Smart References**: Use @file for large files
5. **Context Summaries**: Compress when hitting 70% threshold

## Memory Management:
- Session memory for recent files
- Project context cache
- Frequent file patterns
- Task-specific templates
- Development history

## Usage Patterns:
/context - Show current context status
/context reset - Start fresh session
/context focus "feature" - Focus on specific feature
/context save "authentication" - Save auth context
/context load "authentication" - Load auth context

## Monitoring:
- Token usage percentage
- Context window size
- File count in context
- Session duration
- Performance metrics

Current context: Optimizing...
