# 🏀 Basketball Whiteboard - User Guide v1.0.0

**Complete guide for coaches using Basketball Whiteboard**

---

## Table of Contents

1. [Getting Started](#getting-started)
2. [Basic Controls](#basic-controls)
3. [Drawing Plays](#drawing-plays)
4. [Using Markers](#using-markers)
5. [Ball Passing](#ball-passing)
6. [Tips & Tricks](#tips--tricks)
7. [Troubleshooting](#troubleshooting)

---

## Getting Started

### First Time Setup

**Web Version:**
1. Open `dist/index.html` in your browser
2. That's it! No installation needed

**Android Tablet:**
1. Transfer APK to device
2. Install (allow unknown sources if prompted)
3. Open app
4. Go to device Settings → Display
5. Turn OFF Auto-rotate (portrait lock)
6. Return to app and start coaching!

### Interface Overview

```
┌──────────────────────────────────┐
│ [━━━] [╌╌╌]  │  [Markers]       │ ← TOP CONTROLS
│                                  │
│         BASKETBALL COURT         │ ← DRAWING AREA
│                                  │
│ [RED] [BLACK] [Eraser]           │ ← BOTTOM CONTROLS
│ [UNDO] [CLEAR]                   │
└──────────────────────────────────┘
```

---

## Basic Controls

### Top Controls (Line Styles & Markers)

**Line Style Buttons:**
- `━━━` - **SOLID lines** (player movement, screens, cuts)
- `╌╌╌` - **DASHED lines** (passes, potential options)

**Marker Button:**
- `Markers` - Enable marker placement mode
- `✓ Markers` - (checkmark) Marker mode is ON

### Bottom Controls (Colors & Actions)

**Color Buttons:**
- `RED` - Red color (typically offense/your team)
- `BLACK` - Black color (typically defense/opponent)

**Tool Buttons:**
- `Eraser` - Manual eraser mode (or use two-finger gesture)
- `UNDO` - Remove the last stroke you drew
- `CLEAR` - Erase everything (drawings AND markers)

### Active Button Appearance

When a button is active (selected):
- Darker background color
- Blue shadow around button
- Easier to see what's currently selected

---

## Drawing Plays

### Basic Drawing

**Step 1: Choose Your Style**
1. Select line style (solid or dashed)
2. Select color (red or black)
3. Active buttons show darker/highlighted

**Step 2: Draw**
- Touch screen with ONE finger
- Move finger to draw line
- Lift finger to complete line
- Lines appear instantly, smooth 60 FPS

**Common Combinations:**
- RED + SOLID = Player movement (your team)
- RED + DASHED = Pass options (your team)
- BLACK + SOLID = Defender movement
- BLACK + DASHED = Defensive help/rotations

### Erasing

**Two-Finger Gesture (Recommended):**
- Touch screen with TWO fingers anywhere
- Move fingers together to erase
- Large 35px eraser (easy to use!)
- Lift fingers to stop erasing
- Automatically returns to previous drawing mode

**Manual Eraser Button:**
- Click `Eraser` button at bottom
- Button becomes active (darker)
- Draw with one finger to erase
- Click `Eraser` again to return to drawing
- Or select a color button to exit eraser mode

### Undo & Clear

**UNDO:**
- Removes the LAST stroke you made
- Works for drawings only (not markers)
- Can only undo one stroke at a time
- Quick way to fix mistakes

**CLEAR:**
- Erases EVERYTHING
- Removes all drawings
- Removes all markers
- Gives you fresh court
- Use between plays

---

## Using Markers

### What Are Markers?

Player markers show starting positions for your plays:
- Numbered circles (1-5)
- White background = player without ball
- Orange background = player WITH ball
- Black numbers for contrast
- Easy to see from distance

### Placing Markers

**Step 1: Enable Marker Mode**
1. Click `Markers` button at top
2. Button changes to `✓ Markers`
3. Number buttons (1-5) appear
4. Helper text appears on side

**Step 2: Select Number**
1. Click button for player number (1, 2, 3, 4, or 5)
2. Selected button becomes darker
3. This is the number you'll place

**Step 3: Place on Court**
1. Tap anywhere on court
2. Marker appears INSTANTLY
3. White circle with black number
4. Place all 5 players if needed

**Step 4: Exit Marker Mode**
1. Click `✓ Markers` button again
2. Returns to drawing mode
3. Markers stay on court
4. Can re-enter marker mode anytime

### Moving Markers

**While in Marker Mode:**
1. Tap and HOLD on any marker
2. Drag to new position
3. Release to place
4. Smooth, responsive movement

**Cannot Move in Drawing Mode:**
- Exit marker mode to draw
- Markers are locked in drawing mode
- Re-enter marker mode to reposition

### Replacing Markers

If you place the same number twice:
- Old marker disappears
- New marker appears at new location
- Each number (1-5) can only exist once
- Use this to reposition quickly

---

## Ball Passing

### Ball Possession System

**Visual Indicator:**
- White marker = No ball
- Orange marker = HAS BALL
- Only ONE player can have ball at a time
- Clear visual communication

### Giving Ball to Player

**First Time (No One Has Ball):**
1. Be in marker mode (`✓ Markers`)
2. DOUBLE-TAP any player marker
3. That player turns ORANGE
4. They now have the ball!

### Passing the Ball

**Animated Pass:**
1. Be in marker mode
2. DOUBLE-TAP another player
3. Watch the magic! 🏀
   - Basketball emoji appears
   - Flies straight from current holder to new player
   - Takes 350ms (fast and clear!)
   - Linear motion (constant speed)
4. New player turns orange (has ball now)
5. Previous player turns white (doesn't have ball)

**Why It's Awesome:**
- Visual feedback
- Shows timing
- Engaging for players
- Professional appearance
- Clear communication

### Ball Passing Tips

**Teaching Plays:**
- Place all markers first
- Give ball to starting player
- Draw first movement
- Pass ball (double-tap)
- Draw next movement
- Repeat!

**Multiple Options:**
- Set up play
- Pass to option A
- Show result
- CLEAR
- Set up same play
- Pass to option B
- Compare options

**Fast Break:**
- Player 1 starts with ball (outlet)
- Pass to player 2 (wing)
- Pass to player 3 (finish)
- Quick sequence with animations!

---

## Tips & Tricks

### Quick Workflows

**Timeout Play (Under 60 Seconds):**
1. CLEAR old play
2. Enable markers, place 1-5
3. Double-tap who has ball
4. Exit markers, draw movements
5. Show play to players
6. Execute!

**Practice Drill:**
1. Draw court setup once
2. Place markers
3. Use for multiple repetitions
4. CLEAR between variations

**Film Session:**
1. Draw play from film
2. Place markers where players should be
3. Compare actual vs ideal
4. Discuss adjustments

### Color Coding Strategy

**Offense (Your Team):**
- RED color
- SOLID for movement
- DASHED for passes
- Orange marker = ball

**Defense (Opponent):**
- BLACK color
- SOLID for movement
- DASHED for help/rotations
- No ball marker needed

**Mixed Plays:**
- Can use both colors
- Shows offense AND defense
- Great for teaching both sides

### Gesture Shortcuts

**Two-Finger Eraser:**
- Fastest way to fix mistakes
- No button clicking needed
- Works anywhere on screen
- Automatic mode switch

**Double-Tap Pass:**
- Natural gesture
- Mimics pointing at player
- Easy to remember
- Quick execution

### Device Optimization

**Before Practice/Game:**
- Charge device fully
- Increase brightness
- Lock rotation (device settings)
- Close background apps
- Disable notifications
- Test basic functions

**During Use:**
- Keep device charged
- Have stylus backup (if used)
- Clean screen regularly
- Avoid direct sunlight on screen

---

## Troubleshooting

### Common Issues

**Problem: Screen rotates when I don't want it to**
- Solution: Device Settings → Display → Auto-rotate OFF
- This is device-level, not app-level
- Must be set before using app
- Xiaomi/MIUI: May need to check multiple rotation settings

**Problem: Markers won't place**
- Check: Is marker mode enabled? (✓ Markers showing?)
- Check: Did you select a number (1-5)?
- Check: Are you tapping on the court area?
- Try: Exit and re-enter marker mode

**Problem: Can't move markers**
- Check: Is marker mode enabled?
- Check: Are you tapping directly on the marker?
- Try: Tap and hold, then drag
- Note: Cannot move markers in drawing mode

**Problem: Two-finger eraser not working**
- Check: Are you using two fingers?
- Check: Are both fingers touching screen?
- Try: Use more pressure/surface area
- Alternative: Use manual eraser button

**Problem: Ball won't pass**
- Check: Is marker mode enabled?
- Check: Are you DOUBLE-tapping (not single tap)?
- Check: Are you tapping on a marker?
- Try: Tap faster (within 300ms)

**Problem: Drawings look jaggy/pixelated**
- Check: Device screen resolution
- Check: Browser zoom level (web version)
- Try: Restart app
- Note: Should be smooth at 60 FPS

**Problem: App is slow/laggy**
- Check: Close background apps
- Check: Device available memory
- Check: Other apps running
- Try: Restart device
- Try: Use web version instead of APK

### Performance Tips

**For Best Performance:**
- Use on newer devices (2020+)
- Close background apps
- Keep drawings simple
- Clear between plays
- Restart app if sluggish

**Web Version vs APK:**
- Web version: Universal, no install
- APK version: Faster, more responsive
- Both have same features
- Choose based on preference

### Device-Specific Notes

**Xiaomi Devices:**
- Rotation lock may be in multiple places
- Check MIUI settings AND Android settings
- May need to disable auto-rotate in both
- Some MIUI versions override app settings

**Samsung Tablets:**
- Easy rotation lock in quick settings
- Generally work well with app
- Good touch response

**iPad/iOS:**
- Web version works perfectly
- Native iOS app coming in future
- Safari recommended browser
- May need to allow local file access

---

## Best Practices

### For Coaches

**During Games:**
- Practice common plays beforehand
- Keep timeouts under 60 seconds
- Focus on one concept per diagram
- Use CLEAR between plays
- Simple > Complex

**During Practice:**
- Take screenshots of plays
- Build digital playbook
- Share via team messaging
- Review before games
- Update as season progresses

**During Film:**
- Draw what opponent does
- Show ideal defensive response
- Compare options
- Save screenshots for players
- Break down tendencies

### For Players

**When Coach is Drawing:**
- Gather around device
- Watch for your number
- Note ball position (orange)
- Ask questions if unclear
- Take photos if allowed

**Learning Plays:**
- Orange marker = who starts with ball
- Follow your number's movement
- Watch for pass options (dashed lines)
- Understand spacing
- Know your reads

---

## Advanced Techniques

### Complex Plays

**Multi-Option Plays:**
1. Draw base setup (markers + initial movement)
2. Show option A (pass ball, draw result)
3. Screenshot
4. Undo to base
5. Show option B (different pass/result)
6. Screenshot
7. Compare side-by-side

**Defensive Rotations:**
1. Use BLACK for defenders
2. Show starting positions (markers)
3. Draw initial movement (solid)
4. Show help/rotation (dashed)
5. Show recovery (solid)
6. Multiple rotations possible

**Set Plays:**
1. Name the play
2. Draw from start to finish
3. Show all 5 players
4. Include ball movement (orange + passing)
5. Show timing with animations
6. Practice until automatic

### Teaching Concepts

**Spacing:**
- Place markers in correct spacing
- Show what happens with bad spacing
- Show what happens with good spacing
- Let players see the difference

**Timing:**
- Use ball animation to show
- When to cut
- When to screen
- When to pass
- Visual timing cue

**Reading Defense:**
- Draw base play
- Show defensive look A → action A
- CLEAR, redraw base
- Show defensive look B → action B
- Teach decision-making

---

## Keyboard Shortcuts (Web Version)

**Not currently implemented, but planned:**
- Undo: Ctrl+Z
- Clear: Ctrl+Shift+C
- Toggle Eraser: E
- Red: R
- Black: B

**Current Version:**
- All controls via touch/click
- Optimized for tablets
- No keyboard required

---

## Summary

### Quick Reference Card

**Drawing:**
- 1 finger = Draw
- 2 fingers = Erase
- Select color + style first

**Markers:**
- [Markers] = Enable
- Select 1-5
- Tap = Place
- Drag = Move
- Double-tap = Give/Pass ball

**Actions:**
- [UNDO] = Remove last stroke
- [CLEAR] = Reset everything

**Ball:**
- White marker = No ball
- Orange marker = Has ball
- Double-tap = Pass (with animation!)

---

## Getting Help

**Documentation:**
- README.md - Complete features
- CHANGELOG.md - Version history
- This guide - Detailed instructions

**Support:**
- Check troubleshooting section above
- Review tips & tricks
- Restart app/device
- Try web version vs APK

---

## Conclusion

Basketball Whiteboard v1.0.0 is designed to be:
- **Simple** - Easy to learn
- **Fast** - Quick to use
- **Professional** - Great looking
- **Effective** - Clear communication

With practice, you'll be drawing plays faster than on a traditional whiteboard, with better clarity and more engaging visuals for your players.

**Happy Coaching! 🏀**

---

*Basketball Whiteboard v1.0.0 User Guide*
*Complete documentation for coaches*
