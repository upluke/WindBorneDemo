# PEC — WindBorne Atlas Globe Demo

## Project Goal
Build a live web demo that visualizes WindBorne balloon positions over the last 24 hours on a 3D globe and enriches selected balloons with Open-Meteo weather context.

## Definition of Done (MVP)
- [ ] `/api/balloons?hours=24` returns snapshots (0..23) and is resilient to corrupted payloads
- [ ] Globe page renders Earth + points for selected hour
- [ ] Hover tooltip shows lat/lon/altKm
- [ ] Time slider scrubs 0..23 hours
- [ ] Optional trails show best-effort motion history
- [ ] Clicking a balloon selects it and shows Open-Meteo temperature + wind in sidebar
- [ ] App updates live (poll every ~60s) without excessive API spam
- [ ] Deployed to a public URL (Vercel)

## Tech Stack
- Next.js (App Router) + TypeScript
- react-three-fiber + drei + three
- SWR
- Tailwind CSS

## Milestones & Checks

### M0 — Setup
- [ ] Project boots locally: `npm run dev`
- [ ] Tailwind styles apply

### M1 — WindBorne Data API
- [ ] `parseSnapshot()` strict JSON parse + regex salvage fallback
- [ ] Fetch 00..23 with `Promise.allSettled`
- [ ] Cache TTL 60s on server
- [ ] Curl test: `curl localhost:3000/api/balloons?hours=4`

### M2 — Globe + Points
- [ ] R3F Canvas renders
- [ ] Points plotted correctly from lat/lon/alt
- [ ] Hover tooltip works

### M3 — Time Scrub + Trails (Optional)
- [ ] Slider changes visible snapshot
- [ ] Best-effort track matching produces trails
- [ ] Performance acceptable (no major stutter)

### M4 — Open-Meteo Integration
- [ ] `/api/weather?lat=..&lon=..` returns temp/wind
- [ ] Sidebar shows weather for selected balloon
- [ ] Cache TTL 60s, keyed by rounded lat/lon

### M5 — Polish + Deploy
- [ ] Play/pause time animation
- [ ] Error states do not crash UI
- [ ] Deployed URL works and updates live

## Risks / Notes
- WindBorne feed may be corrupted or missing hours → UI must degrade gracefully.
- No stable balloon IDs → trajectories are approximate; label clearly as “best-effort matching”.
- Keep Open-Meteo usage minimal (fetch on selection) to avoid rate issues.

## Demo Script (60 seconds)
1) Show globe + live constellation (hour 0)
2) Scrub to 12h ago, show movement/trails
3) Click a balloon → weather panel loads (temp/wind)
4) Mention robust parsing + live refresh