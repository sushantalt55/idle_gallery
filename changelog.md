# Changelog

All notable changes to IDLE Gallery (second iteration) are logged here, newest first.

Each entry is grouped under a date and uses these headings where relevant: **Added**, **Changed**, **Fixed**, **Removed**.

## [Unreleased]

### Added
- `changelog.md` to track changes.

### Changed
- Rewrote `README.md` with the app description, features, server requirements, how to run it, how likes are stored, project structure and known issues. Kept the original title and "Second iteration of IDLE Gallery" line.

## 2026-09-17

### Added
- Code carried over from the previous version at its midway stage (commit `2a8094a`):
  - `index.html` with the random image grid, album view and image view.
  - `JS/main.js` with all app logic: loading image paths from `/content/data-imagepaths.txt`, column zoom, album and image navigation, random album/image, and likes saved in `localStorage`.
  - Styles in `CSS/style.css`, `CSS/modal.css`, `CSS/page-view.css` and `CSS/image-view.css`.
  - Like/liked icons in `icons/`.
  - Older experiments: `navigate.html`, `JS/test.js`, `JS/js-dump.js`.
- Initial commit with `.gitignore` and `README.md` (commit `9c1e7d1`).
