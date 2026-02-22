import { transform } from './transform.js';
import { state } from './state.js';
import { point } from './point.js';

//movement
function moveCursorLeft(st, shift) {
    let cursor = state.getCursor(st);
    let d = state.getDoc(st);

    let newCursor = transform.nearestEditablePosition(d, cursor, "left");
    
    st = state.setCursor(st, newCursor);
    if (!shift || cursor.row != newCursor.row) st = state.collapse(st);

    return st;
}

function moveCursorRight(st, shift) {
    let cursor = state.getCursor(st);
    let d = state.getDoc(st);

    let newCursor = transform.nearestEditablePosition(d, cursor, "right");

    st = state.setCursor(st, newCursor);
    if (!shift || cursor.row != newCursor.row) st = state.collapse(st);

    return st;
}

//insertion
function insertSymbol(st, value) {
    let newCursor = transform.insertSymbolAt(state.getDoc(st), state.getCursor(st), value);

    let newSt = state.setCursor(st, newCursor);
    newSt = state.collapse(newSt);

    return newSt;
}

function insertPower(st) {
    let d = state.getDoc(st);
    let cursor = state.getCursor(st);

    let newCursor = transform.wrapPower(d, cursor);

    st = state.setCursor(st, newCursor);
    st = state.collapse(st);
    return st;
}

function insertFraction(st) {
    let d = state.getDoc(st);
    let cursor = state.getCursor(st);

    let newCursor = transform.wrapFraction(d, cursor);

    st = state.setCursor(st, newCursor);
    st = state.collapse(st);
    return st;
}

function insertBlock(st) {
    let d = state.getDoc(st);
    let cursor = state.getCursor(st);

    let newCursor = transform.insertBlockAt(d, cursor);

    st = state.setCursor(st, newCursor);
    st = state.collapse(st);
    return st;
}

//deletion
function deleteBackward(st) {
    let d = state.getDoc(st);
    let cursor = state.getCursor(st);
    let isCollapsed = state.isCollapsed(st);
    let ordered = state.getOrdered(st);

    let newCursor = isCollapsed ?
    transform.deleteBackwardAt(d, cursor) :
        transform.deleteRange(d, ordered.left, ordered.right);

    st = state.setCursor(st, newCursor);
    st = state.collapse(st);

    return st;
}

export const commands = {
    moveCursorLeft,
    moveCursorRight,
    insertSymbol,
    insertPower,
    insertFraction,
    insertBlock,
    deleteBackward,
}
