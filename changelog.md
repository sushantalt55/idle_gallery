# Changelog

All notable changes to IDLE Gallery (second iteration) are logged here, newest first.

Each entry is grouped under a date and uses these headings where relevant: **Added**, **Changed**, **Fixed**, **Removed**.

## [Unreleased]

### Added
- `changelog.md` to track changes.
- Sidebar search: typing in the search box filters the album list (case-insensitive).
- Redesigned search box with a "Search albums" placeholder, a clear (×) button, Escape to clear, and an album count ("12 of 4964 albums").
- The sidebar stays visible while an album is open, so you can search and switch albums without closing it. The open album is highlighted in the sidebar and scrolled into view, including when using next/previous/random album. The single-image view is still full screen.
- The top-left icon shows or hides the sidebar, and the choice is remembered across reloads. With the sidebar hidden, the album view uses the full width.
- Each album in the sidebar shows its image count.
- Working zoom in the image view: **Fit**, **2×** and **3×** buttons (replacing the "1 2 3" placeholder). Double-click the image to switch between Fit and 2×. Zoomed images open centred and can be scrolled to every edge. Moving to another image resets to Fit.
- Mouse wheel zoom in the image view, anchored on the cursor: whatever is under the pointer stays under it while the rest of the image grows outwards. Zoom runs from Fit up to 8×, and a zoomed image can be dragged to pan (the cursor becomes a hand).
- "IDLE Gallery" title in the centre of the main top bar.
- Infinite scrolling in the main grid: reaching the bottom loads another batch of random images, up to 2000, where a note suggests shuffling. Shuffle starts again from one batch. It can be switched off in the settings panel, and the album view is unaffected.
- Settings panel (⚙ in the top bar), opening in place of the album list: accent colour (nineteen presets spanning the colour wheel, plus a custom colour picker), image gap, image corner radius, images per batch, infinite scroll, whether the arrow buttons hide when idle, an animations switch, "Clear all likes" and "Reset to defaults". Preferences are saved in `localStorage` under `settings`. New files: `JS/settings.js` and `CSS/settings.css`.

### Changed
- **Visual redesign:**
  - New dark colour scheme with a single electric blue accent (`#3b82f6`), changeable in the settings panel. All colours are CSS variables at the top of `CSS/style.css`.
  - The open album in the sidebar is highlighted in the accent colour, instead of grey. No shadow behind it.
  - Album names are shown with a capital first letter. The stored names and the search stay lowercase.
  - The top bar is 44px tall, close to the original 40px, so it takes up little screen space.
  - The Inter font replaces Verdana.
  - Thin dark scrollbars replace the default light ones.
  - The browser tab title is "IDLE Gallery" (was "Gallary").
- **Buttons:**
  - All top-bar controls are proper buttons with rounded hover backgrounds, a press effect and a visible keyboard focus ring.
  - The sidebar toggle uses a "☰" menu icon instead of the Windows logo.
  - Zoom uses plain −/+ icons.
  - The footer "R" button is replaced by a pink **Shuffle** button on the right of the main top bar. Shuffling also scrolls back to the top.
  - Like buttons use Font Awesome hearts (outline, then red and filled when liked) with a small bounce, instead of PNG images. The sidebar's liked-album heart is red.
  - Previous / next / random buttons are round, frosted-glass buttons that light up in the accent colour on hover. They fade out after 2 seconds without mouse movement and come back when the mouse moves. On touch screens they stay visible.
  - The image view's top bar has a "← album name" back button, a "3 / 42" counter pill, the zoom buttons, the like button and a close button.
- **Image grids:**
  - Images have 4px gaps and rounded corners, and fade in as they load instead of popping in.
  - Each image goes into the shortest column, so columns end at similar heights. Album images are still added in their original order.
  - Images that fail to load are skipped instead of showing a broken image.
- Liking an album or image no longer reloads the whole album or image, and the sidebar is no longer rebuilt on every shuffle or zoom.
- The image view fits the image fully on screen below the top bar. Previously it was a fixed full-screen height and partly hidden under the bar.
- The open album is centred in the sidebar when it scrolls into view. If the album is already visible (for example, you just clicked it), the list stays where it is.
- The sidebar scroll is animated with an ease-in-out curve over 0.5–0.8 seconds, depending on distance. Scrolling the sidebar yourself stops the animation.
- Showing or hiding the sidebar slides it open or closed (0.35 seconds) in both the main view and the album view. Reloading with the sidebar hidden doesn't replay the animation.
- The album view's top bar always spans the full width. Toggling the sidebar only moves the album images, not the top bar.
- The sidebar toggle and zoom buttons sit in exactly the same spot in the main view and the album view.
- Animations are turned off when the system "reduce motion" setting is on.
- Rewrote `README.md` with the app description, features, server requirements, how to run it, how likes are stored, project structure and known issues. Kept the original title and "Second iteration of IDLE Gallery" line.

### Fixed
- Dragging across the page no longer selects album names, labels and counters, and images no longer start a native drag. The search box and the album title in the album view's top bar can still be selected.
- The search box was hidden behind the fixed header. Page content now starts below the header, and the sidebar stays in place with the search box pinned at its top while the album list scrolls. Long album names are cut off with "…" instead of wrapping.
- Clicking an album in the sidebar now opens it.
- The reshuffle button works (`render()` was missing).
- Next/previous album wraps around instead of breaking at the first or last album.
- Image likes are keyed by file name (`im:<album>:<file>`) instead of position, so they stay on the right image when files change. Existing position-based likes are converted on load.
- Liking or unliking an album updates its heart in the sidebar right away.
- Variables that were leaking into the global scope are now declared locally, and leftover test values were removed.

### Removed
- `index.html` no longer loads the unused `JS/test.js`.
- The footer "R" button (replaced by Shuffle in the top bar).
- Unused legacy styles in `CSS/modal.css`, `CSS/page-view.css` and `CSS/image-view.css`.

## 2026-09-17

### Added
- Code carried over from the previous version at its midway stage (commit `2a8094a`):
  - `index.html` with the random image grid, album view and image view.
  - `JS/main.js` with all app logic: loading image paths from `/content/data-imagepaths.txt`, column zoom, album and image navigation, random album/image, and likes saved in `localStorage`.
  - Styles in `CSS/style.css`, `CSS/modal.css`, `CSS/page-view.css` and `CSS/image-view.css`.
  - Like/liked icons in `icons/`.
  - Older experiments: `navigate.html`, `JS/test.js`, `JS/js-dump.js`.
- Initial commit with `.gitignore` and `README.md` (commit `9c1e7d1`).
