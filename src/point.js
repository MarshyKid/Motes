function create(r, i) {
    return {
        row: r,
        index: i
    };
}

function getRow(p) {
    return p.row;
}

function getIndex(p) {
    return p.index;
}

export const point = {
    create,
    getRow,
    getIndex
}
