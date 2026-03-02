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
    let currRow = point.getRow(p);
    //keep getting parent row until in block row
    while (slot.getName(currRow) != "row") currRow = slot.getParent(currRow);
    let currBlock = slot.getOwner(currRow);

    //get cursor block as index in d.blocks
    let rowIndex = 0;
    while (currBlock != d.blocks[rowIndex]) rowIndex++;

    //split current Row into 2 parts based on point idex
    //if was not in a block struct, then don't split row
    let splitIndex = currRow === point.getRow(p) ?
        point.getIndex(p):
        currRow.items.length;

    let secondHalfOfRow = model.row(
        point.getRow(p).items.slice(splitIndex)
    );

    //have to change all inner rows slot parents to new row
    secondHalfOfRow = model.attachAllChildToRow(secondHalfOfRow);

    //remove from first half
    point.getRow(p).items.splice(splitIndex);

    d.blocks.splice(rowIndex + 1, 0, model.mathLine(secondHalfOfRow));

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

function insertGroupAt(d, p, type) {
    let currRow = point.getRow(p);
    let currIndex = point.getIndex(p);

    let groupNode = model.group(model.row(), type, currRow);

    let newP = insertNodeAt(d, p, groupNode);
    newP = enterGroup(d, newP, "left");

    return newP;
}

//deletion
function deleteBackwardAt(d, p) {
    let currRow = point.getRow(p);
    let i = point.getIndex(p);
    if (i === 0) {
        //check if start of block, if so then join prev block
        switch (slot.getName(currRow)) {
            case "row": {
                let currBlock = slot.getOwner(currRow);
                //get cursor block as index in d.blocks
                let rowIndex = 0;
                while (currBlock != d.blocks[rowIndex]) rowIndex++;

                if (rowIndex === 0) return p;

                //add currRow contents to previous row 
                let items = model.getRowItems(currRow);
                let prevRow = d.blocks[rowIndex - 1].row;
                let newIndex = model.getRowItems(prevRow).length;
                let newP = point.create(prevRow, newIndex);
                let tmp = 0;
                for (let node of items) {
                    newP = insertNodeAt(d, newP, node);
                }

                model.attachAllChildToRow(prevRow);

                //remove currRow
                d.blocks.splice(rowIndex, 1);

                return point.create(prevRow, newIndex);
            }

            default: return p;
        }
    }

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

function enterGroup(d, p, dir) {
    let currRow = point.getRow(p);
    let currIndex = point.getIndex(p);
    let i = dir === "left" ? currIndex - 1 : currIndex;

    let groupNode = currRow.items[i];
    let newIndex = dir === "left" ?
        groupNode.body.items.length :
        0;
    return point.create(groupNode.body, newIndex);
}

function exitStructure(d, p, dir) {
    let currRow = point.getRow(p);
    //if structure has no parent return null (e.g. blocks - mathLine)
    if (!slot.getParent(currRow)) return null;

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
                    case "group": return enterGroup(d, p, "left");
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

                    case "body": {
                        return exitStructure(d, p, "left");
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
                    case "group": return enterGroup(d, p, "right");
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
                    case "body": return exitStructure(d, p, "right");
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

function nextSlot(d, p) {
    const currRow = point.getRow(p);
    const currIndex = point.getIndex(p);
    const ownerNode = slot.getOwner(currRow);

    if (ownerNode.type === "mathLine") return null;
    
    const slots = model.getSlots(ownerNode);
    let i = 0;
    while (i < slots.length && slots[i].row != currRow) i++;
    if (i === slots.length - 1) return null; //no more slots after current slot

    return point.create(slots[i+1].row, 0);
}

function prevSlot(d, p) {
    const currRow = point.getRow(p);
    const currIndex = point.getIndex(p);
    const ownerNode = slot.getOwner(currRow);

    if (ownerNode.type === "mathLine") return null;

    const slots = model.getSlots(ownerNode);
    let i = 0;
    while (i < slots.length && slots[i].row != currRow) i++;
    if (i === 0) return null; //already at first slot
    
    return point.create(slots[i-1].row, model.getRowItems(slots[i-1].row).length);
}

function nearestStructureRight(d, p) {
    const currRow = point.getRow(p);
    const currIndex = point.getIndex(p);

    const rowItems = model.getRowItems(currRow);
    let i = currIndex;
    while (i < rowItems.length && model.getSlots(rowItems[i]).length === 0) i++; 

    if (i < rowItems.length) {
        //there is a structure to the right
        let newNode = rowItems[i];
        let newNameRow = model.getSlots(newNode)[0];
        return point.create(newNameRow.row, 0);
    } else {
        //no structure, dont do anything
        return p;
    }
}

function nearestStructureLeft(d, p) {
    const currRow = point.getRow(p);
    const currIndex = point.getIndex(p);

    const rowItems = model.getRowItems(currRow);
    let i = currIndex - 1;
    while (i >= 0 && model.getSlots(rowItems[i]).length === 0) i--; 

    if (i >= 0) {
        //there is structure to the left
        let newNode = rowItems[i];
        let slots = model.getSlots(newNode);
        let newNameRow = slots[slots.length - 1];
        return point.create(newNameRow.row, model.getRowItems(newNameRow.row).length - 1);
    } else {
        //no structure, dont do anything
        return p;
    }
}

function removeAllCtx(d) {
    const blocks = d.blocks;
    let newD = {blocks: []};
    for (let b of blocks) {
        newD.blocks.push(model.removeCtx(b));
    }

    return newD;
}

function addAllCtx(d) {
    const blocks = d.blocks;
    let newD = {blocks: []};
    for (let b of blocks) {
        newD.blocks.push(model.addCtx(b));
    }

    return newD;
}

export const transform = {
    insertSymbolAt,
    insertBlockAt,
    wrapPower,
    wrapFraction,
    insertGroupAt,
    exitStructure,
    nearestEditableSlot,
    nearestEditablePosition,
    deleteBackwardAt,
    deleteRange,
    nextSlot,
    prevSlot,
    nearestStructureRight,
    nearestStructureLeft,
    removeAllCtx,
    addAllCtx
}
