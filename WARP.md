# WARP.md

This file provides guidance to WARP (warp.dev) when working with code in this repository.

## Project layout

- The main application lives in `event-app/`, which is a Next.js App Router project (Next.js 16).
- Routing is handled via the `app/` directory:
  - `event-app/app/layout.tsx` defines the root HTML layout, global fonts, the `NavBar` header, and the animated `LightRays` background that sits behind page content.
  - `event-app/app/page.tsx` is the home page. It renders a hero section, the `ExploreBtn` call-to-action, and a list of event cards using data from `event-app/lib/constants.ts`.
- Shared modules:
  - `event-app/components/` contains reusable UI and behavior:
    - `NavBar.tsx` – sticky top navigation with PostHog tracking for logo and nav link clicks.
    - `ExploreBtn.tsx` – CTA button on the homepage that fires a PostHog event when clicked.
    - `EventCard.tsx` – clickable event cards that send PostHog events when users interact with individual events.
    - `LightRays.tsx` – a client-only WebGL background effect built with `ogl`, wired to window resize and mouse movement via React hooks.
  - `event-app/lib/constants.ts` – static `events` array used to drive the event list and links (via `slug` fields) throughout the UI.
  - `event-app/lib/utils.ts` – `cn()` helper combining `clsx` and `tailwind-merge` for composing Tailwind utility class strings.
- Styling and design system:
  - `event-app/app/globals.css` imports Tailwind CSS v4 and `tw-animate-css`, defines CSS custom properties for the color system and radii, and sets up Tailwind `@theme`, `@utility`, `@layer base`, and `@layer components` blocks.
  - Layout-level and component-level styling (e.g., `#explore-btn`, `#event-card`, `header`, `.events`, `#event`) is expressed via semantic IDs and classes that are consumed by the React components.
- Configuration and tooling:
  - `event-app/next.config.ts` configures experimental options and rewrites for PostHog ingestion endpoints (see "Analytics and instrumentation" below).
  - `event-app/eslint.config.mjs` defines the ESLint setup using `eslint-config-next` (core web vitals + TypeScript) with explicit `globalIgnores` for build artifacts.
  - `event-app/tsconfig.json` enables strict TypeScript and configures the path alias `@/*` to point at the app root (used throughout as `@/components/...`, `@/lib/...`).
  - `event-app/components.json` is a `shadcn/ui` style components config file that also defines path aliases consistent with `tsconfig.json`.

## Running the app

All commands below assume you start from the repository root `next-js-event-app/`.

- Install dependencies (first-time setup or after changing dependencies):
  - `cd event-app && npm install`
- Start the development server (hot-reload on file changes):
  - `cd event-app && npm run dev`
  - Then open `http://localhost:3000` in a browser. The main entry point is `app/page.tsx`.
- Create a production build:
  - `cd event-app && npm run build`
- Run the production server locally (after building):
  - `cd event-app && npm start`

## Linting

- Run ESLint for the Next.js app using the project config in `event-app/eslint.config.mjs`:
  - `cd event-app && npm run lint`
- The ESLint config extends Next.js core web vitals and TypeScript presets and uses `globalIgnores` so that `.next/**`, `out/**`, `build/**`, and `next-env.d.ts` are excluded from linting.

## Tests

- There is currently **no test runner or `test` script** defined in `event-app/package.json`. As of now, there is no standard command to run unit or integration tests in this repository.

## Analytics and instrumentation (PostHog)

This project has a PostHog analytics integration focused on client-side event tracking for key user interactions.

- Initialization:
  - `event-app/instrumentation-client.ts` initializes PostHog via `posthog-js` using the environment variable `NEXT_PUBLIC_POSTHOG_KEY`.
  - The client is configured to:
    - Use `api_host: "/ingest"` and `ui_host: "https://eu.posthog.com"`.
    - Enable automatic exception capture with `capture_exceptions: true`.
    - Enable `debug` mode when `NODE_ENV === "development"`.
- Network routing:
  - `event-app/next.config.ts` defines rewrites so that:
    - `/ingest/static/:path*` proxies to `https://eu-assets.i.posthog.com/static/:path*`.
    - `/ingest/:path*` proxies to `https://eu.i.posthog.com/:path*`.
  - `skipTrailingSlashRedirect: true` is set to support PostHog's trailing-slash API patterns.
- Instrumented events (see `event-app/posthog-setup-report.md` for full details):
  - `ExploreBtn.tsx` emits `explore_events_clicked` when the "Explore events" button is clicked.
  - `EventCard.tsx` emits `event_card_clicked` with event metadata (`event_title`, `event_slug`, `event_location`, `event_date`, `event_time`) when a card is clicked.
  - `NavBar.tsx` emits:
    - `logo_clicked` when the logo is clicked.
    - `nav_home_clicked` for the Home link.
    - `nav_events_clicked` for the Events link.
    - `nav_create_event_clicked` for the Create event link.
- Environment configuration:
  - PostHog requires a public API key exposed to the browser. Ensure `NEXT_PUBLIC_POSTHOG_KEY` is defined in a local env file (e.g., `.env.local`) or the deployment environment so that `posthog.init` can succeed.

## Styling, layout, and UI architecture

- Tailwind CSS v4 is used via the new `@import "tailwindcss";` and `@theme` / `@utility` / `@layer` primitives (see `event-app/app/globals.css`).
- Global CSS variables under `:root` define the color palette, radii, and design tokens. These are then mapped into Tailwind theme tokens inside the `@theme inline` block, so changing design tokens there propagates through utility classes.
- Reusable utility patterns are defined as Tailwind utilities (e.g., `flex-center`, `text-gradient`, `glass`, `card-shadow`) and are heavily reused in components via class names.
- Higher-level layout and component structure is encoded via nested selectors in `@layer components` (e.g., `header nav`, `#explore-btn a`, `#event-card .datetime`, `#event .details .content .agenda`). When modifying markup in React components, be aware of these structured selectors so you don't accidentally break styling by changing IDs or nested element structure.
- The `LightRays` component encapsulates a fairly involved WebGL effect. It uses React hooks to:
  - Lazily initialize an `ogl` `Renderer` and `Mesh` only when the component is visible (`IntersectionObserver`).
  - Recompute resolution and ray anchor/direction on window resize.
  - Smoothly follow mouse movement (optional) via `mouseInfluence` and internal smoothing refs.
  - Clean up the WebGL context and canvas on unmount. Any changes to this component should preserve these lifecycle guarantees to avoid memory leaks or runtime errors in the browser.
