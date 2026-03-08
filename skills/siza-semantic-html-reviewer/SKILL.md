---
name: siza-semantic-html-reviewer
description: Review and enforce semantic HTML structure including heading hierarchy, landmarks, ARIA roles, and document outline
version: 1.0.0
author: Forge Space
tags: [accessibility, semantic-html, aria, landmarks, headings, a11y, structure]
---

# Siza Semantic HTML Reviewer

## Overview
Specialist skill for semantic HTML structure and ARIA role validation. Ensures generated components use correct HTML elements, maintain proper heading hierarchy, include appropriate landmark regions, and apply ARIA roles only when native semantics are insufficient.

## Instructions

### First Rule of ARIA

**Do not use ARIA if native HTML provides the semantics.**

Before adding any ARIA attribute, check if a native HTML element exists:
- `role="button"` → use `<button>`
- `role="link"` → use `<a href>`
- `role="checkbox"` → use `<input type="checkbox">`
- `role="heading"` → use `<h1>`-`<h6>`
- `role="list"` → use `<ul>` or `<ol>`
- `role="navigation"` → use `<nav>`
- `role="main"` → use `<main>`
- `role="complementary"` → use `<aside>`
- `role="contentinfo"` → use `<footer>`
- `role="banner"` → use `<header>` (direct child of `<body>`)

### Heading Hierarchy Rules

Headings create the document outline for screen reader users:

#### Structure Requirements
- Every page must have exactly one `<h1>`
- Headings must not skip levels: h1 → h2 → h3 (never h1 → h3)
- Heading levels can go back up: h1 → h2 → h3 → h2 (new section)
- Component headings should use appropriate level for their page context
- Use `aria-level` only when heading level must be dynamic

#### Component Heading Patterns
- Card title: `<h3>` or `<h4>` depending on page context
- Modal title: match the heading level of the trigger's section + 1
- Sidebar section titles: `<h2>` for top-level sections
- Avoid using heading tags for styling only — use CSS classes instead

#### Heading Anti-Patterns
- `<div className="text-2xl font-bold">Title</div>` — use `<h2>` with styling
- `<h3>` used purely for font size — headings convey structure, not style
- Heading inside a `<button>` or `<a>` — unnecessary nesting
- Empty headings or headings with only icons (add visually hidden text)

### Landmark Regions

Every page should have these landmark regions:

#### Required Landmarks
- `<header>` — page header / banner (site title, primary nav)
- `<nav>` — navigation sections (label each if multiple: `aria-label="Main"`)
- `<main>` — primary content area (exactly one per page)
- `<footer>` — page footer / content info

#### Optional Landmarks
- `<aside>` — complementary content (sidebar, related links)
- `<section>` — thematic grouping (must have accessible name via `aria-labelledby` or `aria-label`)
- `<form>` — forms with accessible name become landmarks
- `<search>` — search functionality (HTML5.2 element)

#### Landmark Rules
- Every piece of content should be within a landmark region
- Multiple `<nav>` elements must each have a unique `aria-label`
- `<main>` must not be nested inside `<header>`, `<footer>`, `<aside>`, or `<nav>`
- Landmark regions should not be deeply nested (max 2 levels)

### ARIA Role Patterns

When native HTML is insufficient, use ARIA correctly:

#### Live Regions
- `aria-live="polite"` — non-urgent updates (toast notifications, status messages)
- `aria-live="assertive"` — urgent updates (error messages, time-sensitive alerts)
- `aria-atomic="true"` — announce the entire region, not just changes
- Place the live region in DOM before content changes (don't add dynamically)

#### States and Properties
- `aria-expanded="true/false"` — collapsible sections, dropdowns, accordions
- `aria-selected="true/false"` — tabs, list selections
- `aria-current="page"` — current page in navigation
- `aria-invalid="true"` — form fields with validation errors
- `aria-describedby` — associate error messages with form fields
- `aria-hidden="true"` — hide decorative content from screen readers

#### Labeling
- `aria-label` — when no visible text exists (icon buttons, search inputs)
- `aria-labelledby` — reference visible text as label (preferred over `aria-label`)
- `aria-describedby` — supplementary description (help text, error messages)
- Every `role` must have an accessible name (label)

### Lists and Tables

#### List Semantics
- Navigation links: `<nav><ul><li><a>` pattern
- Feature lists: `<ul>` with `<li>` items (not `<div>` sequences)
- Ordered steps: `<ol>` with `<li>` items
- Definition lists: `<dl><dt><dd>` for key-value pairs (metadata, settings)
- Never use `list-style: none` without considering screen reader announcement

#### Table Semantics
- Data tables: `<table>` with `<thead>`, `<tbody>`, `<th scope="col/row">`
- `<caption>` or `aria-label` for table identification
- Complex headers: use `headers` attribute linking `<td>` to multiple `<th>` ids
- Never use tables for layout — use CSS Grid or Flexbox
- Sortable columns: `aria-sort="ascending/descending/none"` on `<th>`

### Form Semantics

#### Label Association
- Every input must have a label: `<label htmlFor="id">` or `aria-label`
- Grouped inputs: `<fieldset>` with `<legend>` (radio groups, address fields)
- Required fields: `aria-required="true"` AND visible indicator (not color-only)
- Error messages: associated via `aria-describedby`, use `aria-invalid="true"`

#### Form Structure
- Group related fields with `<fieldset>` + `<legend>`
- Use `<output>` for calculation results
- Submit with `<button type="submit">`, not `<div onClick>`
- `autocomplete` attributes for common fields (name, email, address, tel)

### Common Anti-Patterns

Reject these patterns:
- `<div>` soup — nested divs without semantic meaning
- `<span className="link">` — use `<a href>` for navigation
- `<div role="button" onClick>` — use `<button>`
- `<b>` / `<i>` for emphasis — use `<strong>` / `<em>`
- `<br><br>` for spacing — use CSS margin/padding
- Decorative images without `alt=""` or `role="presentation"`
- `<table>` for layout instead of CSS Grid/Flexbox
- `aria-label` that duplicates visible text (redundant)
- `role="presentation"` on elements with interactive children

### Validation Checklist

For every generated component, verify:
1. Native HTML elements used before ARIA roles
2. Heading hierarchy maintained (no skipped levels)
3. Page has required landmark regions (header, nav, main, footer)
4. Multiple nav elements have unique labels
5. ARIA roles have accessible names
6. Live regions placed in DOM before content changes
7. Forms use proper label association and fieldset grouping
8. Tables use semantic markup with scope attributes
9. Lists use ul/ol/li instead of div sequences
10. No div-soup — every wrapper has semantic purpose or is minimal

## Examples

**Prompt**: "Create a settings page with sidebar navigation"

**Expected patterns**:
- `<nav aria-label="Settings">` for sidebar
- `<main>` wrapping the content area
- `<h1>` for page title, `<h2>` for section headings
- `<form>` around settings with `<fieldset>` grouping related options

**Prompt**: "Build a search results page with filters"

**Expected patterns**:
- `<search>` or `<form role="search">` for search bar
- `<aside aria-label="Filters">` for filter panel
- `<main>` with `<h1>` for "Search Results"
- `<ol>` for ordered results, `<ul>` for unordered
- `aria-live="polite"` region for result count updates

## Quality Rules

1. Zero `role` attributes where native HTML provides the same semantics
2. Heading hierarchy never skips levels
3. Exactly one `<h1>` per page
4. All landmark regions have accessible names when duplicated
5. Every ARIA role has an accessible name
6. Forms use `<label>` association for every input
7. Data presented in grids uses `<table>` with proper headers
8. Live regions exist in DOM before dynamic content changes
9. No layout tables — CSS Grid/Flexbox for visual layout
10. Content within landmark regions, not floating outside
