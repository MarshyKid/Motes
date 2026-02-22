import { point } from "./point.js";

function init(c, a) {
    return {
        cursor: c,
        anchor: a
    };
}

function getCursor(sel) {
    return sel.cursor;
}

function getAnchor(sel) {
    return sel.anchor;
}

function isCollapsed(sel) {
    let cursor = getCursor(sel);
    let anchor = getAnchor(sel);

    return (point.getRow(cursor) === point.getRow(anchor)) &&
    (point.getIndex(cursor) === point.getIndex(anchor));
}

function getOrdered(sel) {
    let cursor = getCursor(sel);
    let anchor = getAnchor(sel);
    let currRow = point.getRow(cursor);
    let l = Math.min(point.getIndex(cursor), point.getIndex(anchor));
    let r = Math.max(point.getIndex(cursor), point.getIndex(anchor));

    //only allow same row selection
    return {
        left: point.create(currRow, l),
        right: point.create(currRow, r)
    };
}

function setCursor(sel, p) {
    let newSel = init(p, getAnchor(sel));

    return newSel;
}

function setAnchor(sel, p) {
    let newSel = init(getCursor(sel), p);

    return newSel;
}

function collapseTo(sel, p) {
    let newSel = selection.setCursor(sel, p);
    newSel = selection.setAnchor(sel, p);

    return newSel;
}

function collapse(sel) {
    return collapseTo(sel, getCursor(sel));
}

export const selection = {
    init,
    getCursor,
    getAnchor,
    setCursor,
    setAnchor,
    getOrdered,
    isCollapsed,
    collapseTo,
    collapse
}
