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

function mathLine(r) {
    let mathLineNode = {
        type: "mathLine",
        row: r
    }

    slot.attach(mathLineNode.row, mathLineNode, "row", null);

    return mathLineNode;
}

function group(r, s, parentRow) {
    let groupNode = {
        type: "group",
        body: r,
        style: s
    };

    slot.attach(groupNode.body, groupNode, "body", parentRow);

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
}
