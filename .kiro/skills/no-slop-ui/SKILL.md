---
name: no-slop-ui
description: Interface rules for the Recto editor. Use when creating or changing any UI (pages, components, styles, empty states, errors, copy). Keeps the UI quiet, modern and minimal, and avoids the generic look of AI-generated interfaces.
---

# no-slop-ui

Recto is a writing tool. The interface should disappear behind the page.

## Forbidden

- Violet-to-pink or any multi-stop gradient backgrounds, gradient text, gradient buttons.
- Glassmorphism, backdrop blur as decoration, frosted panels.
- Emoji used as icons or decoration. Use a single consistent icon set (lucide) or no icon.
- Default Tailwind `blue-500`/`indigo-600` as accent. Accent comes from the palette in `app/globals.css` only.
- Drop shadows on cards and buttons. Separate with a 1px border.
- Hero sections, feature grids with three icon cards, "Get started in seconds" style marketing copy inside the app.
- Names ending in `Flow`, `Hub`, `Nexus`, `Studio`, `Pro`, `AI`-prefixed decorations, or any name that reads like a template.
- Sparkle, robot, or wand icons anywhere. The product does not advertise that AI made it.
- Exclamation marks in UI text.
- Placeholder copy that sounds like a template ("Welcome back!", "Unleash your ideas").

## Required

- One accent colour. Everything else is neutral: paper, ink, and a few greys.
- 1px borders as the only separator. Shadow is allowed only on modal dialogs.
- A type scale of four sizes at most: body, small, heading, page title.
- Sans-serif for chrome, serif for document body text.
- Empty states and error states are designed, not blank. Each says what happened and what the user can do next, in one sentence.
- Buttons use plain verbs ("Share", "Rename", "Delete"). No "Get started", "Let's go", "Create magic".
- Focus rings are visible and use the accent colour.
- Spacing follows a 4px grid. Content width for the editor is capped near 680px for reading.
- Motion is limited to 150ms opacity or colour transitions. No bouncing, no parallax, no entrance animations on lists.

## Palette (source of truth: app/globals.css)

- Paper `#FBFAF7` (page), ink `#1B1A17` (text), greys derived from ink.
- Accent `#A8401C` (burnt sienna), used for focus, primary action and the single brand mark accent.

## Copy checklist before committing UI text

1. Would a senior designer at a writing tool company put this sentence in the product?
2. Does it name the thing and the action, with no filler?
3. Is there any word from the Forbidden list? Remove it.
