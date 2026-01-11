# Changelog

All notable changes to Basketball Whiteboard will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [2.3.5] - 2026-01-11

### Changed - Simplified Recording Behavior
**Removed hidePathsDuringRecording feature - All tracks now visible during recording**

#### Simplification:
- Player movement tracks are now always visible during video recording
- Pass lines (dotted) are now always visible during video recording
- Recording now captures everything exactly as it appears on screen
- Removed `hidePathsDuringRecording` state and all related logic
- Simplified code by removing conditional rendering during recording
- Makes the app behavior more consistent and predictable

#### Result:
- Video recordings now show complete play visualization with all tracks
- Cleaner, simpler codebase
- More intuitive behavior - what you see is what you record

## [2.3.4] - 2026-01-09

### Fixed - Recording Now Works Reliably!
**Removed MP4 format and use only WebM for reliable recording**

#### Root Cause Found:
- MP4 format reported as "supported" by browser
- MediaRecorder created successfully with MP4
- But immediately failed when actually recording from canvas
- This broke all subsequent recording attempts

#### Solution:
- Removed MP4 from format options
- Use only WebM VP9/VP8 (proven to work reliably)
- canvas.captureStream() works perfectly with WebM
- Force reset of all state before each recording
- Proper stream cleanup after recording

#### Result:
- Recording works reliably every time
- Can record multiple times without errors
- Cancel/save doesn't break future recordings
- WebM format has excellent quality and compatibility

## [2.3.3] - 2026-01-09

### Fixed - Force Reset Before Recording
**Added force reset of all recording state before starting new recording**

#### Recording Fix:
- Force cleanup of old MediaRecorder before starting new one
- Check and stop MediaRecorder if not inactive
- Force cleanup of stream tracks
- Reset all state variables before starting
- Added extensive console logging for debugging
- Clean up on start errors

## [2.3.2] - 2026-01-09

### Fixed - Recording Cleanup After Cancel
**Fixed issue where canceling save would prevent subsequent recordings**

#### Recording Cleanup:
- Added proper cleanup in onstop handler (try-finally block)
- Always clear mediaRecorderRef after recording stops
- Handle save cancellations gracefully
- Clean up in onerror handler
- Remove duplicate code after start
- Can now record multiple times even if save is cancelled

## [2.3.1] - 2026-01-09

### Fixed - MP4 Recording Implementation
**Fixed issue where recording would immediately trigger save dialog on start**

#### Recording Fix:
- Simplified codec detection with cleaner try-catch logic
- Added proper error handler for MediaRecorder
- Wrapped start() in try-catch for better error handling
- Tests each codec option before trying to use it
- Falls back gracefully to WebM if MP4 not supported
- Recording now starts properly without triggering onstop

## [2.3.0] - 2026-01-09

### Changed - Video Recording Format to MP4
**Videos now recorded as .mp4 files (with .webm fallback) for better compatibility**

#### Video Format:
- Primary format: MP4 with H.264 codec (best compatibility)
- Fallback options: MP4 with AVC1, MP4 default, WebM VP9, WebM default
- Filename extension: .mp4 (or .webm if MP4 not supported)
- File mime type: video/mp4 (or video/webm if MP4 not supported)
- Same quality: 60 FPS, 8 Mbps HD

#### Compatibility:
- MP4 works on more devices and players
- Better compatibility with social media
- Easier to share and view
- Still maintains HD quality

## [2.2.7] - 2026-01-09

### Fixed - Reverted No-Ball Track to Straight Line
**No-ball tracks are now straight lines again (correct basketball notation)**

#### Track Behavior:
- With ball: Wavy line (≈≈≈) - shows dribbling
- Without ball: Straight line (———) - shows running
- Both use Catmull-Rom smoothing for smooth curves
- Correct basketball movement notation

## [2.2.6] - 2026-01-08

### Fixed - Screen Removal On Touch + Better No-Ball Tracks
**Screens now removed immediately when touching player (not on release), and no-ball tracks are now smooth and elegant**

#### Screen Removal Fix:
- Fixed: Screen removed on finger release (wrong timing)
- Now: Screen removed instantly when touching player with screen
- Prevents setting new screen immediately after removal
- Uses requestAnimationFrame for immediate visual update

#### Track Appearance:
- No-ball tracks now use smooth wavy line (like with-ball)
- Smaller wave amplitude (3px vs 6px) for elegant look
- Wider wave frequency (25px vs 20px) for smooth appearance
- Both track types now look professional and beautiful

## [2.2.5] - 2026-01-08

### Fixed - Screen Removal Timing
**Screens now removed immediately when player starts moving, not at the end of movement**

#### Screen Removal:
- Fixed: Screens stayed visible during entire player drag
- Now: Screen removed as soon as player moves (distance > 10px)
- Result: Screens disappear immediately when player movement begins
- Better visual feedback and more accurate representation

## [2.2.4] - 2026-01-08

### Fixed - Portrait Mode Lock
**App now properly locked to portrait orientation in Android manifest**

#### Portrait Lock:
- Added android:screenOrientation="portrait" to MainActivity
- App stays in portrait mode automatically
- No need to use Android system rotation lock
- Proper native implementation

## [2.2.3] - 2026-01-08

### Improved - Cleaner Video Recording
**Pass lines (dotted ball pass lines) now hidden during video recording for even cleaner diagrams**

#### Video Recording:
- Pass lines now hidden during recording (like movement paths)
- Videos show only: players, screens, and your drawing
- Even cleaner, more professional video output
- Pass lines reappear automatically when recording stops

## [2.2.2] - 2026-01-08

### Improved - Ultra-Smooth Paths (Even Smoother!)
**Eliminated remaining shakiness in player movement paths with enhanced smoothing**

#### Enhanced Smoothing:
- More aggressive point simplification: 10px → 15px minimum distance
- Increased Catmull-Rom interpolation: 10 → 15 points per segment
- Added 3rd smoothing pass: 5-point weighted moving average
- Results in silky-smooth curves with zero shakiness

#### Visual Quality:
- All paths now perfectly smooth (like player #2's arc)
- No wobbles or shaky sections
- Professional vector-quality throughout
- Consistent smoothness across all player movements

## [2.2.1] - 2026-01-08

### Improved - Beautiful Vector Curves + Clean Video Recording
**Movement paths now use Catmull-Rom splines for professional vector-like curves, and video recording shows clean diagrams without movement tracks**

#### Catmull-Rom Spline Curves:
- Implemented Catmull-Rom interpolation for smooth, professional curves
- Properly handles concavity changes (curves flow naturally)
- Creates vector-graphic quality paths
- 10 interpolation points per segment for silky smoothness
- Eliminates all hand shake and wobbles
- Maintains path intention with beautiful flowing curves

#### Clean Video Recording:
- Movement paths (gray tracks) now HIDDEN during video recording
- Videos only show: players, screens, and your live drawing
- Professional clean diagrams in recorded videos
- Paths reappear automatically when recording stops
- No interruption popup when starting recording

#### User Experience:
- No "Recording started" popup (less intrusive)
- Clean, professional video output
- Movement paths still visible when NOT recording
- Automatic - no configuration needed

## [2.2.0] - 2026-01-08

### Improved - Professional Smooth Player Movement Paths
**Player movement paths now display as beautiful, smooth curves instead of shaky hand-drawn paths**

#### Smooth Path Algorithm:
- Implemented Chaikin's corner-cutting algorithm for professional curves
- Eliminates hand shake and wobbles automatically
- Maintains the same general path shape and direction
- Keeps distinction between wavy (has ball) and solid (no ball) lines
- Start and end points slightly adjusted for optimal smoothness

#### Visual Improvements:
- Movement paths look professionally drawn
- Smooth, flowing curves instead of jagged lines
- Hand tremors and device shake eliminated
- Cleaner, more readable play diagrams
- Professional coaching presentation quality

#### Technical Details:
- Simplified point spacing: 5px → 8px (fewer points)
- Chaikin smoothing: 2 iterations for optimal balance
- Final weighted average for perfect blending
- Automatic - no configuration needed
- Works on all player movements (with or without ball)

## [2.1.2] - 2026-01-08

### Improved - High Quality Video Recording
**Doubled frame rate and increased bitrate for professional-quality videos**

#### Video Quality Improvements:
- Frame rate increased: 30 FPS → 60 FPS (2x smoother)
- Bitrate increased: Default → 8 Mbps (much higher quality)
- VP9 codec with high quality settings
- Smoother player movements in recordings
- Clearer line drawings in playback
- Professional broadcast-quality output

#### Technical:
- Canvas capture: 60 FPS
- Video bitrate: 8,000,000 bps (8 Mbps)
- Codec: VP9 (with fallbacks)
- File size: Slightly larger (~3-6 MB per minute vs 2-5 MB)
- Quality: Significantly better clarity and smoothness

## [2.1.1] - 2026-01-08

### Fixed - Android App Video Recording
**Videos now save properly in Android app using native filesystem**

#### Android Video Saving:
- Now uses Capacitor Filesystem API for native Android storage
- Videos save to Documents folder (visible in Files app)
- Automatic share dialog opens after saving
- File location shown in alert: "Documents folder"
- Fixed: Videos actually save on Android devices!

#### How It Works Now:
- Web browser: Downloads to Downloads folder (as before)
- Android app: Saves to Documents folder + shows share dialog
- Alert shows exact location of saved file
- Can share directly to WhatsApp, Email, Drive, etc.

#### Technical:
- Added @capacitor/filesystem plugin
- Added @capacitor/share plugin
- Detects native app vs web browser automatically
- Uses appropriate save method for each platform

## [2.1.0] - 2026-01-08

### Added - Video Recording Feature
**Record your coaching sessions and save as video**

#### Video Recording:
- New "Record" button in bottom controls
- Records canvas in real-time as you draw plays
- Captures all drawing, players, movements, passes, screens
- Records at 30 FPS for smooth playback
- Automatically downloads as .webm video file
- Filename includes timestamp: statspro-play-YYYY-MM-DD-HH-MM-SS.webm

#### Recording Controls:
- ⏺️ Record button (gray) - Click to start recording
- ⏹️ Stop button (red, pulsing) - Click to stop and download
- Visual feedback: Pulsing red animation when recording
- Easy one-click start/stop

#### Use Cases:
- Record play explanations for team
- Save coaching sessions for review
- Create play library videos
- Share plays with assistant coaches
- Document practice plans

## [2.0.3] - 2026-01-07

### Changed - App Renamed to StatsPro Whiteboard
**Rebranded from "Basketball Whiteboard" to "StatsPro Whiteboard"**

#### Name Changes:
- Android app name: "StatsPro Whiteboard"
- Capacitor app name: "StatsPro Whiteboard"
- Package name: statspro-whiteboard
- Display name on device: "StatsPro Whiteboard"

#### Technical:
- Package ID remains: com.basketball.whiteboard (for compatibility)
- Can be changed to com.statspro.whiteboard if needed

## [2.0.2] - 2026-01-07

### Changed - Correct Button Labels
**Fixed button labels to match basketball coaching terminology**

#### Button Label Changes:
- "Black" button → "Red" button with 🔴 icon
  - Now accurately reflects red marker use on whiteboards
  - Matches coaching expectations
- "White" button → "Black" button with ⚫ icon
  - Clear and accurate labeling
  - Standard basketball whiteboard colors

#### Why This Matters:
- Basketball coaches use RED and BLACK markers on whiteboards
- Previous labels (Black/White) were technically accurate for drawing colors but confusing
- New labels (Red/Black) match real-world basketball whiteboard usage
- Icons now match labels for consistency

## [2.0.1] - 2026-01-07

### Changed - Compact Design (Fixed Phase 2 Issues)
**Reverted oversized controls, kept the good parts**

After feedback that Phase 2 controls were too large and covering the court, we've refined to a compact design:

#### Compact Buttons:
- Horizontal layout: Icon + label side-by-side (not stacked vertically)
- Smaller size: 70px min-width × auto height (not 110px × 60px)
- Thinner borders: 2px (not 3-4px)
- Less padding: 10px × 16px (not 18px × 24px)
- Smaller icons: 16px (not 20px)
- Buttons don't cover court anymore!

#### Removed Intrusive Elements:
- No frosted glass backgrounds
- No large control bar padding
- No backdrop blur effects
- No extra elevation/shadows
- Clean, minimal, stays out of the way

#### Kept The Good Parts:
- Basketball orange theme ✓
- Icons for recognition ✓
- Visual grouping with separator ✓
- Responsive design ✓
- Better organization ✓

#### Result:
- Maximum court visibility
- Compact, unobtrusive controls
- Still professional appearance
- Still easy to use
- Icons help but don't dominate

## [2.0.0] - 2026-01-07

### Changed - MAJOR REDESIGN (Option C: Basketball-Themed Hybrid)
**Complete visual redesign with basketball theme and better organization**

### Fixed - Android Icon
- Removed adaptive icon configuration that was using old template
- Android now properly displays custom basketball app icon
- All icon sizes (48x48 to 192x192) working correctly

#### Color System Overhaul:
- **Primary Accent:** Basketball Orange (#E85D04) for active states and basketball identity
- **Secondary:** Charcoal (#2B2D42) for text, borders, and "black" drawing
- **Success Green:** (#34A853) for Undo button
- **Danger Red:** (#DC2626) for Clear button
- **Removed:** Random purple, cyan, and orange colors from Material Design

#### Button Reorganization:
- **Drawing Tools Group (Left):** Black, White, Eraser
- **Visual Separator:** Added between groups for clarity
- **Actions Group (Right):** Undo, Clear
- Better visual hierarchy with grouped functionality

#### Button Label Changes:
- "Red" → "Black" (accurate to actual drawing color #333)
- "Black" → "White" (accurate to actual drawing color white)

#### Visual Improvements:
- Orange accent on all active states (unified theme)
- Better hover effects (lift animation instead of scale)
- Consistent button sizing and spacing
- Visual separators between button groups
- Basketball orange for Players mode when active
- Basketball orange for player numbers (replaces purple)
- Basketball orange for ball possession (matches theme)
- Basketball orange for version badge when flipped

#### Basketball Theme Identity:
- Strong basketball orange visual identity throughout
- Court-inspired color palette (orange, charcoal, white)
- Professional, cohesive design language
- Clear connection to basketball coaching

### Improved
- Visual hierarchy (clear primary/secondary/tertiary)
- Touch targets consistency
- Active state feedback (orange glow)
- Professional appearance
- User experience clarity

## [1.9.0] - 2026-01-07

### Added
- Android app support with Capacitor
- Custom app icon (basketball hoop with X's, O's, and play arrows)
  - Created all required Android icon sizes (48x48 to 192x192)
  - Round icons for adaptive launchers
  - Web app icons (192x192, 512x512)
- App ready for Android deployment

### Changed
- App name: "Basketball Whiteboard"
- Package ID: com.basketball.whiteboard

## [1.8.2] - 2026-01-07

### Changed
- Removed Flip button from controls (reduced button clutter)
- Version display now clickable to toggle court flip
  - Click version to flip court horizontally
  - Shows "(Flipped)" when active
  - Cyan background when flipped
  - Hover effects for discoverability
- Added creator name "Allan C." to version display

### Added
- Interactive version display with flip functionality
- Visual feedback (color change) when court is flipped

## [1.8.1] - 2026-01-07

### Changed
- Moved Flip button from top controls to bottom controls
  - Now appears after Clear button
  - Better button organization
  - With Red, Black, Eraser, Undo, Clear buttons

## [1.8.0] - 2026-01-07

### Added
- Flip court button to mirror court horizontally (left ↔ right)
  - Cyan button in top controls
  - Shows checkmark when active
  - Flips background image only (not drawings/players)
  - Useful for different coaching perspectives
  - Toggle on/off with single click

## [1.7.2] - 2026-01-07

### Fixed
- CRITICAL: Fixed UNDO requiring two presses to show visual update
  - Changed to functional setState to ensure latest state is used
  - Removed manual redraw calls (relies on useEffect)
  - Player position now restores immediately on first UNDO press
  - Canvas redraws properly after state updates

## [1.7.1] - 2026-01-07

### Fixed
- CRITICAL: Fixed UNDO not moving players back to previous position
  - Canvas wasn't being redrawn after state updates
  - Added redrawStrokes() call after UNDO operations
  - Player position restoration now works correctly

## [1.7.0] - 2026-01-07

### Added
- Version number display in top left corner
  - Shows current version (v1.7.0)
  - Semi-transparent background
  - Always visible
- Universal UNDO system
  - UNDO now works on ALL actions, not just drawings/paths
  - Tracks action history: drawings, player placements, movements, passes, screens
  - Single UNDO button works everywhere
  - Complete action reversal with state restoration

### Changed
- UNDO behavior completely redesigned
  - Works in both drawing and player modes
  - Can undo: strokes, player placements, player movements, ball passes, screen settings
  - Restores previous state for each action type
  - True universal undo functionality

## [1.6.1] - 2026-01-07

### Changed
- Long-press timer reduced from 800ms to 500ms
  - Faster screen setting
  - More responsive feel

### Added
- Path smoothing for movement lines
  - Removes jitter and noise from finger tracking
  - Clean, professional curves
  - Removes redundant points (< 5px apart)
  - Applies moving average smoothing
  - Works for both wavy (dribbling) and solid (movement) lines

## [1.6.0] - 2026-01-07

### Changed
- Pass lines now removed on next player movement (like screens)
  - Pass line only visible until someone moves
  - Cleaner workflow
- Renamed "Markers" button to "Players"
  - More intuitive naming
- Smart CLEAR in player mode
  - First press: removes tracks only (paths and pass lines), keeps players
  - Second press (within 500ms): removes everything including players
  - In draw mode: CLEAR works as before (removes everything)

## [1.5.1] - 2026-01-07

### Fixed
- CRITICAL: Fixed marker dragging completely broken in v1.5.0
  - Event not being passed to handleMarkerTouchEnd
  - Screen setting mode getting stuck
  - Players couldn't be dragged at all
  - Long-press not working

### Changed
- Improved cleanup and safety checks for screen setting mode
- Better state management for long-press detection

## [1.5.0] - 2026-01-07

### Added
- Directional screen setting via long-press + drag gesture
  - Long-press marker (800ms), then drag in direction
  - Bar drawn perpendicular to drag direction
  - 50px length (player diameter), 6px thick, dark grey #333
  - Positioned in the direction you dragged
  - One screen per player
  - Removed automatically on next player movement

### How It Works
- Hold marker for 800ms (don't move)
- Drag in direction (up/down/left/right/diagonal)
- Bar appears perpendicular to that direction
- Example: Drag right → vertical bar appears to the right
- Example: Drag up → horizontal bar appears above

## [1.4.0] - 2026-01-07

### Added
- UNDO button now works in marker mode
  - Removes last marker movement path (and its track)
  - Context-aware: UNDO removes strokes in draw mode, paths in marker mode
  - Clean workflow for correcting movements

### Changed
- All movement lines now use #333 (dark grey)
  - Movement paths (wavy/solid): light grey → dark grey #333
  - Pass lines (dotted): already #333
  - Unified color scheme for all notation lines
  - Better visibility and professional appearance

### Removed
- Screen feature removed (long-press functionality)
  - Simplified interface
  - Focus on core movement and passing notation

## [1.3.0] - 2026-01-07

### Added
- Screen setting via long-press gesture
  - Long-press (800ms) on any marker to toggle screen symbol
  - Screen shown as thick horizontal bar above player (#333 dark grey)
  - Standard basketball coaching notation for screens
  - On/off toggle (long-press again to remove)

### Changed
- Pass line color: #666 → #333 (darker, more visible)
  - Almost black for better contrast
  - More professional appearance
  - Easier to see on court

## [1.2.2] - 2026-01-07

### Fixed
- Pass lines now work like movement paths
  - Only the LAST pass is shown (not accumulating)
  - Previous behavior: all passes stayed visible (cluttered)
  - New behavior: only most recent pass visible (clean)

### Changed
- Pass line color: medium grey (#999) → darker grey (#666)
  - Better visibility
  - More professional appearance
  - Clearer distinction

## [1.2.1] - 2026-01-07

### Fixed
- Dribbling line now displays properly as smooth wavy line
  - Previous zig-zag implementation was broken (only first part showed)
  - Replaced with smooth sine wave (ondulation) pattern
  - Follows entire path correctly
  - More natural appearance

### Changed
- Dribbling notation: zig-zag → wavy line (ondulation)
  - Easier to implement and render
  - Smoother, more elegant appearance
  - Still clearly distinguishable from solid movement lines
  - Industry-recognizable as dribbling notation

## [1.2.0] - 2026-01-07

### Added
- Professional basketball coaching notation standards
  - **Zig-zag lines** for dribbling (player with ball moving)
  - **Solid lines** for cutting/running (player without ball moving)
  - **Dotted lines** for passes (stays after ball animation)
  - Automatic detection based on ball possession

### Changed
- Movement path color changed to **light grey** (#BDBDBD)
  - More subtle, professional appearance
  - Doesn't compete with plays (RED/BLACK)
  - Standard coaching diagram aesthetic
  
### Improved
- Proper coaching notation matches industry standards
- Visual hierarchy: plays (bold) > movement (subtle) > passes (dotted)
- More professional and recognizable diagrams

## [1.1.1] - 2026-01-07

### Changed
- Movement paths now show the exact finger trace
  - Records every point along the drag path (not just start/end)
  - Displays as solid black line (4px width)
  - Matches natural finger movement exactly
  - Same visual weight as drawing strokes
  - More realistic and intuitive

### Improved
- Better visual representation of player repositioning
- Paths look more natural and hand-drawn
- Clearer distinction from regular drawings

## [1.1.0] - 2026-01-07

### Added
- Player movement path visualization
  - When dragging a player marker, a purple dashed arrow line shows the movement
  - Only the LAST movement for each player number is displayed
  - Perfect for showing positional adjustments: "Player 2 moves here"
  - Useful for teaching defensive rotations and spacing corrections
  - Paths are cleared with the CLEAR button
  - Minimum movement of 10px required to avoid recording accidental tiny moves

### Visual Details
- Movement paths drawn as purple (#9C27B0) dashed lines
- Arrow head at destination shows direction of movement
- Paths drawn behind markers for clear visibility
- Clean, professional appearance

## [1.0.1] - 2026-01-07

### Fixed
- Prevented marker teleportation when all 5 players are placed on court
  - Issue: Clicking empty space would move the selected player to that location
  - Solution: Once all 5 markers (1-5) exist, clicking empty space does nothing
  - Users must now drag existing markers to reposition them
  - This prevents accidental repositioning during play drawing

### Changed
- Improved marker placement logic for better user experience
- Markers can only be repositioned by dragging when all 5 are placed

## [1.0.0] - 2026-01-07

### Added - Complete Feature Set
- Drawing system with RED and BLACK colors
- SOLID (━━━) and DASHED (╌╌╌) line styles
- Two-finger eraser gesture (35px width, 75% larger than standard)
- Manual eraser button with toggle mode
- UNDO button for removing last stroke
- CLEAR button for resetting entire board
- Player marker system (numbers 1-5)
- Instant marker placement with smooth response
- Drag-to-reposition for all markers
- Ball possession system (orange color indicates player with ball)
- Double-tap ball passing between players
- Animated ball movement using 🏀 emoji
- Straight-line pass animation (350ms duration, linear motion)
- Touch-optimized user interface
- Clean layout with maximum court space
- Helper text for marker mode guidance
- Professional basketball court background
- Portrait orientation optimization
- 60 FPS smooth rendering
- Responsive touch input handling
- Node.js 20.x compatibility

### Technical Details
- React 19.0.0 frontend framework
- Vite 7.3.1 build system
- HTML5 Canvas for drawing
- Capacitor 7.0 for Android wrapper
- Custom gesture detection (two-finger eraser)
- RequestAnimationFrame for smooth animations
- Optimized canvas redrawing
- State management with React hooks

### Performance
- 60 FPS drawing and animation
- 350ms ball pass animation
- Instant marker placement (<16ms response)
- 35px eraser width for easy corrections
- Smooth drag-and-drop for markers
- No lag or stutter on touch devices

### User Experience
- Intuitive gesture controls
- Clear visual feedback
- Professional appearance
- Ergonomic button placement
- Consistent color coding
- Helpful UI text when needed
- Clean, uncluttered interface

### Documentation
- Complete README.md with full feature documentation
- Quick start guide for web and Android
- Detailed usage instructions
- Tips and best practices
- Technical specifications
- Device compatibility information
- Build instructions

### Platform Support
- Web version (works in all modern browsers)
- Android APK (Android 7.0+)
- Touch screen optimized
- Tablet device recommended (10" or larger)

### Files Included
- Full source code (src/)
- Pre-built web version (dist/)
- Android build configuration (android/)
- Build scripts (build.sh)
- Court background image
- Package configuration (package.json)
- Vite configuration (vite.config.js)
- Complete documentation

---

## Release Notes

### v1.0.0 - "Professional Coach"

This is the initial stable release of Basketball Whiteboard, a professional coaching tool designed specifically for tablet devices.

**What makes v1.0.0 special:**

1. **Complete Feature Set** - Everything a coach needs for drawing plays during practice and games

2. **Ball Animation System** - Unique animated ball passing with 🏀 emoji flying between players

3. **Instant Marker Placement** - Optimized for speed with direct canvas drawing before state updates

4. **Two-Finger Eraser** - Natural gesture with 75% larger eraser size for easy corrections

5. **Professional UI** - Clean layout that maximizes court space while keeping all controls accessible

6. **Touch-Optimized** - Every interaction designed for touch screens, not adapted from mouse

7. **Fast Performance** - 60 FPS rendering, 350ms animations, instant response

**Target Users:**
- Basketball coaches (youth to professional)
- Practice planning
- Game-time timeout plays
- Film session demonstrations
- Player development sessions

**Key Design Principles:**
- Simplicity over complexity
- Speed over features
- Clarity over decoration
- Touch-first design
- Professional appearance

**Known Limitations:**
- Portrait orientation requires device-level rotation lock
- No save/load functionality (by design - keep it simple)
- No undo history (only last stroke)
- Limited to 5 player markers
- Android-only for native app (iOS planned for future)

**Future Considerations:**
- Additional marker shapes (X, O, squares)
- Multiple courts (half-court, three-point)
- Export to image file
- iOS native app support
- More line styles
- Customizable colors

---

## Development History

### Pre-Release Development

**Initial Concept:**
- Simple drawing tool for basketball coaches
- Touch-optimized for tablets
- Fast and responsive

**Key Iterations:**
1. Basic drawing with colors and line styles
2. Two-finger eraser gesture implementation
3. Player marker system development
4. Ball possession indication (orange color)
5. Animated ball passing feature
6. UI optimization and layout refinement
7. Performance tuning and optimization
8. Documentation and packaging

**Design Evolution:**
- Started with complex arc animation → Simplified to straight line
- Custom ball drawing → Emoji for authenticity
- Helper text positioning → Moved to side to avoid covering court
- Button layout → Multiple iterations for ergonomics

**Technical Challenges Solved:**
- Portrait lock on Android devices (device-level solution)
- Instant marker placement (direct canvas drawing)
- Smooth ball animation (requestAnimationFrame optimization)
- Two-finger gesture detection (touch event handling)
- Large eraser size (35px for easy use)

---

## Versioning Strategy

**Version Format:** MAJOR.MINOR.PATCH

**MAJOR (1.x.x):**
- Breaking changes
- Major feature overhauls
- Significant UI changes

**MINOR (x.1.x):**
- New features
- Non-breaking enhancements
- Significant improvements

**PATCH (x.x.1):**
- Bug fixes
- Minor tweaks
- Performance improvements
- Documentation updates

---

*Basketball Whiteboard v1.0.0*
*Changelog maintained since 2026-01-07*
