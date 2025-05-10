# Migration & Setup Tasks for Clipboard Manager

## Progress Tracking

- [x] 1. Set up rsbuild
- [x] 2. Create `src/routes` directory for file-based routing
- [x] 3. Move layout to `src/routes/__layout.tsx`
- [x] 4. Move home page to `src/routes/index.tsx`
- [x] 5. Update `main.tsx` to use file-based routing with TanStack Router
- [x] 6. Test routing and ensure app works as before
- [x] 7. Add more routes/pages as needed
- [x] 8. Integrate Yamada UI and set up UIProvider
- [x] 9. Set up persistent clipboard storage (infinite history)
- [x] Backend: Implement instant search support (SeekStorm API, Tauri commands)
- [x] 10. Implement instant search UI (search input, results list, instant updates)
- [ ] 11. Implement image clipboard support and OCR (multi-language)
- [ ] 12. Store and search by application name/exe and extracted text
- [ ] 13. Implement global shortcut (Alt+V, customizable) to open/close window
- [ ] 14. Add filtering by clipboard type (image, color, text, etc.)
- [ ] 15. Detect and preview color codes (hsl, hex, rgba, etc.)
- [ ] 16. UI: Search input and filter options on top
- [ ] 17. UI: Infinite scroll list (left), active index result (right) with info (date, type, copy count, first copied, app name)
- [ ] 18. List navigation: mouse wheel, up/down arrow keys
- [ ] 19. Show icons for each type using @yamada-ui/lucide
- [ ] 20. Copy on enter/double-click, and copy button in details
- [ ] 21. Image preview in list and details, show extracted text for images
- [ ] 22. Polish for beautiful, native, lightweight feel

---

## Step 1: Set up rsbuild

1. Install rsbuild:
   ```sh
   pnpm add rsbuild --save-dev
   # or
   npm install rsbuild --save-dev
   # or
   yarn add rsbuild --dev
   ```
2. Create an `rsbuild.config.ts` or `rsbuild.config.js` in the project root.
3. Configure rsbuild for React and Tauri compatibility (if needed, add plugins for React, TypeScript, etc.).
4. Update your `package.json` scripts:
   - Replace `vite` commands with `rsbuild` equivalents (e.g., `rsbuild start`, `rsbuild build`).
5. Test the build and dev server:
   ```sh
   pnpm rsbuild start
   # or
   npm run rsbuild start
   ```
6. Ensure the app runs as expected before proceeding to routing migration.

---

## Feature Implementation Steps

### Clipboard Storage & Search

- Set up a local database (e.g., SQLite or high-performance embedded DB) for infinite clipboard history.
- Implement instant search using FTS (Full-Text Search) or in-memory index. **(Backend ready, UI next)**
- Store metadata: content, type, timestamp, app name, OCR text, color info, etc.

### Image & OCR

- Detect image clipboard entries.
- Use OCR (e.g., Tesseract.js) to extract text (multi-language support).
- Store extracted text and associate with image entry.

### Global Shortcut

- Use Tauri's global shortcut API to register Alt+V (make customizable).
- Toggle window visibility on shortcut.

### UI/UX (Yamada UI)

- Integrate Yamada UI and UIProvider at the root.
- Top: Search input and filter chips (type: text, image, color, etc.).
- Left: Infinite scroll list (TanStack Virtual), each item with icon, preview, and meta.
- Right: Details of active item (preview, extracted text, color swatch, copy button, etc.).
- Keyboard navigation (up/down, enter), mouse support, and copy actions.
- Show icons for each type using @yamada-ui/lucide.
- Color code detection and preview in details.
- Image preview and extracted text display.
- Ensure beautiful, native, and lightweight design.

---

_Check off each step above as you complete it. Update this file to track your progress!_

---

**Task:** Fix compilation errors in `src-tauri/src/clipboard.rs` related to unresolved imports and missing methods for the `seekstorm` crate. **(Done)**

**Subtasks:**

1. Investigate and resolve the unresolved import of `Value` from `seekstorm::index`. **(Done)**
2. Replace or refactor usage of `index_documents`, `search`, and `delete_documents` methods, as they do not exist on the `Index` type. **(Done)**
3. Remove unused imports as indicated by the warnings. **(Done)**
4. Ensure the clipboard functionality (add, search, delete) works with the available `seekstorm` API. **(Done)**
5. Rebuild and verify that the code compiles without errors. **(Done)**

**Progress:**

- Backend supports instant search and all clipboard operations via SeekStorm and Tauri commands.
- Frontend instant search UI (search input, results list, instant updates) is implemented in `src/routes/index.tsx` and working. Further UI polish, filtering, and advanced features are next.
- Next: Add filtering by clipboard type (image, color, text, etc.) in the UI.

## Prevent Tauri app from restarting on clipboard_index changes

- [ ] Add a `.taurignore` file in `src-tauri` to ignore the `clipboard_index` directory and its contents, so the Tauri dev watcher does not trigger a restart when clipboard data changes.
- [ ] Document this in TASKS.md and verify that the watcher no longer restarts the app on clipboard_index changes.

---

## New Task: Use Environment Variables for Clipboard Index Path in Rust

- [ ] Update `src-tauri/src/lib.rs` to use environment variables for `configDir` and `bundleIdentifier` in the clipboard index path instead of hardcoded placeholders.
- [ ] Ensure the Rust backend reads these variables using `std::env::var`.
- [ ] Document the required environment variables in the README or here.
- [ ] Test that the index is created in the correct location based on the environment.

**Progress:**

- Located the line in `src-tauri/src/lib.rs` that needs updating.
- Investigated current environment variable usage (none found yet in Rust backend).
- Updated the code to use `std::env::var` for these values and handle errors gracefully.
- Next: Document the required environment variables and test that the index is created in the correct location.
