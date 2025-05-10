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
