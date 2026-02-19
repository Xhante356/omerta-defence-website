# OMERTA DEFENCE Website

## Project Description
Corporate website for OMERTA DEFENCE, a defence company showcasing products and services. Single-page scrolling website with a premium military aesthetic.

## Tech Stack
- Plain HTML + CSS + JavaScript (no frameworks)
- Dark theme with teal accents (`#1B3C4B`)
- Google Fonts: Orbitron, Rajdhani, Inter
- Images via Unsplash CDN (no local downloads except logo)

## File Structure
```
├── index.html              # Single-page HTML with all 7 sections
├── css/
│   ├── styles.css          # Variables, layout, components, responsive
│   └── animations.css      # Keyframes, scroll reveals, hover effects
├── js/
│   ├── main.js             # Nav, smooth scroll, form, mobile menu
│   ├── animations.js       # Intersection Observer, parallax, counters
│   └── particles.js        # Canvas particle network for hero
├── assets/
│   └── images/
│       └── logo.jpg        # Company logo
└── CLAUDE.md
```

## How to Run
Open `index.html` in any modern browser. No build step or server required.

## Design System

### Colors
| Variable | Value | Usage |
|---|---|---|
| `--bg-primary` | `#0a0a0a` | Main background |
| `--bg-secondary` | `#111111` | Alternate sections |
| `--bg-card` | `#1a1a1a` | Card backgrounds |
| `--teal-primary` | `#1B3C4B` | Brand color |
| `--teal-accent` | `#3D8FA7` | CTAs, active states |
| `--text-primary` | `#E8E8E8` | Body text |
| `--text-heading` | `#FFFFFF` | Headings |

### Fonts
- **Orbitron** - Major headings (tech/military feel)
- **Rajdhani** - Subheadings, nav (tactical feel)
- **Inter** - Body text (clean, readable)

## Sections
1. Navigation (fixed, transparent -> solid on scroll)
2. Hero (100vh, particle canvas, gradient overlay)
3. About (2-column, stat counters)
4. Products & Services (5 cards: Small Arms, Heavy Ordnance, Launchers, Drones, Cyber)
5. Cyber Security (dedicated section, glassmorphism panel)
6. Contact (info + form with floating labels)
7. Footer (3-column)

## Image Sources
All product/section images use Unsplash CDN URLs embedded directly in the HTML. Logo is stored locally at `assets/images/logo.jpg`.
