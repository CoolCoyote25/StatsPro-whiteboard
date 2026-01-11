# 🏀 Basketball Whiteboard v1.6.0

**Professional basketball coaching whiteboard for tablets and touch devices**

A modern, touch-optimized basketball whiteboard application designed for coaches who need a fast, intuitive tool for drawing plays and demonstrating strategies during practices and games.

---

## ✨ Features

### 🎨 Drawing Tools
- **RED & BLACK colors** - Standard coaching notation (offense/defense)
- **SOLID lines (━━━)** - Player movement
- **DASHED lines (╌╌╌)** - Passes and options
- **Two-finger eraser** - 75% larger than standard, works with gesture
- **Manual eraser button** - Traditional eraser mode
- **UNDO button** - Remove last stroke
- **CLEAR button** - Reset entire board

### 👥 Player Markers
- **Place numbered markers (1-5)** - Show starting positions
- **Instant placement** - One tap, smooth response
- **Drag to reposition** - Easily adjust player locations
- **White circles** - Standard player markers
- **Orange circles** - Player with ball possession
- **Double-tap to pass** - Intuitive ball possession system

### 🏀 Ball Animation
- **Basketball emoji 🏀** - Authentic, recognizable appearance
- **Animated passing** - Ball flies from player to player
- **Straight line trajectory** - Fast, direct passes (350ms)
- **Linear motion** - Constant speed, professional feel
- **Automatic possession** - Only one player has ball at a time

### 📱 User Interface
- **Touch-optimized** - Designed for tablets and touch screens
- **Clean layout** - Maximum court space
- **Line styles at top** - Easy access to drawing modes
- **Marker controls at top** - When active, doesn't cover court
- **Drawing controls at bottom** - Ergonomic button placement
- **Helper text** - Subtle guidance when needed

---

## 🚀 Quick Start

### Web Version (Instant Testing)

```bash
cd basketball-whiteboard/dist
open index.html
```

The web version works immediately in any modern browser!

### Android APK (Tablet Installation)

```bash
cd basketball-whiteboard
chmod +x build.sh
./build.sh
```

APK location: `android/app/build/outputs/apk/debug/app-debug.apk`

---

## 📖 How to Use

### Basic Drawing

1. **Select line style** (top): `━━━` (solid) or `╌╌╌` (dashed)
2. **Select color** (bottom): `RED` (offense) or `BLACK` (defense)
3. **Draw**: Use ONE finger to draw
4. **Erase**: Use TWO fingers to erase (or click `Eraser` button)
5. **Undo/Clear**: Click `UNDO` or `CLEAR`

### Using Player Markers

1. **Enable**: Click `Markers` button
2. **Place**: Select number (1-5), tap court
3. **Reposition**: Drag marker to new location
4. **Give ball**: Double-tap player → turns ORANGE
5. **Pass ball**: Double-tap another player → 🏀 animation!
6. **Exit**: Click `✓ Markers` again

---

## 🎯 Version 1.0.0 Features

**Complete Feature Set:**
- ✅ RED & BLACK colors
- ✅ SOLID & DASHED lines
- ✅ Two-finger eraser (35px, 75% larger)
- ✅ Player markers (1-5)
- ✅ Ball possession (orange color)
- ✅ Animated ball passing (🏀 emoji, 350ms)
- ✅ Instant marker placement
- ✅ Touch-optimized UI
- ✅ Professional appearance
- ✅ Portrait orientation ready

**Performance:**
- 60 FPS rendering
- 350ms ball animation
- Instant marker response
- Smooth drawing
- Large eraser for easy use

---

## 📱 Device Setup

**Portrait Lock:**
- Go to device Settings → Display
- Turn OFF Auto-rotate
- App optimized for portrait mode

**Recommended:**
- Tablet device (10" or larger)
- High brightness for visibility
- Disable notifications during use

---

## 🛠️ Technical Details

**Requirements:**
- Modern web browser OR Android 7.0+
- Touch screen device
- Node.js 20.x (for building)

**Technology:**
- React 19.0.0
- Vite 7.3.1
- HTML5 Canvas
- Capacitor 7.0 (Android)

---

## 💡 Tips

**Quick Workflow:**
1. Place all 5 markers
2. Double-tap who has ball
3. Draw movements
4. Pass ball (double-tap)
5. Draw result

**Color Coding:**
- RED = Offense
- BLACK = Defense
- SOLID = Movement
- DASHED = Passes

**Fast Erasing:**
- Two fingers anywhere = instant erase
- Larger size = easier corrections

---

## 📝 Changelog

### v1.6.0 (2026-01-07)
- Pass lines removed on next move
- "Markers" → "Players" button
- Smart CLEAR: first press removes tracks, second removes all

### v1.5.1 (2026-01-07)
- Critical bug fix: marker dragging works now

### v1.5.0 (2026-01-07)
- Directional screen setting

### v1.4.0 (2026-01-07)
- UNDO works in marker mode
- All lines #333

### v1.3.0 (2026-01-07)
- Long-press marker to set screen

### v1.2.2 (2026-01-07)
- Pass lines: only last pass shown

### v1.2.1 (2026-01-07)
- Fixed dribbling line display

### v1.2.0 (2026-01-07)
- Professional coaching notation standards

### v1.1.1 (2026-01-07)
- Movement paths follow exact finger trace

### v1.1.0 (2026-01-07)
- Added player movement path visualization

### v1.0.1 (2026-01-07)
- Fixed marker teleportation bug

### v1.0.0 (2026-01-07)
- Initial release

---

## 🎉 Ready to Coach!

Your professional basketball whiteboard is ready:

1. Extract package
2. Open `dist/index.html` (web) OR build APK (Android)
3. Lock device rotation in settings
4. Start coaching!

**Simple. Fast. Professional.**

---

*Basketball Whiteboard v1.6.0*
*Built for Coaches, By Coaches 🏀*
