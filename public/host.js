let players = {};
let files = {};
let defaultFiles = {"FM Pure": {"qps": ["default papers/fm pure 2022.pdf"], "mss": ["default papers/fm pure 2022 ms.pdf"]}, "M Pure Mechanics": {"qps": ["default papers/m pure mechanics 2022.pdf"], "mss": ["default papers/m pure mechanics 2022 ms.pdf"]}}
let lobbyCode = "";
let question = null;

function openHostScreen(code) {
    document.getElementById("startPage").style.display = "none";
    document.getElementById("hostPage").style.display = "inline-block";
    document.getElementById("code").innerText = code;
    addDefaultPapers();
}

function addDefaultPapers() {
    async function getFileFromPath(path){
        let response = await fetch(path);
        let data = await response.blob();
        let metadata = {
            type: "application/pdf"
        };
        return new File([data], "paper.pdf", metadata);
    }

    for (let i = 0; i < Object.keys(defaultFiles).length; i++) {
        let fileName = Object.keys(defaultFiles)[i];
        files[fileName] = {"qps": [], "mss": [], "maxes": []}
        for (let j = 0; j < defaultFiles[fileName].qps.length; j++) {
            getFileFromPath(defaultFiles[fileName].qps[j]).then(file => {
                files[fileName].qps.push(file);
            })
            getFileFromPath(defaultFiles[fileName].mss[j]).then(file => {
                files[fileName].mss.push(file);
            })
        }
        addExplorerItem(fileName)
    }
}


function addPlayer(playerName) {
    players[playerName] = {money: 0, items: [], toggled: false, answered: false, maxCards: 6}
    addRow(playerName);
}

function addRow(playerName) {
    if (document.getElementById("no-players").style.display !== "none") {
        document.getElementById("no-players").style.display = "none";
    }
    if (document.getElementById("help").getAttribute('status') === "initial") {
        document.getElementById("help").textContent = "";
        document.getElementById("help").setAttribute('status', "none");
    }

    let newRow = document.createElement("tr");
    let newItem = document.createElement("td");
    let money = document.createElement("td");
    let moneySpan = document.createElement("span");
    let newDiv = document.createElement("div");
    let moneyIcon = document.createElement("img");

    newRow.onclick = function() {
        correctPlayer(playerName);
    }

    newRow.addEventListener('contextmenu', function(ev) {
        ev.preventDefault();
        incorrectPlayer(playerName);
        return false;
    }, false);

    money.classList.add("money");

    moneySpan.classList.add("money-text");
    moneySpan.textContent = players[playerName].money + " ";

    moneyIcon.classList.add("money-icon");
    moneyIcon.src = "images/money.png";
    moneyIcon.alt = "$";

    newDiv.classList.add("playerDiv");
    newDiv.textContent = playerName;

    newRow.classList.add("row");

    money.appendChild(moneySpan);
    money.appendChild(moneyIcon);
    newItem.appendChild(newDiv);
    newRow.appendChild(newItem);
    newRow.appendChild(money);
    document.getElementById("players").appendChild(newRow);
}

function addExplorerItem(itemName) {
    let newDiv = document.createElement("div");
    let icon = document.createElement("img");
    let text = document.createElement("p");

    newDiv.classList.add("icon-grid-item");
    newDiv.onclick = function() {
        document.selectFile(itemName);
    }

    text.textContent = itemName;

    icon.src = "images/file.png";
    icon.alt = itemName;

    newDiv.appendChild(icon);
    newDiv.appendChild(text);
    document.getElementById("icon-grid").appendChild(newDiv);
}

let inAnimation = false;
document.openWindow = function (div, simultaneous = false, user = false) {
    if (inAnimation && !simultaneous || div.style.display === "block") return;
    inAnimation = true;

    let outline = createOutline(div, user);
    outline.style.transform = "translate(-50%, -50%)";

    div.style.display = "block";
    let boundingBox = div.getBoundingClientRect();
    let width = boundingBox.width;
    let height = boundingBox.height;
    div.style.display = "none";

    outline.animate([
        {width: "0", height: "0"},
        {width: width + "px", height: height + "px"},
    ], {
        duration: 200,
        iterations: 1,
        fill: "forwards"
    })

    setTimeout(function() {
        inAnimation = false;
        div.style.display = "block";
        outline.remove();
    }, 200);
}

document.closeWindow = function (div, simultaneous = false, user = false) {
    if (inAnimation && !simultaneous || div.style.display === "none") return;
    inAnimation = true;

    let outline = createOutline(div, user);
    outline.style.transform = "translate(-50%, -50%)";

    let boundingBox = div.getBoundingClientRect();
    let width = boundingBox.width;
    let height = boundingBox.height;

    div.style.display = "none";

    outline.animate([
        {width: width + "px", height: height + "px"},
        {width: 0, height: 0},
    ], {
        duration: 200,
        iterations: 1,
        fill: "forwards"
    })

    setTimeout(function() {
        inAnimation = false;
        outline.remove();
    }, 200);
}

function createOutline(div, user = false) {
    let outline = document.createElement("div");
    if (user) {
        document.getElementById("userPage").appendChild(outline);
    } else {
        document.getElementById("hostPage").appendChild(outline);
    }
    outline.id = "outline";
    outline.style.transform = div.style.transform;
    outline.style.left = div.style.left;
    outline.style.top = div.style.top;
    outline.style.zIndex = div.style.zIndex;

    return outline;
}

let timerInterval = null;
document.startTimer = function(seconds) {
    if (timerInterval !== null) return;
    if (seconds === 0) seconds = 10;

    let progress = 0;
    let passedSeconds = 0;
    let time = 100 / seconds;

    const progressText = document.getElementById('time-text');
    progressText.innerHTML = `<b>Time progressed:</b> ${(Math.floor(passedSeconds / 60))}m ${passedSeconds % 60}s`

    const remainingText = document.getElementById('time-remaining-text');
    remainingText.innerHTML = `<b>Time remaining:</b> ${(Math.floor((seconds - passedSeconds) / 60))}m ${(seconds - passedSeconds) % 60}s`

    const progressBar = document.getElementById('progress-bar');
    progressBar.innerHTML = '';

    function updateProgress(percent, passedSeconds) {
        progressBar.style.width = percent + '%';
        progressBar.innerHTML = '';

        progressText.innerHTML = `<b>Time progressed:</b> ${(Math.floor(passedSeconds / 60))}m ${passedSeconds % 60}s`
        remainingText.innerHTML = `<b>Time remaining:</b> ${(Math.floor((seconds - passedSeconds) / 60))}m ${(seconds - passedSeconds) % 60}s`

        const numBlocks = Math.floor(percent / 5);
        for (let i = 0; i < numBlocks; i++) {
            const block = document.createElement('div');
            block.classList.add('block');
            progressBar.appendChild(block);
        }
    }

    timerInterval = setInterval(() => {
        progress += time;
        passedSeconds++;
        updateProgress(progress, passedSeconds);
        if (passedSeconds >= seconds) {
            clearInterval(timerInterval);
            timerInterval = null;
        }
    }, 1000);
}

function showMS (file) {
    document.openWindow(document.getElementById("ms-box"))
    const fileReader = new FileReader();
    fileReader.readAsDataURL(file);
    fileReader.onload = function(e) {
        let url = e.target.result;
        document.getElementById("ms").onclick = function () {
            openMSWindow(url);
        }
    }


}

function openMSWindow(data) {
    let newWindow = window.open('', '', "popup");
    let windowDocument = newWindow.document;

    let image = windowDocument.createElement('iframe');
    image.src = data;
    image.style.width = "100%";
    image.style.height = "100%";

    windowDocument.body.appendChild(image);
}

document.cancelTimer = function (openNew = true) {
    if (timerInterval !== null) {
        clearInterval(timerInterval);
        timerInterval = null;
    }
    stopQuestion(openNew);
}

function stopQuestion(openNew = true) {
    if (question === null) return;

    document.closeWindow(document.getElementById("timer"), true);
    document.closeWindow(document.getElementById("question-box"), true)
    document.closeWindow(document.getElementById("ms-box"), true)
    if (openNew) document.openWindow(document.getElementById("file-explorer"), true);

    if (document.getElementById("help").getAttribute('status') === "mark") {
        document.getElementById("help").setAttribute('status', "none");
        document.getElementById("help").textContent = ""
    }

    question = null;
    document.socket.emit('end-question', {code: lobbyCode});
    resetPlayerTemps();
}

document.selectFile = function (fileName) {
    let qp = null;
    let ms = null;
    if (fileName === -1) {
        // random
        if (Object.keys(files).length === 0) {
            document.showError("Failed to start: there are no files.")
            console.error("No files to randomly pick from!");
            return;
        }
        let randomFileName =  Object.keys(files)[Math.floor(Math.random() * Object.keys(files).length)]
        let fileArray = files[randomFileName].qps;
        let random = Math.floor(Math.random() * fileArray.length);
        qp = fileArray[random];
        ms = files[randomFileName].mss[random];
    } else {
        let fileArray = files[fileName].qps;
        let random = Math.floor(Math.random() * fileArray.length);
        qp = fileArray[random];
        ms = files[fileName].mss[random];
    }

    console.log(ms);
    console.log(qp);

    document.renderPDF(qp);
    showMS(ms);
    document.openWindow(document.getElementById("question-box"), true);
    startQuestion();
}

function startQuestion() {
    if (question !== null) return;

    question = true;

    document.closeWindow(document.getElementById("file-explorer"), true)
    document.openWindow(document.getElementById("timer"), true)

    if (document.getElementById("help").getAttribute('status') === "none") {
        document.getElementById("help").setAttribute('status', "mark");
        document.getElementById("help").textContent = "Left click to mark as correct, right click otherwise."
    }

    document.socket.emit('start-question', {code: lobbyCode});
}

function calculateCoins() {
    return 5;
}

function addMoneyToPlayer(playerName, amount) {
    players[playerName].money += amount;
    updatePlayer(playerName);
    updateMoneyTable(playerName);
}

function incorrectPlayer(playerName) {
    if (!players[playerName].toggled) return;
    players[playerName].toggled = false;
    players[playerName].answered = false;

    updateToggleColor(playerName);
    markPlayer(playerName, false);
}

function correctPlayer(playerName) {
    if (!players[playerName].toggled) return;
    players[playerName].toggled = false;
    players[playerName].answered = true;

    updateToggleColor(playerName);
    markPlayer(playerName, true);

    let coins = calculateCoins();
    addMoneyToPlayer(playerName, coins);
}

function resetPlayerTemps() {
    Object.keys(players).forEach(player => {
        players[player].answered = false;
        players[player].toggled = false;
        updateToggleColor(player);
    })
}

function markPlayer(playerName, correct) {
    if (!players[playerName]) {
        console.error("Marking player that doesn't exist!");
        return;
    }
    document.socket.emit('mark-player', {code: lobbyCode, playerName: playerName, correct: correct})
}

function updatePlayer(playerName) {
    if (!players[playerName]) {
        console.error("Updating player that doesn't exist!");
        return;
    }
    document.socket.emit('update-player', {code: lobbyCode, playerName: playerName, money: players[playerName].money, items: players[playerName].items})
}

function buyPlugin(playerName, item) {
    if (item > -1 || item < -4) return false;

    let index = -1 - item;
    let cost = [10, 10, 10, 10][index];
    if (players[playerName].money < cost) return false;
    addMoneyToPlayer(playerName, -cost);

    installPlugin(playerName, item);
    return true;
}

function installPlugin(playerName, item) {
    players[playerName].items.push(item);

    switch (item) {
        case -1:
            players[playerName].maxCards += 3;
            playerEvent(playerName, playerName, "pockets");
            break;
        default:
            console.error("Unknown plugin being installed...");
            break;
    }
}

function buyPack(playerName, item) {
    if (item > 3 || item < 0) return false;

    let cost = [2, 5, 8, 15][item];
    if (players[playerName].money < cost) return false;
    addMoneyToPlayer(playerName, -cost);

    usePack(playerName, item);

    return true;
}

function usePack(playerName, item) {
    let probDistributions = [
        [0.5625, 0.3125, 0.09375, 0.03125, 0, 0], //common packs
        [0, 0.5625, 0.3125, 0.09375, 0.03125, 0], //rare packs
        [0, 0, 0.5625, 0.3125, 0.09375, 0.03125], //epic packs
        [0, 0, 0, 0.59375, 0.3125, 0.09375], //legendary packs
    ] //common, rare, epic, legendary, mythic, godly

    const packSize = 3;
    for (let i = 0; i < packSize; i++) {
        let rarity = getRarity(probDistributions[item]);
        let card = document.getCard(rarity);
        players[playerName].items.push(card);
    }
}

function getRarity(distribution) {
    let random = Math.random();
    let total = 0;
    for (let i = 0; i < distribution.length; i++) {
        if (random > total && random < total + distribution[i]) {
            return i;
        }
        total += distribution[i];
    }
}

function processPurchase(playerName, item) {
    let result;
    if (item < 0) {
        if (players[playerName].items.includes(item)) return false;
        result = buyPlugin(playerName, item);
    } else {
        if (isCardsFull(playerName)) return false;
        result = buyPack(playerName, item);
    }

    if (!result) return false;

    updatePlayer(playerName);
    return true;
}

function isCardsFull(playerName) {
    return players[playerName].items.filter(obj => {
        return obj > 0;
    }).length > (players[playerName].maxCards - 3);
}

function processUse(playerName, item) {
    if (item < 0) {
        // must be a card, not a plugin
        return false;
    }

    if (!players[playerName].items.includes(item)) {
        console.error(`${playerName} is using an item that doesn't exist: ${item} (has items [${players[playerName].items}])`);
        return false;
    }
    players[playerName].items.splice(players[playerName].items.indexOf(item), 1);

    if (document.getItemDetails(item).type === "attack") {
        requestTarget(playerName, item)
    }

    updatePlayer(playerName);
    return true;
}

function processAttack(playerName, target, item) {
    // temp
    playerEvent(playerName, target, "attacked");
}

function requestTarget(playerName, item) {
    document.socket.emit('request-target', {code: lobbyCode, playerName: playerName})

    document.socket.on('target', function(data) {
        const { playerName, target } = data;
        if (playerName === playerName && players[target]) {
            processAttack(playerName, target, item);
        }
    })

}

function updateToggleColor(playerName) {
    let index = Object.keys(players).indexOf(playerName);
    if (players[playerName].answered) {
        document.getElementsByClassName("row")[index].style.display = "none";
    } else {
        document.getElementsByClassName("row")[index].style.display = "table-row";
        document.getElementsByClassName("row")[index].style.filter = players[playerName].toggled ? "invert(1)" : "invert(0)";
        document.getElementsByClassName("row")[index].style.cursor = players[playerName].toggled ? "pointer" : "auto";
    }
}

function updateMoneyTable(playerName) {
    let index = Object.keys(players).indexOf(playerName);
    document.getElementsByClassName("money-text")[index].textContent = players[playerName].money + " ";
}

function playerEvent(fromPlayer, toPlayer, event) {
    document.socket.emit('event', {code: lobbyCode, toPlayer: toPlayer, fromPlayer: fromPlayer, event: event})
}

document.getElementById('fileForm').addEventListener('submit', function(event) {
    event.preventDefault();
    const fileName = document.getElementById('fileName').value;
    files[fileName] = {"qps": document.getElementById('qps').files, "mss": document.getElementById("mss").files};
    addExplorerItem(fileName);

    document.getElementById('fileName').value = "";
    document.getElementById('qps').files = null;
    document.getElementById('mss').files = null;
    document.closeWindow(document.getElementById('file-box'))
});

document.socket.on('new-user', function(data) {
    addPlayer(data.playerName);
    console.log("New user joined server with name " + data.playerName);
})

document.socket.on('lobby-created', function(data) {
    openHostScreen(data.code);
    lobbyCode = data.code;
    console.log("New lobby created with code " + data.code);
})

document.socket.on('buy', function(data) {
    const { playerName, item } = data;
    if (players[playerName]) {
        console.log(playerName, "is attempting to buy", item);
        let result = processPurchase(playerName, item);
        document.socket.emit('buy-response', {code: lobbyCode, playerName: playerName, item: item, success: result, message: result ? "" : "Cannot purchase."})
    } else {
        console.error("Trying to purchase for a player which does not exist...")
    }
})

document.socket.on('use', function(data) {
    const { playerName, item } = data;
    if (players[playerName]) {
        console.log(playerName, "is attempting to use", item);
        let result = processUse(playerName, item);
        document.socket.emit('use-response', {code: lobbyCode, playerName: playerName, item: item, success: result, message: result ? "" : "Cannot use."})
    }else {
        console.error("Trying to use an item for a player which does not exist...")
    }
})

document.socket.on('bulb-toggle', function(data) {
    const { playerName } = data;
    if (players[playerName]) {
        if (players[playerName].answered) return;
        players[playerName].toggled = !players[playerName].toggled;
        updateToggleColor(playerName);
    } else {
        console.error("Toggling a player which does not exist...");
    }
})