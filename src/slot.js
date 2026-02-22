// slot context: {
// childRow,
// ownerNode,
// slotName,
// parentRow
// }

function getCtx(row) {
    return row.ctx;
}

function getOwner(row) {
    return getCtx(row).ownerNode;
}

function getName(row) {
    return getCtx(row).slotName;
}

function getParent(row) {
    return getCtx(row).parentRow;
}

function attach(cRow, oNode, sName, pRow) {
    cRow.ctx = {
        ownerNode : oNode,
        slotName: sName,
        parentRow: pRow
    }
}

function indexInParentRow(row) {
    let pRow = getParent(row);
    let ownerNode = getOwner(row);
    let i = 0;
    while (ownerNode != pRow.items[i] && i < pRow.items.length) i++;

    return i;
}

export const slot = {
    getOwner,
    getName,
    getParent,
    attach,
    indexInParentRow
}
