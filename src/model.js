import { slot } from './slot.js';
//AST

//constructors
function symbol(val) {
    return { type: "symbol", value: val}
}

function row(arr = []) {
    return { type: "row", items: arr, parent: null}
}

function power(e, x, parentRow = null) {
    let pow = {
        type: "power",
        base: e,
        exp: x
    }

    //wire exponent row slot context
    if (parentRow != null) slot.attach(pow.exp, pow, "exp", parentRow)

    return pow
}

function fraction(n, d, parentRow = null) {
    let frac = {
        type: "fraction",
        num: n,
        den: d
    }

    //wire num and den row slot context
    if (parentRow != null) {
        slot.attach(frac.num, frac, "num", parentRow)
        slot.attach(frac.den, frac, "den", parentRow)
    }
    return frac
}

function mathLine(r, ctx = true) {
    let mathLineNode = {
        type: "mathLine",
        row: r
    }

    if (ctx) slot.attach(mathLineNode.row, mathLineNode, "row", null);

    return mathLineNode;
}

function group(r, s, parentRow = null) {
    let groupNode = {
        type: "group",
        body: r,
        style: s
    };

    if (parentRow != null) slot.attach(groupNode.body, groupNode, "body", parentRow);

    return groupNode;
}

//transformations
function toPower(sym, parentRow) {
    let pow = power(sym, row(), parentRow)

    return pow
}

function toFraction(sym, parentRow) {
    let num = row()
    let den = row()

    if (sym) num.items.push(sym)

    let frac = fraction(num, den, parentRow) 
    return frac
}

function getRowItems(r) {
    return r.items;
}

function attachAllChildToRow(r) {
    for (let node of r.items) {
        switch (node.type) {
            case "symbol": break;
            case "power": {
                let exp = node.exp;
                slot.attach(exp, slot.getOwner(exp), slot.getName(exp), r);
                break;
            }
            case "fraction": {
                let num = node.num;
                let den = node.den;
                slot.attach(num, slot.getOwner(num), slot.getName(num), r);
                slot.attach(den, slot.getOwner(den), slot.getName(den), r);
                break;
            }
            case "group": {
                let body = node.body;
                slot.attach(body, slot.getOwner(body), slot.getName(body), r);
                break;
            }
        }
    }

    return r;
}

//returns list of {name, row}
function getSlots(node) {

    switch (node.type) {
        case "symbol": {
            return [];
        }
        case "power": {
            let res = [
                {name: "exp", row: node.exp}
            ];
            return res;
        }
        case "fraction": {
            let res = [
                {name: "num", row: node.num},
                {name: "den", row: node.den}
            ];
            return res;
        }
        case "group": {
            let res = [
                {name: "body", row: node.body}
            ];
            return res;
        }
        case "mathLine": {
            let res = [
                {name: "row", row: node.row}
            ];
            return res;
        }
    }
}

//deep removes context
function removeCtx(node) {
    switch (node.type) {
        case "symbol": {
            return symbol(node.value);
        }
        case "row": {
            let newItems = [];
            for (let n of node.items) {
                newItems.push(removeCtx(n));
            }
            return row(newItems);
        }
        case "power": {
            return power(
                removeCtx(node.base),
                removeCtx(node.exp),
                null
            );
        }
        case "fraction": {
            return fraction(
                removeCtx(node.num),
                removeCtx(node.den),
                null
            );
        }
        case "mathLine": {
            return mathLine(removeCtx(node.row), false);
        }
        case "group": {
            return group(removeCtx(node.body), node.style, null);
        }
    }
}

function addCtx(node, parentRow = null) {
    switch (node.type) {
        case "symbol": {
            return node;
        }
        case "row": {
            const items = node.items;
            let newItems = [];
            for (let n of items) {
                newItems.push(addCtx(n, node));
            }
            
            node.items = newItems;
            return node;
        }
        case "power": {
            node.base = addCtx(node.base, parentRow);
            node.exp = addCtx(node.exp, parentRow);
            slot.attach(node.exp, node, "exp", parentRow);

            return node;
        }
        case "fraction": {
            node.num = addCtx(node.num, parentRow);
            node.den = addCtx(node.den, parentRow);
            slot.attach(node.num, node, "num", parentRow);
            slot.attach(node.den, node, "den", parentRow);

            return node;
        }
        case "mathLine": {
            node.row = addCtx(node.row, parentRow);
            slot.attach(node.row, node, "row", parentRow);

            return node;
        }
        case "group": {
            node.body = addCtx(node.body, parentRow);
            slot.attach(node.body, node, "body", parentRow);

            return node;
        }
    }
}

export const model = {
    symbol,
    row,
    power,
    fraction,
    mathLine,
    group,
    toPower,
    toFraction,
    getRowItems,
    attachAllChildToRow,
    getSlots,
    removeCtx,
    addCtx
}
