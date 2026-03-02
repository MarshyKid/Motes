# Motes (Math Structure Editor)

This is a keyboard-driven prototype for a structured math editor.  
It is **not a LaTeX editor** — expressions are edited as a tree of structured nodes (powers, fractions, groups, etc.), with explicit slot-based navigation.

The goal of this prototype is to explore **math-aware cursor movement, selection, and structural editing**, rather than polished UI or full symbol coverage.

---

## Current Features

- Keyboard-only input
- Structured math nodes:
  - Symbols
  - Powers
  - Fractions
  - Parentheses (grouping)
  - `sin`
- Arbitrary nesting of structures
- Caret navigation with arrow keys
- Slot-based navigation using Tab / Shift+Tab
- Selection (clamped to current row / slot)
- Delete with structural awareness
- Clean DOM rendering (no LaTeX rendering)
- Export document AST to JSON
- Multiple math rows (Enter inserts new row)

---

## Keybindings

### Navigation
- **Left / Right Arrow**: Move caret within a row
- **Tab**: Jump to next structural slot (e.g. numerator → denominator → exit)
- **Shift + Tab**: Jump to previous structural slot

### Structure Creation
- **`^`**: Create or enter a power
- **`/`**: Create a fraction
- **`(`**: Create parentheses (group)
- **`)`**: Exit parentheses
- **`S` (capital)**: Insert `sin` function

### Editing
- **Backspace**: Delete selection or element
- **Enter**: Create a new math row

### Persistence
- **Ctrl + S**: Save document (JSON export)

---

## Running the Project

This project uses ES modules and should be served via a local server.

### Recommended setup
```bash
npm install -g live-server
live-server```
