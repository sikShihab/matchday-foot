# MatchDay Web App

MatchDay is a Firebase-powered football turf booking web app with:
- player and admin experiences
- live match slot booking
- fixtures and highlight feeds
- announcements and activity
- responsive mobile navigation

## Current Product Highlights
- Role-based auth (`admin` vs `player`)
- Match booking with slot cap per user (max 4)
- Dynamic player-name collection by slot count:
  - 2 slots -> primary user + 1 additional player name
  - 3 slots -> primary user + 2 additional player names
  - 4 slots -> primary user + 3 additional player names
- Post-booking auto-navigation to Players List
- Validation for additional player names:
  - exact required count
  - no duplicates
  - cannot repeat booking user name
- Admin match creation and announcement management
- Responsive menu overlay for mobile usability

## Tech Stack
- Frontend: Vanilla HTML/CSS/JS (ES modules)
- Backend: Firebase Authentication + Firestore
- Hosting: Vercel (or any static host)

## Project Structure
- `index.html` -> app shell and all sections/views
- `styles.css` -> UI styling and responsive rules
- `app-main.js` -> main frontend logic (loaded by `index.html`)
- `app.js` -> synced JS copy
- `functions/` -> optional Firebase Functions workspace
- `firestore.rules` / `storage.rules` -> Firebase security rules

## Setup
1. Create/prepare a Firebase project.
2. Enable Firebase Authentication providers:
   - Email/Password
   - Google
3. Enable Firestore.
4. Update `firestore.rules` and publish rules.
5. Verify Firebase config in `app-main.js`.
6. Deploy the root folder to Vercel.

## Run Locally
Serve the project with any static server from repo root, for example:

```bash
npx serve .
```

Then open the local URL and test login + booking flow.

## Deployment Notes
- `index.html` currently loads `app-main.js` as the runtime script.
- Keep `app.js` in sync if you maintain both files.
- If you deploy Cloud Functions from `functions/`, treat them as optional unless frontend integration is explicitly added.

## Recommended Next Enhancements
- Convert section switching to explicit URL route aliases (`#live`, `#fixtures`, etc.).
- Add booking history and receipt archive per user.
- Add robust input masking/format validation for phone and payment metadata.
- Add automated tests for booking edge cases and role-based UI access.

## Sportmonks Integration
- The app now fetches fixtures/live data through Vercel API route: /api/sportmonks.
- Add Vercel environment variable: SPORTMONKS_API_TOKEN (Project Settings -> Environment Variables).
- Do not expose the Sportmonks token in frontend JS.
- Lineup data is loaded on-demand per fixture from the same proxy route.

