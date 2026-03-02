import { state } from "./state.js";
import { transform } from "./transform.js";

function save(st) {
    //takes state and saves to json
    //json cannot serialize cyclic,
    //so have to remove slot context
    const doc = state.getDoc(st);
    const noCtxDoc = transform.removeAllCtx(doc);
    console.log(noCtxDoc);

    const jsonObj = JSON.stringify(noCtxDoc);
    console.log(jsonObj);

    const blob = new Blob([jsonObj], {type: "application/json"});
    const downloadAnchor = document.createElement("a");
    downloadAnchor.setAttribute("href", URL.createObjectURL(blob));
    downloadAnchor.setAttribute("download", "AST.json");

    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();

    document.body.removeChild(downloadAnchor);
    URL.revokeObjectURL(downloadAnchor.href);
}

function load(jsonObj) {
    //takes jsonObj(doc) and loads into fresh state
    //have to reattach all slots
    let doc = JSON.parse(jsonObj);
    let docWithCtx = transform.addAllCtx(doc);

    let newState = state.init(docWithCtx);
    return newState;
}

export const serialize = {
    save,
    load
}
