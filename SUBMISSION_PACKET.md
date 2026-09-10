# Tailgate Finder Submission Packet

## 1. Live URL

[Open the live Tailgate Finder webpage](https://agosu-01.github.io/Tailgate-Finder/)

The site is deployed through GitHub Pages from the `main` branch.

## 2. Repository And Source

[Open the public GitHub repository](https://github.com/AGOSU-01/Tailgate-Finder)

The source is a Vite + React + TypeScript project. The primary product files are:

- [src/App.tsx](src/App.tsx): product behavior, schedules, listings, map overlays, and interactions
- [src/App.css](src/App.css): responsive visual system and map/listing layout
- [README.md](README.md): local setup and build commands
- [BUILD_LOG.md](BUILD_LOG.md): detailed prompt, revision, finding, and discovery history
- [.github/workflows/deploy-pages.yml](.github/workflows/deploy-pages.yml): GitHub Pages deployment

## 3. Named Consequential Hypothesis

**Hypothesis H1:** For fans attending an Ohio State home football game who do not already have a complete pregame plan, a map that combines tailgates and local bars will increase willingness to make a game-day plan compared with a tailgate-only directory.

**Why consequential:** If H1 is false, the product should remain a narrower tailgate discovery tool rather than spend time building bar sponsorships, promoted listings, and a broader marketplace.

**Testable outcome:** After using the prototype for three minutes, a participant can identify one acceptable pregame option and reports at least 4 out of 5 willingness to use the product for an upcoming game.

### Precommitted decision rule

Run the test with at least 10 eligible participants. Count a participant as a success only when they both identify an acceptable option and give a willingness score of 4 or 5.

- **Proceed with the marketplace direction:** at least 7 of 10 participants succeed, and at least 3 participants independently mention bars or other non-tailgate options as useful.
- **Revise the concept:** 5 or 6 of 10 participants succeed, or fewer than 3 mention the broader game-day options.
- **Reject the broader marketplace direction:** 4 or fewer of 10 participants succeed. Keep only the strongest tailgate discovery workflow and remove or defer paid bar promotion.

This rule is written before collecting participant responses so the threshold is not changed after seeing the results.

## 4. Ethical User-Test Evidence

**Current evidence status: not yet collected. Denominator: `n=0`.** No human participant results are being claimed in this submission.

The current evidence is limited to product review and software validation. A human test should use:

- Voluntary participation with informed consent
- No collection of names, emails, precise location history, or private account data
- The option to stop at any time without explanation
- A short task using prototype data only
- Anonymous results recorded as counts, not identifiable profiles
- A clear note that bar offers and tailgate listings are fictional prototype content

### Planned evidence table

| Measure | Numerator | Denominator | Current result |
|---|---:|---:|---|
| Participants who identify an acceptable pregame option | 0 | 0 | Not yet tested |
| Participants scoring willingness 4 or 5 | 0 | 0 | Not yet tested |
| Participants mentioning bars or broader game-day options | 0 | 0 | Not yet tested |

The denominator is intentionally visible so prototype validation is not presented as user research.

## 5. Venture-Economics Snapshot

Initial model assumptions for the class prototype:

| Revenue stream | Assumption | Example economics |
|---|---|---:|
| Sponsored bar placement | `$250` per Ohio State home game | 7 bars x $250 = `$1,750` per home game |
| Paid tailgate transaction | 10% platform fee | 100 attendees x $25 x 10% = `$250` per tailgate |
| Parking transaction | 12% platform fee | 50 spaces x $20 x 12% = `$120` per event |
| Host premium tools | `$19` per month | 25 hosts x $19 = `$475` monthly |

**Illustrative home-game snapshot:** If 7 bars, 4 paid tailgates, and 2 parking listings sell in one home game, gross platform revenue is approximately `$3,030` before payment processing, insurance, moderation, customer support, taxes, and acquisition costs.

These are planning assumptions, not validated revenue. The next economic test is to ask five local venues whether `$250` for one home-game placement is a credible starting offer and to record the denominator and response count.

## 6. AI And Build Log

The detailed [AI/build log](BUILD_LOG.md) records the prompts that drove the project, implementation revisions, findings, discoveries, technical limitations, and validation commands.

Verified build command:

```bash
npm run build
```

Latest verified result: TypeScript check and Vite production bundle passed.

## 7. Revision Receipt

| Commit | Revision | Evidence |
|---|---|---|
| `5fe2f2b` | Created the React/Vite Tailgate Finder prototype and core discovery UI | Initial source, README, and project config |
| `d56728a` | Added GitHub Pages configuration and deployment workflow | Pages workflow and Vite base path |
| `f2a7c4b` | Added the first build log and linked it from the README | Build/deployment documentation |
| `ed8c6bf` | Expanded the build log with prompts, revisions, findings, discoveries, and open technical work | Detailed AI/build history |

Current branch: `main` tracking `origin/main`.

## 8. Important Prototype Boundary

The map, offers, addresses, prices, and listings are prototype data. Before public use, verify every venue location, obtain venue permission for paid promotion, add moderation and reporting, and review alcohol, food-service, university-property, advertising, and payment requirements.
