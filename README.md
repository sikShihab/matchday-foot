# MatchDay Complete

This package includes the upgraded MatchDay app plus Firebase Cloud Functions for race-safe booking.

## Included upgrades
- Server-side booking with Firebase Admin SDK via callable Cloud Functions
- Auto-updated `bookedCount` and auto-close when a match fills up
- Admin analytics cards
- Scheduled function to close past matches
- SPA frontend for Vercel

## Frontend deploy
1. Put your real logo at `assets/logo.png`
2. Enable Firebase Authentication: Email/Password and Google
3. Enable Firestore
4. Enable Storage
5. Paste `firebase.rules` into Firestore Rules
6. Paste `storage.rules` into Storage Rules
7. Deploy this folder to Vercel

## Cloud Functions deploy
1. Install Firebase CLI
2. From your Firebase project root, copy the `functions` folder there
3. Run:
   ```bash
   firebase login
   firebase use matchday-44a3c
   cd functions
   npm install
   cd ..
   firebase deploy --only functions
   ```

## What the callable functions do
- `bookMatch`: validates auth, prevents duplicates, prevents overbooking, increments count safely
- `cancelBooking`: removes the current user's booking and reopens match if needed
- `kickPlayer`: admin removes a player from a match
- `closePastMatches`: runs every hour and closes matches older than current time

## Notes
- The frontend is wired to your Firebase project config.
- The callable functions are set to `us-central1`. Keep that region in `app.js` unless you deploy elsewhere.
- The app uses Cloud Functions for booking actions, so deploy the functions before testing booking.
