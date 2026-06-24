/**
 * Phase 1 API config — video render service.
 *
 * Replace `RENDER_HOST` with the real endpoint host your backend team gives you.
 * For local testing against the reference server in /server, set it to:
 *   - Physical device (dev build): your computer's LAN IP, phone on the SAME Wi-Fi
 *   - Android emulator:            10.0.2.2
 *   - iOS simulator:               localhost
 *
 * NOTE: Android release builds block cleartext HTTP. For a deployed server use https://.
 */
const RENDER_HOST = '10.30.133.58'; // <-- your computer's LAN IP (from `ipconfig`)

export const API_BASE_URL = `http://${RENDER_HOST}:3000`;
export const RENDER_VIDEO_PATH = '/render-video';

/** Optional auth token — set when backend gives you one. */
export const API_AUTH_TOKEN: string | null = null;
