# Overview

This is an AI-powered educational platform called "SWG (IIC)" / "NST AI Assistant" — a comprehensive student learning app built as a single-page React application. It supports multiple Indian education boards (CBSE, BSEB) and competitive exam preparation, offering AI-generated notes, video lectures, MCQ practice, weekly tests, daily challenges, audio content, leaderboards, a credit/subscription system, and a full admin dashboard for content and user management.

# User Preferences

Preferred communication style: Simple, everyday Hindi/Hinglish.

## Profile Page Settings Consolidation (April 2026)
- **Store button:** A new full-width purple/indigo gradient "Store" button on the Profile page navigates to the in-app Store tab where users can buy plans, credits, and premium upgrades.
- **Settings button:** A single full-width "Settings" button on the Profile page opens a bottom-sheet modal containing 5 options: Edit Profile, Marksheet, Theme toggle (Light → Black → Blue), View Full Activity, and Download Optimized Report.
- **Login split:** For guest users, the previous combined "Login / Create Account" button is now two separate buttons — "Login" (blue) and "Create Account" (green). They set `sessionStorage.auth_initial_view` to `'LOGIN'` or `'SIGNUP'` so `Auth.tsx` opens directly on the correct view.
- **Logout:** For logged-in users, a single full-width "Logout" button remains below the Settings button.
- **Removed:** The old "My Data" section and the 4-button grid (Edit Profile / Marksheet / Theme / Logout) on the Profile page.

## Free Tier Access Expansion (April 2026)
- **MCQ daily limits (NSTA_DEFAULT_FEATURES → MCQ_FREE):** Free = 30/day, Basic = 50/day, Ultra = 100/day.
- **Revision Hub:** Level lock for `REVISION_HUB` lowered from Level 20 to Level 1 (`LEVEL_UP_CONFIG` in constants.ts), so free users with low level can use it. The hub itself already has a Free mode (`hubMode = 'FREE'`) for non-premium users.
- **Notes for Free users:** `PREMIUM_NOTES` allowedTiers expanded to `['FREE','BASIC','ULTRA']` with `creditCost: 0`, and a new `NOTES_ACCESS` entry is added (FREE/BASIC/ULTRA) so free users can read notes without paying credits.

## Auth & MCQ Gate Update (May 2026)
- **Login page:** Shows email/password login + "Create Account" (email signup) + "Skip for now" button. Google sign-in removed from login page.
- **Google auth:** Available from Profile page → "Connect with Google" button (in the profile tab). Shows for non-Google users, marks account as `provider: 'google'` when connected.
- **Skip:** Clicking "Skip for now" creates a guest user (in-memory only, not saved to localStorage) and enters the app.
- **Guest MCQ gate:** When a guest user tries to access any MCQ type content (MCQ_SIMPLE, MCQ_PRACTICE, MCQ_TEST, MCQ_ANALYSIS), a popup modal is shown asking them to create an account or login. MCQ is blocked until authenticated.
- **Guest persistence:** Guest users are NOT saved to localStorage. Every fresh app load shows the auth page for unauthenticated users.
- **Logout:** Clears localStorage user, sets state.user to null — auth page shows on next load.

## Auth & Onboarding Redesign (April 2026)
- **Account creation:** Google sign-in only — no email/password signup, no name/class/board onboarding wizard.
- **Login:** Google sign-in is the primary path.
- **Recovery:** Mobile number + recovery password (set in user profile) — accessible via "Login with Mobile + Password" link on Auth home.
- **Onboarding skipped:** New Google sign-ins are auto-set with `profileCompleted=true`, `board='CBSE'`, `classLevel='6'`. Existing users with missing fields are silently auto-filled on login.
- **Class access:** Every user can browse classes 6–12 and COMPETITION freely. A class quick-switcher chip row lives at the top of the Student Dashboard HOME tab.
- **Lesson tap behavior:** Tapping a chapter goes directly into MCQ mode (no lesson-action modal asking notes/MCQ/audio/video).
- **Universal Video:** Feature removed from the dashboard tile and route (route silently redirects to HOME for any old links).

# System Architecture

## Frontend (Client-Side SPA)
- **Framework:** React 19 with TypeScript
- **Build Tool:** Vite (dev server runs on port 5000, host 0.0.0.0)
- **Styling:** Tailwind CSS (loaded via CDN in index.html), custom CSS in `index.css` with dark mode support (AMOLED black), custom scrollbars, and animations
- **UI Components:** Custom component library in `components/` — no external UI framework. Uses `lucide-react` for icons, `framer-motion` for animations
- **Math Rendering:** KaTeX via `remark-math` and `rehype-katex` for LaTeX formulas
- **Markdown:** `react-markdown` for rendering AI-generated content
- **PDF Handling:** `react-pdf` with `pdfjs-dist` for PDF viewing
- **Video:** Custom YouTube/Google Drive embed player (`CustomPlayer.tsx`), `react-player`
- **Image Cropping:** `react-easy-crop` for profile photo cropping
- **State Management:** React useState/useEffect with localStorage for persistence. No Redux or external state library. The `storage` utility (`utils/storage.ts`) abstracts localStorage operations
- **Path Aliases:** `@/*` maps to project root via tsconfig paths

## Backend / API Layer
- **Serverless Edge Functions:** Located in `api/` directory (designed for Vercel Edge Runtime)
  - `api/gemini.ts` — Proxy for Google Gemini AI API calls (handles key rotation, model selection)
  - `api/groq.ts` — Proxy for Groq AI API calls (LLaMA models, with model allowlist validation)
- **No traditional backend server** — all data operations happen client-side through Firebase SDKs

## Data Storage (Firebase)
- **Firebase Firestore** — Primary document database for structured data (user profiles, chapter data, settings, test results)
- **Firebase Realtime Database (RTDB)** — Used for real-time features (live activity feeds, settings sync, custom page content)
- **Firebase Auth** — Authentication (supports email/password and anonymous sign-in)
- **LocalStorage** — Extensive client-side caching layer for offline support and performance. Nearly all Firebase data is cached locally with `nst_` prefixed keys
- **Data Sanitization:** `sanitizeForFirestore()` helper removes undefined values before Firestore writes (Firestore rejects undefined)

## AI Integrations
- **Google Gemini** — Primary AI for content generation (notes, lesson content, dev assistant). Keys managed via admin dashboard or `GEMINI_API_KEYS` env var
- **Groq (LLaMA/Mixtral)** — Secondary AI for chapter generation, lesson content fetching (`services/groq.ts`). Keys via admin dashboard or `GROQ_API_KEYS` env var
- **Text-to-Speech** — Browser's Web Speech API (`utils/textToSpeech.ts`) for reading content aloud
- **Smart Analysis** — Non-AI topic strength tracking: MCQ results are analyzed locally by tagging questions with topics and tracking per-topic accuracy over time

## Key Architectural Patterns

### Multi-Board Education System
The app supports multiple education boards (CBSE, BSEB) and competitive exam prep. Content is keyed by board, class level, stream (for 11th/12th), subject, and chapter. Key format: `nst_content_{board}_{class}{-stream}_{subject}_{chapterId}`

### Role-Based Access Control
Three roles: STUDENT, ADMIN, SUB_ADMIN. Admin has full control via `AdminDashboard.tsx`. Students see `StudentDashboard.tsx`. Premium/subscription tiers (Basic, Ultra) gate content access.

### Credit & Subscription System
Students earn credits through daily logins, challenges, spin wheel, and activity. Credits can be spent on premium content. Subscription tiers unlock content categories. All tracked in user object and synced to Firebase.

### Content Pipeline
1. Admin configures chapters via the dashboard (manual or AI-generated via Groq/Gemini)
2. Content types include: free/premium notes, MCQs, PDFs, video lectures, audio playlists
3. Content is stored in Firebase with local caching
4. Students access content through a hierarchical navigation: Board → Class → Stream → Subject → Chapter → Content Type

### Offline-First Design
Heavy use of localStorage caching. Firebase data is synced when online but the app functions with cached data when offline. The `WifiOff` icon import suggests offline state handling.

## Project Structure
```
/                    — Root config files, types, constants, syllabus data
/api/                — Vercel Edge serverless functions (Gemini, Groq proxies)
/components/         — React UI components (30+ components)
/components/admin/   — Admin-specific components
/services/           — AI service integrations (groq.ts, adminAi.ts, autoPilot.ts, etc.)
/utils/              — Utility functions (storage, TTS, math rendering, etc.)
```

## Testing
- **Playwright** — Multiple Python verification scripts (`verify_*.py`) for UI testing
- **No unit test framework** currently configured

# External Dependencies

### Firebase (Core Backend)
- **Firestore** — Document database for users, content, settings
- **Realtime Database** — Live data sync (activity feeds, settings)
- **Authentication** — User auth (email/password, anonymous)
- Project ID: `iic-adf79`

### AI APIs (via Edge Proxies)
- **Google Gemini API** — Content generation, dev assistant (keys via env `GEMINI_API_KEYS` or admin config)
- **Groq API** — Chapter/lesson generation using LLaMA/Mixtral models (keys via env `GROQ_API_KEYS` or admin config)

### CDN Dependencies
- **Tailwind CSS** — Loaded via CDN (`cdn.tailwindcss.com`)
- **KaTeX** — Math formula rendering CSS from CDN
- **Google Fonts** — Inter and Crimson Text fonts
- **PDF.js Worker** — Loaded from unpkg CDN

### NPM Packages (Key ones)
- `firebase` — Firebase SDK
- `react-markdown`, `remark-math`, `rehype-katex` — Markdown + math rendering
- `react-pdf`, `pdfjs-dist` — PDF viewing
- `react-easy-crop` — Image cropping
- `framer-motion` — Animations
- `lucide-react` — Icon library
- `html2canvas` — Screenshot/export functionality
- `jszip` — ZIP file handling
- `react-qr-code` — QR code generation
- `zod`, `drizzle-zod` — Schema validation (present in deps but Drizzle ORM not actively used with a database)
- `localforage` — Enhanced local storage