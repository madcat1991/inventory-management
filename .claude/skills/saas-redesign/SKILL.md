---
name: saas-redesign
description: Redesign a Vue 3 application's UI into a modern SaaS-style interface with a vertical left sidebar (replacing the top nav), consistent spacing tokens, and polished professional styling. Matches the project's existing styling approach without introducing new CSS frameworks. Plans first and waits for approval before editing. Use when the user asks to redesign, modernize, or "make it look like a SaaS app", convert a top nav to a sidebar, apply consistent spacing, or polish the UI.
---

# Vue 3 SaaS Redesign

This skill redesigns a Vue 3 app's UI into a modern SaaS interface: vertical left sidebar navigation, consistent spacing scale, polished typography, professional look. It **matches the project's existing styling approach** — never introduces Tailwind or new CSS frameworks if they aren't already in use.

It runs in three phases: **Discover → Plan → Apply**. Plan first. Wait for explicit approval before editing code.

## When to invoke

Trigger on requests like:
- "Redesign the UI to look like a modern SaaS app"
- "Replace the top nav with a sidebar"
- "Make the spacing consistent / make it more polished"
- "Modernize the look of this Vue app"

Do **not** invoke for:
- Single-component tweaks (just edit the component)
- Adding one new view (use vue-expert directly)
- Pure backend/API work

---

## Phase 1 — Discover

Before producing a plan, gather facts. Use the `Explore` subagent if the codebase is large; otherwise read directly. Capture every item below — the plan depends on it.

### 1. Styling approach (critical)

Detect what's already in use and stay within it:

- Are styles in `<style>` or `<style scoped>` blocks?
- Tailwind? Search for `tailwind.config.*`, `@tailwind` directives, `tailwindcss` in `package.json`
- Component libraries: Vuetify, Element Plus, PrimeVue, Naive UI? Check `package.json` and `main.js`
- CSS variables defined globally? (commonly in `App.vue` or `src/styles/`)
- Class naming: BEM, utility, kebab, camel?

**Rule: do not introduce a new styling dependency. If the project uses plain scoped CSS, the redesign uses plain scoped CSS.**

### 2. Layout entry points

- `src/App.vue` — current root layout shell
- `src/main.js` or `src/router*` — route definitions and metadata
- Any existing `Header`, `NavBar`, `TopBar`, `TopNav` component slated for replacement

### 3. Routes

List every route: path, name, view component, optional icon/label metadata. The sidebar will mirror this list.

### 4. Existing design tokens

Extract whatever is already in the codebase:

- Color palette (primary, neutrals, status colors)
- Spacing values (look for repeated `padding: 16px`, `gap: 24px`, etc.)
- Typography (font family, base size, weights)
- Border radius and shadow conventions

If the project has a `CLAUDE.md` design system section, **prefer those values verbatim**.

### 5. Features in the current top nav

Inventory anything in the existing top nav that must be preserved:

- Language / i18n switcher
- Profile / user menu
- Notifications
- Search
- Theme toggle

These get relocated, not deleted.

Report findings concisely. Do not present a redesign yet.

---

## Phase 2 — Plan

Produce a written plan covering every point below. Present it to the user and wait for approval. Do not edit code in this phase.

### 1. Sidebar structure

- **Width**: fixed `240–260px` (typical SaaS), or collapsible to `~64px` icon-only
- **Header**: brand/logo + product name
- **Nav body**: one item per route. Icon optional — only include icons if the project already ships icons; otherwise text-only is fine
- **Active state**: pick one of (a) filled background, (b) left border accent, (c) bold text. Not all three
- **Footer** (optional): relocated language switcher, profile menu, settings

### 2. Layout shell

- Sidebar fixed left, full viewport height
- Main content area to the right with consistent padding (use `--space-6` or `--space-8`)
- Optional top bar inside the main area for page title + page-level actions/filters
- Mobile: off-canvas drawer with a hamburger, OR document mobile as out of scope

### 3. Spacing scale

Reuse existing values if any. Otherwise propose:

```css
--space-1: 4px;
--space-2: 8px;
--space-3: 12px;
--space-4: 16px;
--space-6: 24px;
--space-8: 32px;
--space-12: 48px;
```

Apply to padding, gap, and margin. **No magic numbers in changed files.**

### 4. Color tokens

Reuse the existing palette. Sidebar background is typically a slightly darker neutral than the page background, or the project's dark slate. Do not introduce new colors unless absolutely required.

### 5. Typography

- Sidebar nav item: `14px` / weight `500`
- Active nav item: weight `600`
- Page titles: `20–24px` / weight `600`
- Body: `14px`
- Small / labels: `12px`, uppercase, `letter-spacing: 0.05em`

### 6. File-by-file change list

Be exhaustive. The user should know exactly what will change.

- **New**: `src/components/Sidebar.vue`
- **Edit**: `src/App.vue` — replace top nav with two-column layout shell
- **Edit**: router file — add `meta: { label, icon? }` if needed for sidebar entries
- **Edit**: `src/styles/*` or root `<style>` in `App.vue` — add spacing/color tokens if not already present
- List every other file that will change. No mystery edits.

### 7. Risks & preservation list

- Top-nav features being relocated (i18n switcher, profile menu, etc.) — name each one
- Any view with hard-coded paddings that may clash with the new shell
- Anything explicitly out of scope (per-view polish, mobile, dark mode)

**Wait for explicit user approval before proceeding to Phase 3.**

---

## Phase 3 — Apply

Once the user approves the plan:

### 1. Delegate Vue work to `vue-expert`

Per the project's CLAUDE.md mandate, any creation or significant modification of `.vue` files **must** be delegated to the `vue-expert` subagent. Pass the approved plan as context. Do not edit `.vue` files from the main thread.

### 2. Apply changes in this order

1. **Create `Sidebar.vue`** — isolated, doesn't break anything. Uses approved tokens.
2. **Modify `App.vue`** — swap top nav for two-column shell (`<aside><Sidebar /></aside><main><router-view /></main>`)
3. **Update router metadata** if the sidebar reads labels/icons from `route.meta`
4. **Add tokens** to global styles if not already present
5. **Relocate preserved features** (i18n switcher, profile menu) into the sidebar footer or a top bar in `main`

### 3. Preserve existing functionality

- `router-link` semantics intact — use `router-link-active` / `router-link-exact-active` for the active state, or `:class` with `$route.path` matching
- i18n / language switcher / profile menu **relocated, not deleted**
- Existing `FilterBar` (or equivalent) still mounts and works in the new layout
- Per-view layouts remain functional — the redesign is a shell change, not a per-view rewrite

### 4. Verify in the browser

- Start the dev server (use the `start` skill if available, otherwise the project's documented command)
- Use Playwright MCP (`mcp__playwright__*`) to:
  - Navigate to every route in turn
  - Screenshot each
  - Confirm sidebar renders, active item highlights, no console errors
  - Open at least one modal / interactive element to confirm nothing regressed
- If browser testing is not possible in the current environment, **say so explicitly**. Do not claim success based on type-check / build alone — those verify code, not feature correctness.

### 5. Comments on non-obvious styling

Add brief `/* ... */` comments where the *why* is non-obvious — e.g., a `min-width` on the content area to prevent a table from forcing horizontal scroll, or a `position: sticky` with a specific top offset. Routine styles need no comment.

---

## Design Principles

**Sidebar nav**
- One column, `100vh` height, fixed left
- Brand top, nav middle, optional footer at bottom
- Active item: filled background OR left-border accent — pick one, not both
- Hover: subtle background change. No transforms, no scaling

**Spacing**
- Use the token scale everywhere
- Section gaps: `--space-6` or `--space-8`
- Card padding: `--space-4` or `--space-6`
- Inline gaps (icon + label, etc.): `--space-2` or `--space-3`

**Typography**
- One font family. System stack is fine: `-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif`
- Three sizes max per screen
- Use weight (`500` / `600`) for hierarchy, not just size

**Surfaces**
- Cards: `1px` border, rounded `6–8px`, no heavy shadows
- Tables: header row with subtle bg, `1px` row dividers
- Modals: stronger shadow, larger radius — these earn the visual weight

**Restraint**
- No emojis in UI (project rule per CLAUDE.md)
- No gradients unless already in use
- Animations: max `150ms` ease on hover/focus. No bouncing, no spinning.

---

## Common Pitfalls

1. **Losing features.** The old top nav often hides a language switcher, profile menu, or notifications. Relocate them — never delete.
2. **Breaking active state.** `router-link` provides `router-link-active` and `router-link-exact-active` automatically; rely on those rather than reinventing matching logic.
3. **Hard-coded colors / spacing.** Magic numbers in changed files defeat the point. Use tokens.
4. **Introducing a CSS framework.** If the project doesn't already use Tailwind, do not add it. Match the existing approach.
5. **Restyling every view in one pass.** The shell + sidebar is one change. Per-view polish is a separate, smaller pass that the user explicitly requests.
6. **Mobile surprise.** A `250px` sidebar is unusable below `640px`. Either implement an off-canvas drawer or explicitly scope mobile out in the plan.
7. **Skipping browser verification.** Type-check passing ≠ UI working. Always render the change.

---

## Verification Checklist

Before reporting the redesign as done:

- [ ] Sidebar renders on every route
- [ ] Active nav item correctly reflects the current route
- [ ] All previously-available nav features (i18n, profile, etc.) still functional
- [ ] Zero console errors after navigating through every route
- [ ] Spacing tokens used consistently in changed files (no magic numbers)
- [ ] No new dependencies added to `package.json`
- [ ] Browser-tested at least one full user flow end-to-end
- [ ] All changed `.vue` files were delegated to `vue-expert`
