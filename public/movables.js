let draggable = document.getElementsByClassName("box");
for (let i = 0; i < draggable.length; i++) {
    if (draggable[i].classList.contains("non-draggable")) continue;
    dragElement(draggable[i]);
}

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

        let newLeft = (element.offsetLeft - pos1) / window.innerWidth * 100;
        element.style.left = newLeft + "%";

        let newTop = (element.offsetTop - pos2) / window.innerHeight * 100;
        element.style.top = newTop + "%";
    }

    function closeDragElement() {
        document.onmouseup = null;
        document.onmousemove = null;
    }
}