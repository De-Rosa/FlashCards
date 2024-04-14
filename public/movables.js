let draggable = document.getElementsByClassName("box");
for (let i = 0; i < draggable.length; i++) {
    if (draggable[i].classList.contains("non-draggable")) continue;
    dragElement(draggable[i]);
}

// credit: https://www.w3schools.com/howto/tryit.asp?filename=tryhow_js_draggable
function dragElement(element) {
    let pos1 = 0, pos2 = 0, pos3 = 0, pos4 = 0;
    if (element.getElementsByClassName("program-name")[0]) {
        element.getElementsByClassName("program-name")[0].onmousedown = dragMouseDown;
    } else {
        element.onmousedown = dragMouseDown;
    }

    function dragMouseDown(e) {
        e.preventDefault();
        pos3 = e.clientX;
        pos4 = e.clientY;
        document.onmouseup = closeDragElement;
        document.onmousemove = elementDrag;
    }

    function elementDrag(e) {
        e.preventDefault();

        pos1 = pos3 - e.clientX;
        pos2 = pos4 - e.clientY;
        pos3 = e.clientX;
        pos4 = e.clientY;

        let newLeft = element.offsetLeft - pos1;
        element.style.left = newLeft + "px";

        let newTop = element.offsetTop - pos2;
        element.style.top = newTop + "px";
    }

    function closeDragElement() {
        document.onmouseup = null;
        document.onmousemove = null;
    }
}