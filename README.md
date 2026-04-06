# Artemis Mission Tracker

A real-time tracker for NASA's Artemis program missions, featuring 3D trajectory visualization, live telemetry, and comprehensive mission data.

**Live at: [artemis.benrichardson.dev](https://artemis.benrichardson.dev)**

![Artemis Tracker Screenshot](https://img.shields.io/badge/Artemis_II-LIVE-orange?style=for-the-badge)

## Features

### Multi-Mission Support
Track all five Artemis missions in one place:
- **Artemis I** (Completed) - Uncrewed lunar test flight with full trajectory replay
- **Artemis II** (Live) - First crewed lunar flyby with real-time tracking
- **Artemis III-V** (Upcoming) - Planned mission details and timelines

### 3D Trajectory Visualization
- Interactive Three.js scene with Earth, Moon, and spacecraft
- Smooth Catmull-Rom spline trajectory paths
- Spacecraft marker with glow effect tracking mission progress
- Camera controls: zoom, rotate, tilt, and preset focus views (Earth/Moon/Craft)
- Trajectory accurately curves around the Moon during flyby

### Time Machine Slider
- Scrub through the entire mission duration
- All data updates in real-time: 3D scene, telemetry, timeline, stats
- Play/pause button for animated playback at 60x speed
- "LIVE" button snaps back to real-time for active missions
- Click any timeline milestone to jump to that event
- Keyboard shortcuts: Arrow keys (10min/1hr), Space (play/pause), L (live)

### Live Telemetry Dashboard
- Distance from Earth and Moon
- Velocity
- Mission Elapsed Time (MET) with live counter
- Current mission phase
- Data source attribution with freshness indicator

### Quick Stats Bar
- Mission day counter
- Real-time MET
- Distance, speed, phase at a glance
- Crew awake/sleep status
- Next milestone countdown

### Additional Panels
- **NASA Live Video** - Embedded NASA TV stream + links to AROW, mission blog, audio
- **Mission Timeline** - Detailed milestones with progress tracking
- **Space Weather** - Live NASA DONKI data: solar flares, CMEs, radiation risk level
- **Spacecraft** - Orion/SLS specs + interactive 3D model viewer (Sketchfab)
- **Crew Profiles** - Astronaut photos, bios, and links to official NASA/CSA profiles
- **Deep Space Network** - Ground station tracking status (Goldstone, Canberra, Madrid)
- **Mission Details** - Full description, objectives, key stats

### User Preferences
- **Timezone selector** - View all times in your preferred timezone
- **Unit toggle** - Switch between metric (km, km/s) and imperial (mi, mph)
- **Collapsible panels** - Customize your dashboard layout
- All preferences persisted to localStorage

### Space Glossary
- 28 searchable space terms with plain-English definitions
- Inline tooltips on technical terms throughout the app

## Tech Stack

- **Vanilla HTML/CSS/JS** - No build step, no framework
- **Three.js** - 3D trajectory visualization (loaded from CDN)
- **NASA DONKI API** - Live space weather data
- Zero dependencies beyond Three.js

## Data Sources

| Source | What it provides |
|--------|-----------------|
| [NASA AROW](https://www.nasa.gov/missions/artemis-ii/arow/) | Official real-time orbit tracking |
| [JPL Horizons](https://ssd.jpl.nasa.gov/horizons/) | Spacecraft trajectory & ephemeris data |
| [NASA DONKI](https://ccmc.gsfc.nasa.gov/tools/DONKI/) | Space weather events (solar flares, CMEs) |
| [DSN Now](https://eyes.nasa.gov/dsn/dsn.html) | Deep Space Network antenna status |
| [NASA TV](https://www.nasa.gov/live/) | Live mission video coverage |
| [NASA Artemis](https://www.nasa.gov/mission/artemis-ii/) | Official mission information |

## Deployment

This is a static site - just serve the files. No build step required.

### GitHub Pages
The site is deployed automatically via GitHub Pages with a custom domain (`artemis.benrichardson.dev`).

### Local Development
```bash
# Clone the repo
git clone https://github.com/ben-gy/artemis-tracker.git
cd artemis-tracker

# Serve with any static server
python3 -m http.server 8080
# Open http://localhost:8080
```

## Keyboard Shortcuts

| Key | Action |
|-----|--------|
| `←` / `→` | Scrub time ±10 minutes |
| `Shift+←` / `Shift+→` | Scrub time ±1 hour |
| `Space` or `K` | Play/pause timeline |
| `L` | Jump to live |
| `Esc` | Close glossary modal |

## License

MIT

## Credits

Built by [benrichardson.dev](https://benrichardson.dev)

Trajectory data is approximate and based on published NASA mission parameters. All NASA imagery and data are public domain. Astronaut headshots courtesy of NASA and the Canadian Space Agency.
