# L2E LAB

L2E LAB is a public, no-password learning workspace for Learn2Earn / Talent Nation students. It opens directly to a card-based learning hub, not a marketing landing page. Python is the active track in this release. Learners build projects, run real Python in the browser, check both results and required techniques, and keep progress on their device.

## Run locally

```bash
npm install
npm run dev
```

Open `http://localhost:5173`.

The first Python run downloads the Pyodide runtime, so it needs an internet connection. Later runs reuse the loaded browser worker.

## Public learning experience

- `/` — public learning hub; no password required
- `/projects` — Python builds are active; React and JavaScript briefs are visibly locked
- `/projects/:slug/build` — autosaving Python workspace with Run code and Check work flows
- `/playground` — fullscreen Python playground without the public navigation
- `/daily` — 100-day course shelf; Python is unlocked and React/JavaScript are Coming soon
- `/daily/python` — all 100 Python day cards, with every day selectable and completed badges
- `/community` — seeded examples plus showcase drafts saved in this browser
- `/my-learning` — project, daily challenge, and local publication progress

Before the first Python course or coding workspace opens, the learner chooses a username. No email, password, or signup form is required. Firebase creates an anonymous browser session in the background and syncs the username, completed challenge days, and finished project IDs to the private `learners` collection when online. Local storage remains the immediate source of truth, so a network failure never blocks the workspace.

Code drafts, likes, and showcase submissions remain only in the current browser. An anonymous Firebase identity does not automatically follow a learner to another device and can be lost when site data is cleared.

Python runs in a dedicated Pyodide Web Worker with captured output, errors, a stop action, and an execution timeout. `Check work` executes visible and hidden behavioural cases and inspects Python syntax for required or forbidden techniques, such as requiring a `for` loop or rejecting `max()`. Passing every check creates the completed badge; publishing remains optional.

## Firebase

Follow [FIREBASE_SETUP.md](./FIREBASE_SETUP.md) to enable Anonymous Authentication, create Firestore, and deploy the checked-in owner-only security rules. Project owners can view learner records in **Firestore Database > Data > learners**.

## Prototype boundaries

The LAB dashboard routes are intentionally disabled for now. Browser checks are useful learning feedback, but production grading and truly secret hidden tests must eventually run on a hardened server sandbox. Pyodide supports browser-compatible Python, not normal Flask/Django servers, subprocesses, or arbitrary native packages.

Official Learn2Earn logo, white wordmark, texture, and font assets are vendored in `public/` from `https://learn2earn.ng/`.
