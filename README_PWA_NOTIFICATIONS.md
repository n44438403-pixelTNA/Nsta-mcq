# 🚀 PWA & Offline Setup Instructions for Admin (Manual Steps)

To fully enable the **PWA (Installable App)**, **Offline Mode**, and **Push Notifications** across all users, follow these manual configuration steps:

## 1. Deploy the Application
The `vite-plugin-pwa` module requires a production build to generate the Service Worker `sw.js` and caching manifests correctly.
- Ensure the application is deployed on a **secure HTTPS** domain (or `localhost` for testing). Service workers will **not** register on HTTP domains (except `localhost`).
- The build command `npm run build` handles creating the PWA configuration automatically.

## 2. PWA App Installation (User Guide)
Tell your students to do the following to install the app on their phone/desktop:
**On Android/Chrome:**
1. Open the website in Chrome.
2. Tap the 3-dot menu in the top right.
3. Tap **"Install App"** or **"Add to Home Screen"**.

**On iOS/Safari:**
1. Open the website in Safari.
2. Tap the Share icon (box with an arrow pointing up).
3. Scroll down and tap **"Add to Home Screen"**.

Once installed, the app will work offline. Users can save notes and MCQs and access them even without internet connectivity.

## 3. Configuring Push Notifications (Backend setup)
A basic notification prompt has been added to the frontend (`components/NotificationPrompt.tsx`) which requests permission and generates a Push Subscription object.

**To actually send notifications (e.g., from an Admin Panel to a Student's phone), you must:**
1. Generate your own **VAPID Keys** (using a tool like `web-push` library in Node.js).
2. Replace the placeholder `VAPID_PUBLIC_KEY` inside `components/NotificationManager.tsx` with your real Public VAPID Key.
3. Update the `handleEnable` function in `components/NotificationPrompt.tsx` to save the `subscription` object to your Firebase Database under the user's profile.
4. Set up a backend server (e.g., Firebase Cloud Functions or a Node.js server) that uses the `web-push` library and your Private VAPID Key to send push payloads to those saved subscription endpoints.

## Note on Offline Error ("Something went wrong")
The white screen/React Minified #300 error occurred previously because the app tried to render undefined network data. The newly registered Service Worker intercepts network requests and serves cached data or offline fallbacks, preventing the app crash.
