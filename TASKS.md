# Clipboard Manager: Task & Progress Tracker

## Progress Tracking

- [x] Set up rsbuild and migrate to file-based routing
- [x] Integrate Yamada UI and set up UIProvider
- [x] Implement persistent clipboard storage (infinite history)
- [x] Backend: Implement instant search support (SeekStorm API, Tauri commands)
- [x] Implement instant search UI (search input, results list, instant updates)
- [x] Implement image clipboard support and OCR (multi-format, Tesseract, etc.)
- [x] Persist clipboard entries to disk using SeekStorm
- [x] Print preview of first 10 words on save
- [x] Use paginated clipboard entry fetching in frontend
- [x] Fix linter errors and update backend/frontend integration
- [x] Deduplicate clipboard entries by content, showing only the latest entry for each unique content
- [x] Display the count of occurrences for each unique clipboard entry in the sidebar and details panel
- [x] SidebarList and DetailsPanel update reactively when clipboard entries change
- [x] Infinite scroll and pagination in SidebarList
- [x] Keyboard navigation and selection logic fixed for deduplicated entries
- [x] Refactor copy logic for clipboard entries (text and image) into a shared utility function
- [x] Add copy button for all entry types in DetailsPanel
- [x] Add OCR copy icon button for images in DetailsPanel
- [x] Use correct clipboard APIs for each type
- [x] Use Yamada UI Button/IconButton and icons for copy actions
- [x] Test and polish UI/UX for copy actions
- [x] Memoization optimizations: React.memo, useMemo, useCallback applied where beneficial
- [x] Fix image saving and rendering (PNG, base64, Tauri asset protocol)
- [x] Refactor SidebarList to use InfiniteScrollArea and infinite query data
- [x] Move scroll-to-selected-item logic to parent (index.tsx)
- [x] Auto-focus input in TopBar when window gains focus
- [x] Add tray menu, autostart, global shortcut, vibrancy, and window toggling in Tauri backend
- [x] Fix Rust compilation errors and warnings

# Tasks

- [x] Install and initialize pnpm changeset for versioning and changelog management
- [x] Create .github and .github/workflows directories for GitHub Actions workflow
- [x] Set up a GitHub Actions workflow to build the app and create a release when a changeset PR is merged, with release notes and version set automatically
  - [ ] (Optional) Add NPM_TOKEN secret if publishing to npm is required
- [x] Update release workflow: remove npm publish, use `pnpm tauri build` for building
- [x] Initialize Biome for linting and formatting
- [x] Add CI workflow: check types, build, and run biome linter
- [ ] Fix CSP issues in tauri.conf.json

## Issue

**Problem:**  
In the dev server, all styles work, but after building the app, no styles are applied.

## Investigation Steps

- [x] Check if CSS is being bundled in production.
- [x] Check for missing CSS loaders or plugins.
- [x] Check for differences between dev and prod config.
- [x] Check for errors or warnings during build.
- [x] Check the output HTML for missing or incorrect CSS links.
- [x] Check if UI library requires CSS import.
- [x] Check if styles are inline (CSS-in-JS).
- [x] Check if Emotion (used by Yamada UI) is being handled correctly in production.

---

## Progress & Findings

- You are using **@yamada-ui/react**, which is built on top of Emotion (CSS-in-JS).
- In dev, Emotion injects styles at runtime, but in production, some build tools (like Rspack/Rsbuild) may not handle Emotion's SSR or style injection correctly out of the box.
- **No Emotion or Babel plugin configuration is present in your setup.**
- This is a common issue with Rspack/Rsbuild and Emotion/Chakra/Mantine/etc. when not using the correct Babel plugin or loader for production.

---

## Solution (In Progress)

- [ ] Add @emotion/babel-plugin as a dev dependency.
- [ ] Add a babel.config.js with the @emotion plugin.
- [ ] Update rsbuild.config.ts to ensure Babel plugin is picked up.
- [ ] Rebuild and verify styles in production build.

## In Progress

- [ ] Verify CI workflow after adding `libwebkit2gtk-4.1-dev` (for JavaScriptCoreGTK support) to system dependencies on Ubuntu runners.
- [x] Update CI workflow to install system dependencies (`libglib2.0-dev`, `libgtk-3-dev`, `libwebkit2gtk-4.1-dev`) for Tauri builds on Ubuntu runners.

## Completed

- [x] Update CI workflow to install system dependencies (`libglib2.0-dev`, `libgtk-3-dev`, `libwebkit2gtk-4.1-dev`) for Tauri builds on Ubuntu runners.

## Troubleshooting Notes

- If you see an error about `glib-2.0` not being found during a Tauri build in CI, install the `libglib2.0-dev` package on Ubuntu. This provides the required `glib-2.0.pc` file and headers for the build.
- If you see an error about `gdk-3.0` not being found, install the `libgtk-3-dev` package on Ubuntu. This provides the required `gdk-3.0.pc` and GTK 3 development files.
- If you see an error about `javascriptcoregtk-4.1` not being found, install the `libwebkit2gtk-4.1-dev` package on Ubuntu. This provides the required `javascriptcoregtk-4.1.pc` and WebKitGTK development files.
