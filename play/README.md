# ReBloom

Pixel-art browser game for CodeVerse Hackathon 2026 (Education in Health through Games).
Phaser 3.80.1 (loaded from cdnjs), plain JavaScript, no build step, no backend. Progress saves in localStorage.

## Run locally
    python3 -m http.server 8000
Then open http://localhost:8000/ (serve the folder; opening index.html as a file blocks asset loading).
index.html has no <html>/<head> wrapper; browsers accept it. Add a <!doctype html> line at the top if your host needs one.

## Deploy
Upload this folder as-is to Vercel, Netlify or GitHub Pages (static site, no build command).

## Files
- content.js: every health statement, the sources register, Letters, upgrade tips, dialogue (edit content here only)
- core.js: save, RNG, UI kit (buttons, panels), dialogue box, Letter/Settings/Sources/Credits overlays
- audio.js: all music and sound effects, synthesized live with WebAudio (theme, one track per room, layered boss track)
- scenes.js: animated loading screen, Title, Creator, Hub (decor, Lumi's facts), Library, Wardrobe, Tools, Results
- run.js: the game itself (waves, 5 tools incl. Dream Net, upgrades, 4 bosses incl. OCD urge tiles, Mastery, journey travel)
- roomdata.js: room collision grids and prop positions
- manifest.js + assets/: pixel art
- VERIFICATION.md: independent fact-check of every claim against its source

## Controls
WASD or arrows to move, aim with the mouse, hold left click (or J) to fire, right click or K for the staff, Shift to dash, Space to Breathe (then stay still), P or Esc to pause.
Hub: tap Lumi (or press L) for a sourced fact. Tap decor to interact.
Touch: drag on the left half to move, fire is automatic, buttons on the right for staff, dash and Breathe.

## Demo shortcuts (hidden)
- F2 during a wave: skip to the boss. F2 during a boss: clear it.
- Shift+F2 in your room (hub): +500 gold.
- Library > Challenge / Mastery jumps straight to any boss you have met.
