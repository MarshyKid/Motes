## NOTES.md
# Internal Notes & Design Invariants

---

## Core Data Model
- The document is stored as a **pure AST** (plain JS object)
- Nodes are structural (`symbol`, `power`, `fraction`, `group`, `mathLine`, `sin`, etc.)
- Rows contain nodes
- Rows carry **slot context**:
    - owner node
    - slot name (e.g. `exp`, `num`, etc.)
    - parent row
- Regular nodes do NOT store parent pointers

Slot context is **derived** and rebuilt on json load

---
## Node Types
- Symbol
    - value:str

- Row
    - items:list
    - ctx:slotCtx

- Power
    - base:node
    - exp:row

- Fraction
    - num:row
    - den:row

- Group (parentheses/brackets/curly braces)
    - body:row

- MathLine (block)
    - row:row

- sin
    - body:row

## Serialization
- Only the document AST is serialized
- Cursor, selection and slot context are NOT serialized
- Slot context is rebuilt after loading JSON

---

## Cursor & Selection
- Cursor is a `{row, index}` point
- Selection is `{cursor, anchor}`
- Selection is **clamped to current row / slot**
- Cross-slot/row selection is not supported

---
## Navigation

### Arrow Keys
- Move caret linearly within a row
- Jumps in/out structures if at start/end of one

### Tab / Shift+Tab
- Tab is **structural navigation**, not linear navigation
- Priority order:
    1. Navigate slots within current structure
    2. Exit structure if no more slots
    3. If not inside a structure, scan for nearest structure in row (in current mathLine)
    4. If none exists, no caret movement

### Enter
- Always creates a new mathLine row
- If inside a structure, exits structure and creates new row

---

## Slot Rules
- Each node type has slots and can be accessed via `model.getSlots`
- Examples:
    - power -> `[exp]`
    - fraction -> `[num, den]`
    - group -> `[body]`
- Slot order defines traversal order

---

## Architecture Notes
- No classes are used
- `input.js` is application entry point
