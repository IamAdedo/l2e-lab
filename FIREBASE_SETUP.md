# Firebase setup for L2E LAB

The browser uses Firebase Anonymous Authentication. Candidates still see only the username prompt; no email or password is required.

1. In the `l2e-lab` Firebase project, open **Authentication > Sign-in method**, enable **Anonymous**, and save. Candidates do **not** need the Email/Password provider. Keep that off until a protected admin dashboard is added.
2. Create the default Cloud Firestore database in **Production mode** if it does not exist yet.
3. Deploy the checked-in rules and index configuration from this directory:

   ```bash
   npx firebase-tools login
   npx firebase-tools deploy --project l2e-lab --only firestore
   ```

4. If the app is deployed on a new domain, add that domain under **Authentication > Settings > Authorized domains**.

Learner records appear in **Firestore Database > Data > learners**. Each document ID is the learner's anonymous Firebase UID. The web client may get, create, and update only its own document; collection listing, other learners' documents, deletes, and every other Firestore path are denied. Firebase Console access uses the project owner's Google permissions, so it is not blocked by these client rules.

Anonymous identity belongs to one browser profile, not to a verified person: the same candidate on two devices can appear twice, and clearing all site data can create a new UID. This phase is intended for lightweight participation tracking. Add a permanent sign-in method later if learners need cross-device identity or account recovery.

Do not add a Firebase Admin service-account key to this repository. The Firebase web configuration is designed to be public; Firestore Security Rules are the data-access boundary.
