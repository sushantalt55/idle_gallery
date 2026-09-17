# idle_gallery
Second iteration of IDLE Gallery

A small photo gallery for browsing a local image collection, built with plain HTML, CSS and JavaScript. There is no framework and no build step. This repository is only the front end: the images are served by a separate web server that is not part of this project.

## Features

- **Random grid:** the home page shows 200 randomly picked images in columns. Use the −/+ buttons in the header to change the column count (1–7). Click an image to open its album.
- **Album view:** shows every image in one album, with adjustable columns, previous/next album, a random album (`❯❯`), and a like button.
- **Image view:** shows a single image with a position counter (e.g. `3/42`), previous/next, a random image from a random album, and a like button.
- **Likes:** stored in the browser's `localStorage`. Liked albums get a heart in the sidebar.

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
| `im:<album>:<index>` | Liked image, by its position in the album |

Likes live only in the current browser and are not synced anywhere.

## Project structure

| Path | Role |
|---|---|
| [index.html](index.html) | The app page |
| [JS/main.js](JS/main.js) | All app logic: loading paths, grid, album and image views, likes, sidebar |
| [CSS/style.css](CSS/style.css) | Main layout and grid |
| [CSS/modal.css](CSS/modal.css) | Shared modal styles |
| [CSS/page-view.css](CSS/page-view.css) | Album view |
| [CSS/image-view.css](CSS/image-view.css) | Image view |
| [icons/](icons) | Like / liked heart icons |
| [navigate.html](navigate.html), [JS/test.js](JS/test.js), [JS/js-dump.js](JS/js-dump.js) | Older experiments, not used by `index.html` (apart from `test.js` being loaded) |

## Known issues

- Clicking an album in the sidebar does nothing, and the search box is not wired up.
- The footer "R" button calls `render()`, which does not exist.
- Next/previous album does not stop at the ends of the list.
- Image likes are keyed by position, so adding or removing files in an album shifts them to other images.
- The "1 2 3" zoom levels in the image view are placeholder text.
- `navigate.html` references a missing `CSS/test.css` and undefined functions.
- Most state is held in global variables.
