1. **Remove Duplicate App Name Header in Student Dashboard**
   - The user noted the app name is showing in two places. `App.tsx` has a `<header>` that shows the app name when `!isFullScreen`.
   - `StudentDashboard.tsx` also renders its own new sticky Top Bar header showing the app name.
   - We should hide the `<header>` in `App.tsx` when `state.view === 'STUDENT_DASHBOARD'`, since `StudentDashboard.tsx` now has its own top bar.

2. **Fix Locked MCQ Section**
   - In `components/ChapterSelection.tsx`, the logic for `isLocked` is `const isLocked = !isAdmin && (isExplicitlyLocked || (restrictionEnabled && index > userProgress.currentChapterIndex));`.
   - The image shows "Complete previous chapter MCQs (100) to unlock".
   - The user says "abhi bhi mcq wale section lock hai" (still the MCQ section is locked).
   - In a recent instruction (memory): "The 'Free Practice' (now 'Standard Practice') and 'Universal Video' features are openly accessible; their previous lock restrictions have been permanently removed from McqView.tsx and StudentDashboard.tsx."
   - We need to completely disable the sequential chapter locking (`enableMcqUnlockRestriction`) to make it freely accessible.

3. **Fix Universal Video Lock**
   - The user mentioned "univercel vidio ka bhi page lock hai".
   - In `components/StudentDashboard.tsx`, the Universal Video button has:
     ```tsx
     const access = getFeatureAccess('VIDEO_ACCESS');
     if (access.isHidden) return null;
     const isLocked = !access.hasAccess;
     ```
   - According to the memory: "The 'Free Practice' (now 'Standard Practice') and 'Universal Video' features are openly accessible; their previous lock restrictions have been permanently removed from McqView.tsx and StudentDashboard.tsx."
   - We should change `const isLocked = false;` for Universal Video or remove the lock logic entirely so it's always accessible.

4. **Complete Pre-Commit Steps**
   - Run verification scripts or Playwright UI scripts.
   - Run the check for tests.

5. **Submit the changes.**
