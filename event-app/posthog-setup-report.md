# PostHog post-wizard report

The wizard has completed a deep integration of your Next.js event application. PostHog has been configured with client-side analytics using the `instrumentation-client.ts` approach (recommended for Next.js 15.3+), a reverse proxy for reliable event delivery, and custom event tracking on key user interactions throughout the app.

## Integration Summary

The following files were created or modified:

| File | Change Type | Description |
|------|-------------|-------------|
| `.env` | Created | Environment variables for PostHog API key and host |
| `instrumentation-client.ts` | Created | Client-side PostHog initialization with error tracking enabled |
| `next.config.ts` | Modified | Added reverse proxy rewrites for PostHog EU |
| `components/ExploreBtn.tsx` | Modified | Added `explore_events_clicked` event tracking |
| `components/EventCard.tsx` | Modified | Added `event_card_clicked` event tracking with event properties |
| `components/NavBar.tsx` | Modified | Added navigation click tracking for all nav items |

## Events Instrumented

| Event Name | Description | File |
|------------|-------------|------|
| `explore_events_clicked` | User clicked the 'Explore events' button on the homepage - top of conversion funnel | `components/ExploreBtn.tsx` |
| `event_card_clicked` | User clicked on an event card to view event details - conversion intent signal | `components/EventCard.tsx` |
| `nav_home_clicked` | User clicked the Home navigation link | `components/NavBar.tsx` |
| `nav_events_clicked` | User clicked the Events navigation link | `components/NavBar.tsx` |
| `nav_create_event_clicked` | User clicked the Create event navigation link - high intent conversion action | `components/NavBar.tsx` |
| `logo_clicked` | User clicked on the logo to navigate home | `components/NavBar.tsx` |

## Next steps

We've built some insights and a dashboard for you to keep an eye on user behavior, based on the events we just instrumented:

### Dashboard
- [Analytics basics](https://eu.posthog.com/project/114004/dashboard/480224) - Main dashboard with all key metrics

### Insights
- [Explore Events Clicks Over Time](https://eu.posthog.com/project/114004/insights/Od1pShz7) - Tracks how many users click the 'Explore events' button
- [Event Cards Clicked by Event](https://eu.posthog.com/project/114004/insights/baM844zm) - Breakdown of event card clicks by event title
- [Explore to Event View Funnel](https://eu.posthog.com/project/114004/insights/7BLPXrT0) - Conversion funnel from exploring to clicking on events
- [Navigation Clicks Overview](https://eu.posthog.com/project/114004/insights/yY7LtA0o) - Overview of all navigation interactions
- [Create Event Intent](https://eu.posthog.com/project/114004/insights/n1jIYxTw) - Tracks 'Create event' navigation clicks

## Additional Features Enabled

- **Error Tracking**: Unhandled exceptions are automatically captured via `capture_exceptions: true`
- **Reverse Proxy**: Events are routed through `/ingest` to avoid tracking blockers
- **Debug Mode**: PostHog debug mode is enabled in development for easier troubleshooting

## Getting Started

1. Run `npm run dev` to start the development server
2. Navigate through the app and interact with buttons/links
3. View your events in the [PostHog dashboard](https://eu.posthog.com/project/114004/dashboard/480224)
