import { point } from './point.js';
import { model } from './model.js';
import { slot } from './slot.js';

//insertion/wrapping
function insertNodeAt(d, p, node) {
    //insert node at point p
    let i = point.getIndex(p);
    point.getRow(p).items.splice(i, 0, node);

    return point.create(point.getRow(p), i + 1);
}

function insertSymbolAt(d, p, value) {
    let sym = model.symbol(value);
    //insert symbol at point p
    
    return insertNodeAt(d, p, sym);
}

function insertBlockAt(d, p) {
    //add new block below cursor row block
    let currBlock = slot.getOwner(point.getRow(p));

    //get cursor block as index in d.blocks
    let rowIndex = 0;
    while (currBlock != d.blocks[rowIndex]) rowIndex++;

    d.blocks.splice(rowIndex + 1, 0, model.mathLine(model.row()));

    let newBlock = d.blocks[rowIndex + 1];
    let newRow = newBlock.row;
    let newIndex = 0;

    return point.create(newRow, newIndex);
}

function wrapPower(d, p) {
    if (point.getIndex(p) === 0) return p; //only wrap power if there is a left symbol
    let leftNode = point.getRow(p).items[point.getIndex(p) - 1];
    
    let newP = deleteBackwardAt(d, p);
    newP = insertNodeAt(d, newP, model.toPower(leftNode, point.getRow(newP)));
    newP = enterPower(d, newP, "left");

    return newP;
}

function wrapFraction(d, p) {
    if (point.getIndex(p) === 0) {
        //add empty power
        let frac = model.toFraction(null, point.getRow(p));
        let newP = insertNodeAt(d, p, frac);
        newP = enterFraction(d, point.create(point.getRow(p), 0), "right");

        return newP;
    } else {
        //left sym becomes num, return point in den
        let currRow = point.getRow(p);
        let leftSym = currRow.items[point.getIndex(p) - 1];
        let frac = model.toFraction(leftSym, currRow);

        //delete before inserting
        let newP = deleteBackwardAt(d, p);

        //insert frac
        newP = insertNodeAt(d, newP, frac);
        newP = enterFraction(d, newP, "left");

        return newP;
    }
}

//deletion
function deleteBackwardAt(d, p) {
    let currRow = point.getRow(p);
    let i = point.getIndex(p);
    if (i === 0) return p;

    let newItems = currRow.items.slice(0, i - 1);
    newItems = newItems.concat(currRow.items.slice(i));

    currRow.items = newItems;

    return point.create(currRow, i - 1);
}

function deleteRange(d, startP, endP) {
    while (point.getIndex(endP) > point.getIndex(startP)) {
        endP = deleteBackwardAt(d, endP);
    }

    return startP;
}

//navigation (no mutation)
function enterPower(d, p, dir) {
    let i = dir == "left" ? -1 : 0;
    
    const powerNode = point.getRow(p).items[point.getIndex(p) + i];
    
    let newRow = powerNode.exp;
    let newIndex = dir == "left" ? newRow.items.length : 0;

    return point.create(newRow, newIndex);
}

function enterFraction(d, p, dir) {
    let i = dir == "left" ? -1 : 0;
    const fracNode = point.getRow(p).items[point.getIndex(p) + i];

    switch (dir) {
        case "left": {
            //enter denom
            let newRow = fracNode.den;
            let newIndex = newRow.items.length;
            
            return point.create(newRow, newIndex);
        }

        case "right": {
            let newRow = fracNode.num;
            let newIndex = newRow.items.length;

            return point.create(newRow, newIndex);
        }
    }

    console.error("No fraction direction specified");
}

function exitStructure(d, p, dir) {
    let currRow = point.getRow(p);
    let i = dir == "left" ? 0 : 1;

    let newIndex = slot.indexInParentRow(currRow) + i;
    let newRow = slot.getParent(currRow);
    
    return point.create(newRow, newIndex);
}

function prevBlock(d, p) {
    let currBlock = slot.getOwner(point.getRow(p));
    
    //get cursor block as index in d.blocks
    let rowIndex = 0;
    while (currBlock != d.blocks[rowIndex]) rowIndex++;
    
    let newBlock = d.blocks[Math.max(0, rowIndex - 1)];
    let newRow = newBlock.row;
    let newIndex = newBlock === currBlock ? 0 : newRow.items.length;

    return point.create(newRow, newIndex);
}

function nextBlock(d, p) {
    let currBlock = slot.getOwner(point.getRow(p));

    //get cursor block as index
    let rowIndex = 0;
    while (currBlock != d.blocks[rowIndex]) rowIndex++;

    let newBlock = d.blocks[Math.min(d.blocks.length - 1, rowIndex + 1)];
    let newRow = newBlock.row;
    let newIndex = newBlock === currBlock ? newRow.items.length : 0;

    return point.create(newRow, newIndex);
}

function nearestEditableSlot(d, p, dir) {
    let currRow = point.getRow(p);
    let currIndex = point.getIndex(p);

    switch (dir) {
        case "left": {
            if (currIndex > 0) {
                let leftSym = currRow.items[currIndex - 1];

                switch (leftSym.type) {
                    case "power": return enterPower(d, p, "left");
                    case "fraction": return enterFraction(d, p, "left");
                    case "symbol": return point.create(currRow, currIndex - 1);
                }
            } else {
                switch (slot.getName(currRow)) {
                    case "row": {
                        return null;
                    }

                    case "exp": {
                        return exitStructure(d, p, "left");
                    }

                    case "num": {
                        return exitStructure(d, p, "left");
                    }

                    case "den": {
                        //enter numerator
                        let frac = slot.getOwner(currRow);

                        return point.create(frac.num, frac.num.items.length);
                    }
                }
            }
        }

        case "right": {
            if (currIndex < currRow.items.length) {
                let rightSym = currRow.items[currIndex];
                switch (rightSym.type) {
                    case "power": return enterPower(d, p, "right");
                    case "fraction": return enterFraction(d, p, "right");
                    case "symbol": return point.create(currRow, currIndex + 1); 
                }
            } else {
                switch (slot.getName(currRow)) {
                    case "row": return null;
                    case "exp": return exitStructure(d, p, "right");
                    case "num": {
                        //enter denom
                        let frac = slot.getOwner(currRow);
                        return point.create(frac.den, 0);
                    }
                    case "den": return exitStructure(d, p, "right");
                }
            }
        }
    }
}

function nearestEditablePosition(d, p, dir) {
    let newP = nearestEditableSlot(d, p, dir);
    if (!newP) {
        //at block boundary
        switch (dir) {
            case "left": return prevBlock(d, p);
            case "right": return nextBlock(d, p);
        }
    } else return newP;
}

export const transform = {
    insertSymbolAt,
    insertBlockAt,
    wrapPower,
    wrapFraction,
    exitStructure,
    nearestEditableSlot,
    nearestEditablePosition,
    deleteBackwardAt,
    deleteRange
}
