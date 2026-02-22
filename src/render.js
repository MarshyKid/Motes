import { selection } from './selection.js';
import { point } from './point.js';
import { state } from './state.js';

function elem(tag, name) {
    let el = document.createElement(tag)
    if (name) {
        el.className = name
    }
    return el
}

function caret() {
    return elem("span", "caret")
}

function renderSymbol(node) {
    let output = elem("span", "symbol")
    output.textContent = node.value
    return output
}

function isSelected(index, sel) {
    let ordered = selection.getOrdered(sel);
    let left = point.getIndex(ordered.left);
    let right = point.getIndex(ordered.right);

    if (left <= index && index < right) {
        return true
    }

    return false
}

function addSelected(elem, selection, index) {
    if (isSelected(index, selection)) elem.classList.add("selected")
}

function renderRow(node, sel) {
    let output = elem("span", "row")
    let cursor = selection.getCursor(sel);

    //handle empty row
    if (node.items.length == 0) output.appendChild(elem("span", "placeholder"))
    
    for (let i = 0; i < node.items.length; i++) {
        let newChild = render(node.items[i], sel)

        //add caret
        if (node == point.getRow(cursor) && i == point.getIndex(cursor)) output.appendChild(caret())

        //add selected class if needed
        if (isSelected(i, sel) && point.getRow(cursor) == node) addSelected(newChild, sel, i)

        output.appendChild(newChild)
    }

    if (node.items.length == point.getIndex(cursor) && point.getRow(cursor) == node) output.appendChild(caret())

    return output
}

function renderPower(node, selection) {
    let output = elem("span", "exp")
    output.appendChild(render(node.base, selection))
    
    let sup = elem("sup", "superscript")
    sup.appendChild(render(node.exp, selection))
    output.appendChild(sup)

    return output
}

function renderFraction(node, selection) {
    let output = elem("span", "fraction")

    let numerator = elem("span", "num")
    numerator.appendChild(render(node.num, selection))

    let denominator = elem("span", "denom")
    denominator.appendChild(render(node.den, selection))

    let bar = elem("span", "bar")

    output.append(numerator, bar, denominator)

    return output
}

function renderMathLine(node, sel) {
    let output = elem("div", "mathLine");
    output.append(render(node.row, sel));

    return output;
}

function render(node, selection) {
    switch (node.type) {
        case "symbol": return renderSymbol(node)
        case "row": return renderRow(node, selection)
        case "power": return renderPower(node, selection)
        case "fraction": return renderFraction(node, selection)
        case "mathLine": return renderMathLine(node, selection)
    }
}

export function renderState(st) {
    const d = state.getDoc(st);
    const sel = state.getSelection(st);

    let output = elem("div", "view");
    for (let i = 0; i < d.blocks.length; i++) {
        output.appendChild(render(d.blocks[i], sel));
    }

    return output;
}
