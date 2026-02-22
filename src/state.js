import { point } from './point.js';
import { model } from './model.js';
import { selection } from './selection.js';

function init() {
    let firstLine = model.mathLine(model.row());
    return {
        doc: {
            blocks: [firstLine],
        },
        view: {
            selection: selection.init(point.create(firstLine.row, 0), point.create(firstLine.row, 0))
        }
    };
}

function getSelection(st) {
    return st.view.selection;
}

function setSelection(st, sel) {
    st.view.selection = sel;

    return st;
}

function inRootRow(st) {
    const cursor = selection.getCursor(getSelection(st));

    return point.getRow(cursor) === getDoc(st);
}

function getCursor(st) {
    return selection.getCursor(getSelection(st));
}

function setCursor(st, p) {
    let newSel = selection.setCursor(getSelection(st), p);
    
    return setSelection(st, newSel);
}

function getOrdered(st) {
    return selection.getOrdered(getSelection(st));
}

function isCollapsed(st) {
    let ordered = selection.getOrdered(getSelection(st));

    return point.getIndex(ordered.left) === point.getIndex(ordered.right);
}

function collapseTo(st, p) {
    let newSel = selection.collapseTo(getSelection(st), p);

    return setSelection(st, newSel);
}

function collapse(st) {
    let newSel = selection.collapse(getSelection(st));

    return setSelection(st, newSel);
}

function getDoc(st) {
    return st.doc;
}

function setDoc(st, d) {
    st.doc = d;

    return st;
}

export const state = {
    init,
    getSelection,
    setSelection,
    inRootRow,
    getCursor,
    setCursor,
    getOrdered,
    isCollapsed,
    collapseTo,
    collapse,
    getDoc,
    setDoc
}
