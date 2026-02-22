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

export const model = {
    symbol,
    row,
    power,
    fraction,
    mathLine,
    toPower,
    toFraction
}
