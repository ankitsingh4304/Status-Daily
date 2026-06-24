/**
 * Status Daily — reference video-overlay render service (Phase 1).
 *
 * Stateless. No database. No object storage.
 *   POST /render-video  { videoUrl, overlayPng (base64), durationSec? }
 *     -> { mp4Base64 }   the source video with the overlay burned in (square 1080x1080)
 *   GET  /health         -> { ok: true }
 *
 * This is a REFERENCE implementation meant to be handed to the backend team to
 * deploy on company infrastructure. Run it locally during app development.
 *
 * Requirements: Node 18+ and FFmpeg installed and on PATH (`ffmpeg -version`).
 *
 * Production upgrades (out of scope for v1): stream/return a URL instead of base64,
 * move to an async job + polling for long videos, and add object storage (S3/R2).
 */
const express = require('express');
const { spawn } = require('child_process');
const fs = require('fs');
const os = require('os');
const path = require('path');
const http = require('http');
const https = require('https');

const app = express();
app.use(express.json({ limit: '60mb' }));

// FFmpeg executable. Override with FFMPEG_PATH if it isn't on PATH, e.g.:
//   $env:FFMPEG_PATH="C:\path\to\ffmpeg.exe"; npm start
const FFMPEG = process.env.FFMPEG_PATH || 'ffmpeg';

// Some hosts reject the default Node client; present a normal browser UA.
const BROWSER_UA =
  'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0 Safari/537.36';

/** Download a URL to a file, following one level of redirects. */
function download(url, dest) {
  return new Promise((resolve, reject) => {
    const mod = url.startsWith('https') ? https : http;
    const file = fs.createWriteStream(dest);
    mod
      .get(url, { headers: { 'User-Agent': BROWSER_UA, Accept: '*/*' } }, (res) => {
        if (res.statusCode >= 300 && res.statusCode < 400 && res.headers.location) {
          file.close();
          fs.unlink(dest, () => {});
          return resolve(download(res.headers.location, dest));
        }
        if (res.statusCode !== 200) {
          file.close();
          fs.unlink(dest, () => {});
          return reject(new Error(`Download failed (${res.statusCode}) for ${url}`));
        }
        res.pipe(file);
        file.on('finish', () => file.close(() => resolve(dest)));
      })
      .on('error', (err) => {
        fs.unlink(dest, () => {});
        reject(err);
      });
  });
}

app.get('/health', (_req, res) => res.json({ ok: true }));

app.post('/render-video', async (req, res) => {
  const { videoUrl, overlayPng, durationSec, outWidth, outHeight } = req.body || {};
  if (!videoUrl || !overlayPng) {
    return res.status(400).json({ error: 'videoUrl and overlayPng are required' });
  }
  // Output dimensions (default square 1080). Clamp to sane bounds; force even (libx264).
  const evenClamp = (v, def) => {
    const n = Math.round((Number(v) || def) / 2) * 2;
    return Math.max(160, Math.min(1920, n));
  };
  const W = evenClamp(outWidth, 1080);
  const H = evenClamp(outHeight, 1080);
  console.log(`[render] videoUrl=${videoUrl}  overlay=${overlayPng.length}b64  dur=${durationSec ?? 'auto'}  out=${W}x${H}`);

  // Respond at most once (FFmpeg can emit both 'error' and 'close').
  let responded = false;
  const reply = (status, body) => {
    if (responded || res.headersSent) return;
    responded = true;
    res.status(status).json(body);
  };

  const tmp = fs.mkdtempSync(path.join(os.tmpdir(), 'statusrender-'));
  const inPath = path.join(tmp, 'in.mp4');
  const ovPath = path.join(tmp, 'overlay.png');
  const outPath = path.join(tmp, 'out.mp4');
  const cleanup = () => {
    try {
      fs.rmSync(tmp, { recursive: true, force: true });
    } catch {
      /* ignore */
    }
  };

  try {
    await download(videoUrl, inPath);
    fs.writeFileSync(ovPath, Buffer.from(overlayPng, 'base64'));

    const dur = Math.min(Number(durationSec) || 30, 60);

    // Center-crop the video to the WxH aspect (matches the editor preview), scale to
    // WxH, then scale the overlay PNG to WxH and composite on top. Commas inside the
    // crop expressions are escaped (\,) so the filtergraph parser doesn't split them.
    const filter =
      `[0:v]crop=w='min(iw\\,ih*${W}/${H})':h='min(ih\\,iw*${H}/${W})',scale=${W}:${H},setsar=1[bg];` +
      `[1:v]scale=${W}:${H}[ovl];` +
      `[bg][ovl]overlay=0:0,format=yuv420p[v]`;

    const args = [
      '-y',
      '-i', inPath,
      '-i', ovPath,
      '-filter_complex', filter,
      '-map', '[v]',
      '-map', '0:a?', // keep source audio if present
      '-c:v', 'libx264',
      '-preset', 'veryfast',
      '-crf', '23',
      '-c:a', 'aac',
      '-movflags', '+faststart',
      '-t', String(dur),
      outPath,
    ];

    const ff = spawn(FFMPEG, args);
    let stderr = '';
    ff.stderr.on('data', (d) => {
      stderr += d.toString();
    });
    // 'error' (spawn failure) and 'close' can both fire — only ever respond once.
    ff.on('error', (err) => {
      cleanup();
      reply(500, {
        error: 'Could not start FFmpeg. Is it installed and on PATH (or set FFMPEG_PATH)?',
        detail: err.message,
      });
    });
    ff.on('close', (code) => {
      if (code !== 0) {
        cleanup();
        return reply(500, { error: 'FFmpeg failed', detail: stderr.slice(-2000) });
      }
      try {
        const mp4 = fs.readFileSync(outPath);
        reply(200, { mp4Base64: mp4.toString('base64') });
      } catch (e) {
        reply(500, { error: 'Could not read rendered output', detail: e.message });
      } finally {
        cleanup();
      }
    });
  } catch (err) {
    cleanup();
    console.error('[render] error:', err.message);
    const isDownload = /Download failed/i.test(err.message);
    reply(isDownload ? 502 : 500, {
      error: err.message,
      hint: isDownload
        ? 'The video URL could not be downloaded server-side (often hotlink/403 protection). Use a directly downloadable URL.'
        : undefined,
    });
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Status Daily render service listening on http://localhost:${PORT}`);
  console.log('Endpoints: GET /health, POST /render-video');

  // Verify FFmpeg is reachable and fail loudly at startup if not.
  const check = spawn(FFMPEG, ['-version']);
  check.on('error', () => {
    console.error('\n  ⚠️  FFmpeg NOT found. Exports will fail.');
    console.error(`     Tried: "${FFMPEG}". Start from a terminal where 'ffmpeg -version' works,`);
    console.error('     or set FFMPEG_PATH to the full path, then restart.\n');
  });
  check.stdout.once('data', (d) => {
    console.log(`FFmpeg OK: ${d.toString().split('\n')[0]}`);
  });
});
