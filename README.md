# Tailgate Finder

A browser-demo game-day marketplace with ESPN's current-season home schedules for all 18 Big Ten campuses, plus faux tailgate, parking, and venue inventory. Schedules load from ESPN when a campus is selected; dates and kickoff times use the campus's local time zone. Final games leave the upcoming list and appear under a collapsed final-scores section.

## Run locally

```bash
npm install
npm run dev
```

Then open the local Vite URL shown in the terminal. Choose a campus to load its ESPN schedule and Google Map; use Google's map controls, search for a place, open the full map, or recenter on the stadium. Selecting an upcoming game updates the game card and join request. Search listings, filter by tailgate type or parking, publish a host listing, or register business interest. User actions persist in the current browser.

## Build

```bash
npm run build
```

Interactions are saved in the current browser with `localStorage`; use **My game plan → Reset local demo data** to clear them between demonstrations. ESPN supplies game schedules and scores; listings and venue cards are fictional, and their map pins are approximate. The ESPN schedule refreshes every ten minutes and when the page returns to focus. A network connection is required for schedules and maps. The demo has no shared backend, authentication, real email delivery, geocoding for submitted locations, or payment processing.

See [BUILD_LOG.md](BUILD_LOG.md) for the latest verified build and deployment status.

See [SUBMISSION_PACKET.md](SUBMISSION_PACKET.md) for the live URL, repository, hypothesis, user-test evidence status, AI/build log, and revision receipt.

See [PRESENTATION.md](PRESENTATION.md) for the written pitch outline and the PowerPoint deck for the presentation version.
