# Status Daily — Video Render Service (reference)

A small **stateless** Node + FFmpeg service that burns a transparent overlay (the
user's framed photo + name, rendered by the app with Skia) onto a template video and
returns the composited `.mp4`.

> This is a **reference implementation** for the backend team to deploy on company
> infrastructure. The app developer runs it locally during development and hands this
> folder off. **No database, no object storage** — for v1 the overlay comes in the
> request and the video goes back in the response.

## What it does

```
POST /render-video
  body: { videoUrl, overlayPng (base64 PNG), durationSec? }
  ->   { mp4Base64 }     // square 1080x1080 video, overlay burned in, source audio kept

GET /health  -> { ok: true }
```

The video is center-cropped to a square and scaled to 1080×1080 so the output matches
the app's square editor preview exactly (WYSIWYG).

## Prerequisites

- **Node 18+**
- **FFmpeg** installed and on your PATH. Verify:
  ```bash
  ffmpeg -version
  ```
  - macOS: `brew install ffmpeg`
  - Windows: `winget install Gyan.FFmpeg` (or `choco install ffmpeg`)
  - Ubuntu/Debian: `sudo apt install ffmpeg`

## Run locally

```bash
cd server
npm install
npm start          # -> http://localhost:3000
```

Quick check:
```bash
curl http://localhost:3000/health
```

## Point the app at it

Edit `constants/api.ts` in the app. The defaults already handle the common cases:

| Where the app runs | URL to use                                   |
| ------------------ | -------------------------------------------- |
| Android emulator   | `http://10.0.2.2:3000`                       |
| iOS simulator      | `http://localhost:3000`                      |
| Physical device    | `http://<your-computer-LAN-IP>:3000` (same Wi-Fi) or an ngrok tunnel |

## Notes / production upgrades (not in v1)

- v1 returns the mp4 as base64 JSON for dead-simple client handling. For scale,
  switch to returning a **URL** (store the output in S3/Cloudflare R2) and/or an
  **async job + polling** for longer videos.
- Add the auth check (`Authorization: Bearer …`) to match `API_AUTH_TOKEN` in the app.
- Consider a queue + worker so one slow render doesn't block others.
