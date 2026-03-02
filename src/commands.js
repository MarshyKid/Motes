import { transform } from './transform.js';
import { state } from './state.js';
import { point } from './point.js';
import { slot } from './slot.js';

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

function insertGroup(st, type) {
    let d = state.getDoc(st);
    let cursor = state.getCursor(st);

    let newCursor = transform.insertGroupAt(d, cursor, type);

    st = state.setCursor(st, newCursor);
    st = state.collapse(st);

    return st;
}

function insertParentheses(st) {
    return insertGroup(st, "parentheses");
}

function insertSin(st) {
    let d = state.getDoc(st);
    let cursor = state.getCursor(st);

    let newCursor = transform.insertSinAt(d, cursor);

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

//structural nav - for shortcuts (tab, ctrl-, ), etc.)
function moveToSlot(st, shift) {
    if (shift) {
        return prevSlot(st);
    } else {
        return nextSlot(st);
    }
}

function prevSlot(st) {
    let d = state.getDoc(st);
    let cursor = state.getCursor(st);

    let newCursor = transform.prevSlot(d, cursor);
    //let newCursor = transform.nearestStructureLeft(d, cursor);
    if (!newCursor) {
        //either in a block, or start of a structure
        if (!slot.getParent(point.getRow(cursor))) {
            //no parent - nav to previous structure
            newCursor = transform.nearestStructureLeft(d, cursor);
            if (!newCursor) return st;
            else {
                st = state.setCursor(st, newCursor);
                st = state.collapse(st);
                return st;
            }
        }
        return exitStructureLeft(st);
    } else {
        st = state.setCursor(st, newCursor);
        st = state.collapse(st);

        return st;
    }
}

function nextSlot(st) {
    let d = state.getDoc(st);
    let cursor = state.getCursor(st);

    let newCursor = transform.nextSlot(d, cursor);
    //let newCursor = transform.nearestStructureRight(d, cursor);
    if (!newCursor) {
        //either in a block, or end of a structure
        if (!slot.getParent(point.getRow(cursor))) {
            //no parent - find next structure instead
            newCursor = transform.nearestStructureRight(d, cursor);
            if (!newCursor) return st;
            else {
                st = state.setCursor(st, newCursor);
                st = state.collapse(st);
                return st;
            }
        }
        //there is parent, meaning currently in a structure
        return exitStructureRight(st);
    } else {
        st = state.setCursor(st, newCursor);
        st = state.collapse(st);
        return st;
    }
}

function exitStructure(st, shift) {
    if (shift) {
        return exitStructureLeft(st);
    } else {
        return exitStructureRight(st);
    }
}

function exitStructureLeft(st) {
    let d = state.getDoc(st);
    let cursor = state.getCursor(st);

    let newCursor = transform.exitStructure(d, cursor, "left");
    if (!newCursor) newCursor = cursor;
    
    st = state.setCursor(st, newCursor);
    st = state.collapse(st);

    return st;
}

function exitStructureRight(st) {
    let d = state.getDoc(st);
    let cursor = state.getCursor(st);

    let newCursor = transform.exitStructure(d, cursor, "right");
    if (!newCursor) newCursor = cursor;
    
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
    insertParentheses,
    insertSin,
    deleteBackward,
    exitStructure,
    exitStructureRight,
    moveToSlot,
}
