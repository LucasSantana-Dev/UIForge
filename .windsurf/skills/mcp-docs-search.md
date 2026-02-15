---
description: Use MCP tools for docs lookup and web search. Use when needing up-to-date docs, APIs, or best practices.
---

# MCP Docs & Search

## When to use

- Needing current docs for MCP SDK, Zod, Satori, Resvg, Figma API, Vitest
- Searching for APIs, errors, or best practices
- Multi-step reasoning or architecture decisions

## Preferred MCPs

| Task | MCP | Use |
| --- | --- | --- |
| Library docs | **Context7** | MCP SDK, Zod, Satori, Vitest, React, Tailwind, etc. |
| Web search | **Brave Search / Tavily** | APIs, errors, best practices, Figma API reference |
| Multi-step reasoning | **Sequential Thinking** | Architecture, tool design, migration steps |
| GitHub | **GitHub** | Issues, PRs, repo metadata |
| Deep repo docs | **DeepWiki** | Understanding external repos/libraries |

## Conventions

- Prefer Context7 for official library docs before assuming API behavior.
- Use web search for errors, version-specific notes, or when Context7 doesn't cover the topic.
- Don't force MCPs; use the one that fits the task.
- For Figma API: always verify endpoint behavior against official docs (API changes frequently).
