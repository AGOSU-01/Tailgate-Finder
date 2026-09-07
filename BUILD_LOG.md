# Tailgate Finder Build Log

This document records the main prompts, revisions, findings, discoveries, and validation results for the Tailgate Finder prototype.

## Project Goal

Build a polished game-day marketplace prototype where fans can find tailgates, parking, bars, and pregame events around Ohio Stadium. The locator is free for fans, while paid listings, event transactions, parking, and sponsored bar placements represent possible revenue streams.

## Prompt And Revision History

### 1. New workspace setup

**Prompt:** Create a Tailgate Finder website in a new VS Code workspace.

**Revision:** Scaffolded a Vite React TypeScript project and replaced the default Vite screen with a game-day discovery experience.

**Result:** Added the Tailgate Finder brand, responsive layout, game card, map area, tailgate directory, search, filters, host form, join feedback, and mobile styling.

### 2. 2026 Ohio State home schedule

**Prompt:** Include all Ohio State home football games for the current year.

**Finding:** The official 2026 schedule lists seven home games in Columbus: Ball State, Kent State, Illinois, Maryland, Oregon, Northwestern, and Michigan.

**Revision:** Added a selectable home-game schedule menu and connected the selected opponent to the hero card.

### 3. Interactive map behavior

**Prompt:** Add a live map overview that can zoom and drag.

**Revision:** Added pointer-based map panning, recenter behavior, zoom controls, zoom percentage feedback, and selectable map pins.

**Discovery:** A Google Maps iframe can provide recognizable local context without requiring a full Google Maps API integration. The current prototype uses an embed, so production-grade custom markers would eventually require the Google Maps JavaScript API and an API key.

### 4. Map visual revisions

**Prompt:** Try satellite imagery, then switch back to Google Maps and use satellite mode.

**Revisions:** Tested an aerial imagery background, replaced it with Google Maps, then requested satellite mode through the embed query parameters.

**Finding:** An iframe has limited control over the embedded map itself. Tailgate Finder therefore keeps its own zoom and drag layer around the embed, while the Google map supplies the geographic visual context.

### 5. Map layout fixes

**Prompt:** Fix the map being cut off and prevent empty margins.

**Revisions:** Set explicit width and height on the map scene and iframe, then adjusted the zoom floor so zooming out would not expose blank space around the map.

**Finding:** Scaling the entire embedded iframe below its container made the pale wrapper visible. The current implementation keeps a wider starting map view and uses a bounded zoom range.

### 6. Tailgate and bar locations

**Prompt:** Move tailgates into surrounding parking lots, remove the stadium oval, and make bar pins more precise.

**Revisions:** Removed the custom blue stadium oval, moved tailgate pins outside the stadium footprint, added seven promoted bars with street addresses, and placed bar pins along the campus and High Street corridor.

**Discovery:** The pin positions are prototype screen coordinates, not geocoded latitude/longitude. A backend or map API integration should replace them with verified coordinates before public launch.

### 7. Pin design and density

**Prompt:** Make pins upright, start about 30% smaller, and change their size with zoom.

**Revision:** Converted pins to upright circular markers, reduced their base size, and added zoom-responsive scaling so dense map views remain readable.

### 8. Sponsored bar model

**Prompt:** Add local bars promoting themselves for a fee.

**Revision:** Added seven sponsored bar examples, purple bar map pins, clickable offers, and a dedicated sponsorship section.

**Business decision:** The prototype uses `$250 per Ohio State home game` as the initial sponsored placement price. This is a testable starting price for a class pitch, not a validated market rate.

## Findings And Discoveries

- The strongest product framing is a game-day marketplace, not only a map.
- Fans can use discovery for free while hosts, parking operators, event organizers, and bars pay for visibility or transactions.
- The official schedule is a better source for the pitch than hardcoded historical dates.
- Map embeds are useful for a prototype, but precise custom locations require geocoded data and a proper map SDK.
- Tailgate markers should be displayed around the stadium, never over the playing field or stadium footprint.
- Sponsored inventory needs a clear label so paid placement is distinguishable from organic listings.
- A local React state model is sufficient for the demo; authentication, payments, moderation, capacity limits, and verified hosts remain future backend work.

## Validation Log

### 2026-09-07

- Command: `npm run build`
- Result: Passed
- TypeScript project check: Passed
- Vite production bundle: Passed
- Editor diagnostics for `src/App.tsx` and `src/App.css`: No errors
- GitHub Pages workflow: Passed
- Published site: https://agosu-01.github.io/Tailgate-Finder/

## Reproduce Locally

```bash
npm install
npm run dev
```

For a production check:

```bash
npm run build
```

The GitHub Actions workflow in `.github/workflows/deploy-pages.yml` runs the production build on pushes to `main` and publishes `dist/` to GitHub Pages.

## Open Technical Work

- Replace prototype pin coordinates with verified latitude/longitude data.
- Add a Google Maps JavaScript API integration if custom markers must move with native map zoom and pan.
- Add authentication and verified host profiles.
- Add payments, refunds, capacity limits, ratings, reporting, and moderation.
- Connect bar sponsorships to an advertiser dashboard and real billing.
- Confirm alcohol, food-service, university-property, and local event regulations before launch.
