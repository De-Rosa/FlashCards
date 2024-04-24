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

        // no boundary box
        if (element.classList.contains("unbound")) {
            let newLeft = (element.offsetLeft - pos1) / window.innerWidth * 100;
            element.style.left = newLeft + "%";

            let newTop = (element.offsetTop - pos2) / window.innerHeight * 100;
            element.style.top = newTop + "%";

            return
        }

        let newLeft = (element.offsetLeft - pos1) * (window.innerWidth / document.documentElement.clientWidth);
        newLeft = Math.max(element.offsetWidth / 2, Math.min(newLeft, window.innerWidth - element.offsetWidth / 2));
        element.style.left = ((newLeft / window.innerWidth) * 100) + "%";

        let newTop = (element.offsetTop - pos2) * (window.innerHeight / document.documentElement.clientHeight);
        newTop = Math.max(element.offsetHeight / 2, Math.min(newTop, window.innerHeight - element.offsetHeight / 2));
        element.style.top = ((newTop / window.innerHeight) * 100) + "%";
    }

    function closeDragElement() {
        document.onmouseup = null;
        document.onmousemove = null;
    }
}