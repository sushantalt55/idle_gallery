# idle_gallery
Second iteration of IDLE Gallery

A small photo gallery for browsing a local image collection, built with plain HTML, CSS and JavaScript. There is no framework and no build step. This repository is only the front end: the images are served by a separate web server that is not part of this project.

## Features

- **Random grid:** the home page shows randomly picked images in evenly balanced columns, and keeps loading more as you scroll (up to 2000, after which a note suggests shuffling). Use the −/+ buttons in the top bar to change the column count (1–7), and **Shuffle** to start again with a fresh set. Click an image to open its album.
- **Album view:** shows every image in one album, with adjustable columns, previous/next album, a random album, and a like button. The sidebar stays visible next to it, with the open album highlighted.
- **Image view:** shows a single image fitted to the screen, with a position counter (e.g. `3 / 42`), previous/next, a random image from a random album, and a like button. Zoom with the mouse wheel (the point under the cursor stays put), with the Fit / 2× / 3× buttons, or by double-clicking. Drag a zoomed image to move around it. Moving to another image goes back to Fit.
- **Sidebar:** lists every album with its image count. Click one to open it, or type in the search box at the top to filter the list. Click × or press Escape to clear the search. The ☰ button shows or hides the sidebar, and the app remembers your choice.
- **Likes:** stored in the browser's `localStorage`. Liked albums get a red heart in the sidebar.
- **Settings:** the ⚙ button opens a settings panel where the sidebar sits. See below.
- The previous / next / random buttons fade out when the mouse is still and come back when it moves.

## Settings

The ⚙ button in the top bar opens the settings panel in place of the album list. Everything there is saved in `localStorage` under the `settings` key and applied on the next visit.

| Setting | What it does |
|---|---|
| Accent colour | Nineteen presets spanning the colour wheel (red through to rose, plus silver) and a custom colour picker. The accent is used for the open album, the Shuffle button, the active zoom level, the search focus ring and button hovers. |
| Image gap | Spacing between images in the grids, 0–16px. |
| Corner radius | How rounded the image corners are, 0–20px, in every view. |
| Images per batch | How many random images the main grid loads at a time: 50, 100, 200, 400 or 800. |
| Infinite scroll | Whether the main grid keeps loading batches as you reach the bottom. Off means one batch per shuffle. |
| Hide arrows when idle | Whether the previous / next / random buttons fade out when the mouse stops moving. |
| Animations | Turns all animations and transitions off. |
| Clear all likes | Removes every liked album and image, after a confirmation. |
| Reset to defaults | Puts every setting back to its starting value. |

## Customising the look

Colours, the default accent, header height, sidebar width and image spacing are CSS variables at the top of [CSS/style.css](CSS/style.css); the accent and gap are overridden at runtime by the settings panel. The preset colours are the `ACCENT_PRESETS` list in [JS/settings.js](JS/settings.js). Album names are shown with a capital first letter through CSS only, so the stored names and the search are unaffected.

## Requirements

- A web server on **port 80** of the same host that serves this page, exposing the image collection at `/content/`.
- A file at `/content/data-imagepaths.txt` listing image paths, one per line, relative to `/content/`.
- Paths use Windows backslashes in the form `<root>\<person>\<album>\<file>`, for example:

  ```
  IDLE\alice\beach-trip\001.jpg
  ```

  The second segment is read as the person and the third as the album (called a "page" in the code).

## Running

1. Serve this folder and the image collection from the same host, with the images reachable at `http://<host>:80/content/`.
2. Open `index.html` through that server (not as a `file://` URL, since the app fetches the path list over HTTP).

To point at a different host or port, edit `url` and `port` near the top of [JS/main.js](JS/main.js).

## How likes are stored

| Key | Meaning |
|---|---|
| `pg:<album>` | Liked album |
| `im:<album>:<file>` | Liked image, by its file name |
| `settings` | Settings panel preferences (JSON) |
| `sidebarHidden` | Set while the sidebar is hidden |

Likes live only in the current browser and are not synced anywhere. Older likes saved by position (`im:<album>:<index>`) are converted automatically when the app loads.

## Project structure

| Path | Role |
|---|---|
| [index.html](index.html) | The app page |
| [JS/main.js](JS/main.js) | All app logic: loading paths, grid, album and image views, likes, sidebar |
| [JS/settings.js](JS/settings.js) | Settings panel: stored preferences, accent colours, likes reset |
| [CSS/settings.css](CSS/settings.css) | Settings panel |
| [CSS/style.css](CSS/style.css) | Colour variables, top bars, buttons, sidebar and image grid |
| [CSS/modal.css](CSS/modal.css) | Shared album/image view styles and the floating arrow buttons |
| [CSS/page-view.css](CSS/page-view.css) | Album view |
| [CSS/image-view.css](CSS/image-view.css) | Image view |
| [icons/](icons) | Old like / liked PNG icons, no longer used |
| [navigate.html](navigate.html), [JS/test.js](JS/test.js), [JS/js-dump.js](JS/js-dump.js) | Older experiments, not used by `index.html` |

The page loads the Inter font from Google Fonts and icons from Font Awesome 4.7 (cdnjs), so it needs internet access for those. Without it, the app falls back to the system font and the icons are missing.

## Known issues

- `navigate.html` references a missing `CSS/test.css` and undefined functions.
- App state is still held in top-level `g_*` variables.
