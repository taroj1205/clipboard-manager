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
- [x] 11. Implement image clipboard support and OCR (multi-format, Tesseract, etc.)
- [x] 12. Persist clipboard entries to disk using SeekStorm
- [x] 13. Print preview of first 10 words on save
- [x] 14. Use paginated clipboard entry fetching in frontend
- [x] 15. Fix linter error: replaced iter_doc_ids with search-based enumeration for all clipboard documents
- [ ] 16. Detect and preview color codes (hsl, hex, rgba, etc.)
- [ ] 17. Store and search by application name/exe and extracted text
- [ ] 18. Implement global shortcut (Alt+V, customizable) to open/close window
- [x] 19. Add filtering by clipboard type (image, color, text, etc.)
- [x] 20. Show icons for each type using @yamada-ui/lucide
- [x] 21. Copy on enter/double-click, and copy button in details
- [x] 22. Image preview in list and details, show extracted text for images
- [x] 23. Polish for beautiful, native, lightweight feel
- [x] 24. Register and initialize the clipboard plugin in the Tauri builder (fix panic) — Added .plugin(tauri_plugin_clipboard::init()) to the builder chain in src-tauri/src/lib.rs
- [x] 25. Implement automatic clipboard entry addition in the frontend using a utility at src/utils/clipboard.ts that calls the Tauri command
- [x] 26. Implement automatic clipboard monitoring in the frontend and add new entries using the clipboard utility
- [x] 11.1. Install tesseract.js and set up OCR extraction in clipboard-listener.ts
- [x] 11.2. When an image is copied, use OCR to extract text and save it in the clipboard entry content
- [x] tesseract.js dependency installed
- [x] Show image in details panel if clipboard entry is of type 'image', using Image from @yamada-ui/react and selectedEntry.path as src
- [x] Fix linter error in `src/clipboard-listener.ts` by using the correct `BaseDirectory` usage for subdirectories when saving images.
- [x] Fix 'Not allowed to load local resource' error by using Tauri's convertFileSrc for image paths
- [x] Add edit database entry function in src/utils/clipboard.ts
- [x] Update clipboard entry workflow: add entry to DB before extracting text, then update entry after extraction
- [x] Update tauri.conf.json to support asset protocol for image loading in the webview, including CSP and assetProtocol settings.
- [x] Ensure clipboard image data is saved as proper PNG format in `src/clipboard-listener.ts` before writing to file.
  - If the data from `readImageBase64` is not a valid PNG, convert it to PNG using a browser API or a library.
  - Update the file writing logic to handle this.
  - Test that the saved file is a valid PNG and can be opened by standard image viewers.
    - [x] Done: Now checks for PNG base64 header and uses canvas to convert to PNG if needed before saving.
- [x] 27. Support copying sidebar list item on Enter key or double-click (text or image)
- [x] Deduplicate clipboard entries by content, showing only the latest entry for each unique content.
- [x] Display the count of occurrences for each unique clipboard entry in the sidebar and details panel.

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

**Task:**  
Utilize `React.memo`, `useMemo`, and `useCallback` in the components and routes under `src/routes` and `src/components` to optimize rendering and performance.

**Subtasks:**

1. Audit all components and routes for current usage of `memo`, `useMemo`, and `useCallback`.
2. Add `React.memo` to components that can benefit from shallow prop comparison.
3. Use `useMemo` for expensive computations or derived values that depend on props/state.
4. Use `useCallback` for callback props that are passed to memoized children.
5. Avoid unnecessary memoization in static or trivial components.

**Progress:**

- [x] Audited all files in `src/routes` and `src/components` for current usage.
- [x] `TopBar` already uses `React.memo`.
- [x] Added `React.memo` to `SidebarList` and `DetailsPanel`.
- [x] Used `useMemo` for `filteredResults`, `grouped`, and `typeOptions` in `HomeComponent`.
- [x] Used `useCallback` for `setQuery`, `setTypeFilter`, and `setSelectedIndex` in `HomeComponent`.
- [x] Skipped memoization for static/about/root routes.

---

**All relevant memoization optimizations have been applied.**

---

**New Task:**

- ~~Update `src/components/details-panel.tsx` to use `DataList`, `DataListItem`, `DataListTerm`, and `DataListDescription` from `@yamada-ui/react` for a table-like details layout, as per the user's request and example.~~
  - Complete: The details panel now uses DataList and related components for a table-like display.

## Task: Ensure UI Updates After Clipboard Entry Insert

### Goal

When a new clipboard entry is inserted in `clipboard-listener.ts`, the UI components (`SidebarList`, `DetailsPanel`, and the main page in `index.tsx`) should update automatically to reflect the new entry.

### Steps

1. **Clipboard Listener:**

   - After inserting a new clipboard entry, trigger a mechanism to notify the UI of the update. **(Done)**

2. **UI Update Mechanism:**

   - Use a state management or event system (e.g., React Query's `invalidateQueries`, a global event, or a context) to refresh the clipboard entries in the UI. **(Done)**

3. **Update `index.tsx`:**

   - Ensure the query fetching clipboard entries is refetched when a new entry is added. **(Done)**

4. **SidebarList & DetailsPanel:**
   - Confirm these components reactively update when the clipboard entries change. **(Done)**

---

**Progress:**

- [x] 1. Add a notification/event after DB insert in `clipboard-listener.ts`.
- [x] 2. Invalidate or refetch clipboard entries in the UI.
- [x] 3. Ensure `SidebarList` and `DetailsPanel` update with new data.

**Result:**

- The UI now updates automatically after a clipboard entry is inserted, using a custom event and React Query refetch.

## Completed Tasks

### Fix Image Rendering in Clipboard Manager

- Updated `src/clipboard-listener.ts` to save only the base64 image data (without the data URL prefix) when writing clipboard images to disk.
- Updated `src/components/clipboard-image.tsx` to convert the Uint8Array returned by `readFile` to a base64 string and prepend the `data:image/png;base64,` prefix before rendering the image.
- This ensures that images copied to the clipboard are now rendered correctly in the UI.

### Fix Image Saving to Write Binary PNG Data

- Updated the Tauri backend (`src-tauri/src/api/file.rs`) so that when saving a `.png` file, it decodes the base64 string and writes the binary PNG data to disk. This ensures the file is a valid PNG image and can be rendered by the frontend.

## New Task: Add Copy Buttons to Details Panel

### Goal

Enhance the details panel to allow users to:

- Copy the content of the selected clipboard entry (if type is image, copy as image; otherwise, copy as text).
- If the entry is an image, add an icon button to copy the OCR text (content) as text.

### Steps

1. Add a copy button to the details panel for all entry types.
2. If the entry is an image, add an icon button to copy the OCR text (content) as text.
3. Use the appropriate clipboard API for text and image copying (Tauri clipboard plugin for images, Clipboard API for text).
4. Use Yamada UI's `Button` and `IconButton` components for the UI.
5. Use a suitable icon from `@yamada-ui/lucide` for the copy actions.
6. Test the feature for both text and image entries.

**Progress:**

- [ ] Add copy button for all entry types
- [ ] Add OCR copy icon button for images
- [ ] Use correct clipboard APIs for each type
- [ ] Use Yamada UI Button/IconButton and icons
- [ ] Test and polish UI/UX

## New Task: Improve Clipboard Search Ranking by Relevance

### Goal

When a user searches the clipboard history, results should be ordered by how well they match the query, not just by timestamp. The most relevant (most matching) entries should appear first.

### Steps

1. Update the SQL query in `getPaginatedClipboardEntries` to rank results by relevance to the query string.
2. Use SQLite's FTS (Full-Text Search) or a custom relevance formula (e.g., position of match, number of occurrences, exact match boost).
3. If FTS is not available, implement a basic relevance score in the SQL query (e.g., exact match > starts with > contains > timestamp).
4. Test with various queries to ensure the most relevant results appear first.
5. Update documentation and mark this task as complete when done.

**Progress:**

- [ ] 1. Update SQL query for relevance ranking
- [ ] 2. Use FTS or custom relevance formula
- [ ] 3. Ensure search is case-insensitive (e.g., searching for 'tHis Text' matches 'THIS IS A TEXT')
- [ ] 4. Support multi-word (tokenized) search (e.g., searching for 'bg gray' matches 'bg="gray.700"')
- [ ] 5. Test and validate improved ranking
- [ ] 6. Update documentation

# Tasks

- [x] Refactor `src-tauri/src/lib.rs` to:
  - Add tray menu with autostart and quit options
  - Add autostart support (macOS/Windows)
  - Add global shortcut (alt+v) to toggle popup window
  - Add window toggling logic
  - Add support for vibrancy/mica effects
  - Add database migration logic
  - Add clipboard monitoring
  - Add invoke handlers for new APIs
  - Add window event to hide on unfocus (except in dev)

---

Progress:

- Implementation complete. All requested features have been added to `src-tauri/src/lib.rs` and supporting files.

### Tasks

1. **Fix Rust Compilation Error in `center_window_on_current_monitor`**
   - ✅ Refactored to use `tauri::Window` as the argument for Tauri command compatibility.
2. **Fix Rust Warnings**
   - ✅ Removed unused imports in `src/lib.rs`.
   - ✅ Updated deprecated usage of `.menu_on_left_click(true)` to `.show_menu_on_left_click(true)`.
3. **Auto-focus Input in `index.tsx` When Window Gains Focus**
   - ✅ Added a ref to the main input in `TopBar` and focused it when the Tauri window gains focus using the Tauri window API.

**All tasks completed.**

- [x] Handle up/down arrow keys in TopBar input to update selectedIndex in HomeComponent (src/routes/index.tsx)
- [x] Make SidebarList scroll to the selected index when it changes and is not in view.
- [x] Move scroll-to-selected-item logic from SidebarList (useEffect) to index.tsx, so scrolling is handled in the parent component.
- [x] Adjust scroll-to-selected-item logic to scroll the selected item into view with an additional 50px offset.
- [x] Update scroll-to-selected-item logic: if selected index is less than 6, scroll to the top of the list.

## Completed

- Refactored copy logic for clipboard entries (text and image) into a shared utility function `copyClipboardEntry` in `src/utils/clipboard.ts`.
- Updated `src/components/details-panel.tsx` and `src/components/sidebar-list.tsx` to use the new utility function for copy actions.
- Moved `uint8ArrayToBase64` to `src/utils/clipboard.ts` and updated `src/components/clipboard-image.tsx` to import it from there.
- Removed duplicate code and improved maintainability.
