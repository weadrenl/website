import { track } from './track';

/**
 * Design lab events (lab_pick, lab_price, lab_open, lab_view, lab_story, lab_line), sent like every site event to the shop's own event
 * store and totalled on /insights ("Design lab"). From a local copy of the site they carry local: true, so tests never count.
 */
export function labTrack(n: string, p: Record<string, string | number | boolean>) {
  const local = /^(localhost|127\.0\.0\.1|\[::1\])$/.test(window.location.hostname);
  track(n, { ...p, ...(local ? { local: true } : {}) });
}
