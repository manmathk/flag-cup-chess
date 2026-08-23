# Flag Cup Chess

A set-and-forget **YouTube Live** chess World Cup: 16 country bots play automatically on a cinematic 16:9 / 9:16 stage with commentary, SFX, soundtrack, points tables, and knockouts.

## Quick start

```bash
cd Chess
npm install
npm start
```

Open **http://localhost:5173**, then click **START BROADCAST**.

Or open `index.html` via any static server (ES modules need HTTP, not raw `file://` for CDN imports).

```bash
npm test
```

## What you get

- **16 nations**, 4 groups of 4 (round-robin: win 3 / draw 1 / loss 0)
- Top 2 per group → quarterfinals → semis → final
- Auto chess bots (minimax, favorites play a bit stronger)
- 3D board (Three.js), flag pylons, move / check / mate effects
- Voice commentary + captions
- Built-in ambient bed, or your own soundtrack at **20%** volume
- Points tables, ticker, lower-third broadcast HUD
- Mobile-friendly **9:16** (Shorts / Reels) and desktop **16:9**

## Stream with OBS

1. Start the app and click **START BROADCAST**
2. OBS → **Window Capture** (or Browser Source → `http://localhost:5173`)
3. Crop to the stage; target **1920×1080** for YouTube Live
4. For vertical: press **V** to force **9:16**, or rotate / resize the window

## Splash options

| Control | Action |
|---------|--------|
| **SHUFFLE GROUPS** | Randomize which countries are in A–D (opening match is no longer always Brazil vs Germany) |
| **Soundtrack src** | Set path like `soundtrack.mp3` or a URL, then **APPLY SRC** |
| **File picker** | Load a local audio file |
| **CLEAR** | Remove custom track (falls back to built-in bed) |
| **START BROADCAST** | Unlock audio + run the full tournament |

Place your file next to `index.html` as `soundtrack.mp3`, or change the HTML:

```html
<audio id="bg-soundtrack" src="soundtrack.mp3" loop preload="auto"></audio>
```

## On-air controls

| Control | Action |
|---------|--------|
| **PAUSE / RESUME** | Freeze or continue the match |
| **RESET** | Stop the run and return to splash |
| **SOUND ON / OFF** | Mute voice, SFX, and music |
| **C** | Extra streamer panel (speed, skip match, aspect) |
| **Space** | Pause / resume |
| **R** | Reset |
| **V** | Cycle aspect: auto → 9:16 → 16:9 |

## Project layout

```
Chess/
├── index.html              # Broadcast UI, 3D board, audio, match director
├── engine.js               # Nations, groups, standings, bots, shuffle
├── soundtrack.mp3          # Optional — your background track
├── tests/engine.test.mjs   # Node tests
└── package.json
```

## Notes

- No national anthems or third-party commercial music are bundled (safer for YouTube Content ID). Use your own licensed track via `src` if you need a real soundtrack.
- Browsers require a click before audio/voice can start — that is what **START BROADCAST** is for.
- Default group seeding is fixed until you hit **SHUFFLE GROUPS**.

## License

ISC
