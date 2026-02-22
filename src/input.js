import { commands } from "./commands.js";
import { renderState } from "./render.js";
import { state } from "./state.js";
//keyboard input

//map key -> commands
function handle(event, st) {
    let keypress = event.key
    let shift = event.shiftKey

    switch (keypress) {
        case "ArrowRight": {
            st= commands.moveCursorRight(st, shift)
            break
        }

        case "ArrowLeft": {
            st= commands.moveCursorLeft(st, shift)
            break
        }

        case "Backspace": {
            st= commands.deleteBackward(st);
            break
        }

        case "^": {
            st= commands.insertPower(st)
            break
        }

        case "/": {
            st= commands.insertFraction(st)
            break
        }

        case "Enter": {
            st = commands.insertBlock(st);
        }

        default: {
            if (keypress.length == 1) commands.insertSymbol(st, keypress) //only add keys with length 1
            break
        }
    }

    view(st)
    return st
}

function view(st) {
    document.getElementById("viewer").replaceChildren(renderState(st))
}

let st = state.init();

view(st)

document.addEventListener("keydown", (event) => {
    st = handle(event, st)
})
