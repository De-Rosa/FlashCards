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

document.zoomIn = function () {
    if (document.getElementById("question-box").style.scale === "") {
        document.getElementById("question-box").style.scale = "1";
    }
    let scale = parseFloat(document.getElementById("question-box").style.scale);
    if (scale > 2) return;
    document.getElementById("question-box").style.scale = (scale + 0.1).toString()
}

document.zoomOut = function () {
    if (document.getElementById("question-box").style.scale === "") {
        document.getElementById("question-box").style.scale = "1";
    }
    let scale = parseFloat(document.getElementById("question-box").style.scale);
    if (scale <= 0.5) return;
    document.getElementById("question-box").style.scale = (scale - 0.1).toString()
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
    if (openNew) onQuestionEnd();

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

    document.getElementById("question-box").style.height = "";
    document.getElementById("question-box").style.scale = "";

    document.renderPDF(qp);
    showMS(ms);
    document.openWindow(document.getElementById("question-box"), true);
    startQuestion();
}

function startQuestion() {
    if (question !== null) return;

    question = true;
    topThree = [];

    document.closeWindow(document.getElementById("file-explorer"), true)
    document.openWindow(document.getElementById("timer"), true)

    if (document.getElementById("help").getAttribute('status') === "none") {
        document.getElementById("help").setAttribute('status', "mark");
        document.getElementById("help").textContent = "Left click to mark as correct, right click otherwise."
    }

    document.socket.emit('start-question', {code: lobbyCode});
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

    onIncorrect(playerName);

    updateToggleColor(playerName);
    markPlayer(playerName, false);
}

function correctPlayer(playerName) {
    if (!players[playerName].toggled) return;
    players[playerName].toggled = false;
    players[playerName].answered = true;

    updateToggleColor(playerName);
    markPlayer(playerName, true);

    onCorrect(playerName)
}


let topThree = [];
function onCorrect(playerName) {
    let player = players[playerName];
    const firstBonuses = [8, 4, 2];
    let amount = 5;
    if (topThree.length < 3) {
        amount += firstBonuses[topThree.length];
        topThree.push(player);
        if (player.betting) {
            for (let i = 0; i < Object.keys(player.betting).length; i++) {
                let bettingPlayer = Object.keys(player.betting)[i];
                addMoneyToPlayer(bettingPlayer, player.betting[bettingPlayer]);
            }
        }
    }

    // bailout
    if (player.items.includes(-4)) {
        if (player.money < 0) {
            player.money = Math.floor(player.money / 2);
        }
    }

    // stocks
    if (player.items.includes(-3)) {
        amount *= 2;
    }

    if (player.onWin !== undefined) {
        amount += player.onWin;
        player.onWin = 0;
        player.onLose = 0;
    }

    for (let i = 0; i < player.items.length; i++) {
        let item = player.items[i];
        switch (item) {
            case 51: {
                amount += 2;
                break;
            }
            case 52: {
                amount += 4;
                break;
            }
            case 53: {
                amount += 6;
                break;
            }
            case 54: {
                amount += 8;
                break;
            }
            case 55: {
                amount += 10;
                break;
            }
            case 56: {
                amount += 15;
                break;
            }
        }
    }

    if (player.leeches) {
        for (let i = 0; i < Object.keys(player.leeches).length; i++) {
            let leech = Object.keys(player.leeches)[i];

            switch (player.leeches[leech]) {
                case 0: {
                    let leechAmount = Math.floor(amount * 0.2);
                    addMoneyToPlayer(leech, amount);
                    break;
                }
                case 1: {
                    let leechAmount = Math.floor(amount * 0.5);
                    addMoneyToPlayer(leech, amount);
                    break;
                }
                case 2: {
                    let leechAmount = amount;
                    addMoneyToPlayer(leech, amount);
                    break;
                }
                case 3: {
                    let leechAmount = amount * 2;
                    addMoneyToPlayer(leech, amount);
                    break;
                }
            }
        }
        player.leeches = {};
    }

    addMoneyToPlayer(playerName, amount);
}

function onIncorrect(playerName) {
    let player = players[playerName];

    if (player.onLose !== undefined) {
        addMoneyToPlayer(playerName, player.onLose);
        player.onWin = 0;
        player.onLose = 0;
    }

    for (let i = 0; i < player.items.length; i++) {
        let item = player.items[i];
        switch (item) {
            case 51: {
                player.items.splice(player.items.indexOf(item), 1);
                break;
            }
            case 52: {
                player.items.splice(player.items.indexOf(item), 1);
                break;
            }
            case 53: {
                player.items.splice(player.items.indexOf(item), 1);
                break;
            }
            case 54: {
                player.items.splice(player.items.indexOf(item), 1);
                break;
            }
            case 55: {
                player.items.splice(player.items.indexOf(item), 1);
                break;
            }
            case 56: {
                player.items.splice(player.items.indexOf(item), 1);
                break;
            }
        }
    }
}

function onQuestionEnd() {
    Object.keys(players).forEach(player => {
        onQuestionEndPlayer(player)
    })
}

function onQuestionEndPlayer(playerName) {
    let player = players[playerName];

    if (player.onWin) {
        player.onWin = 0;
        player.onLose = 0;
    }

    if (player.betting) {
        player.betting = {}
    }

    if (player.currentlyCloaked) {
        player.currentlyCloaked = false;
    }

    if (player.currentlyBlackout) {
        player.currentlyBlackout = undefined;
        updateMoneyTable(playerName);
    }

    if (player.cloaked) {
        player.currentlyCloaked = true;
        player.cloaked = false;
    }

    if (player.blackout !== undefined) {
        player.currentlyBlackout = player.blackout;
        player.blackout = undefined;
        updateMoneyTable(playerName);
    }

    for (let i = 0; i < player.items.length; i++) {
        let item = player.items[i];
        switch (item) {
            case 19: {
                addMoneyToPlayer(playerName, -2);
                break;
            }
            case 20: {
                addMoneyToPlayer(playerName, -3);
                break;
            }
            case 21: {
                addMoneyToPlayer(playerName, -4);
                break;
            }
            case 22: {
                addMoneyToPlayer(playerName, -5);
                break;
            }
            case 45: {
                addMoneyToPlayer(playerName, 1);
                break;
            }
            case 46: {
                addMoneyToPlayer(playerName, 2);
                break;
            }
            case 47: {
                addMoneyToPlayer(playerName, 3);
                break;
            }
            case 48: {
                addMoneyToPlayer(playerName, 4);
                break;
            }
            case 49: {
                addMoneyToPlayer(playerName, 5);
                break;
            }
            case 50: {
                addMoneyToPlayer(playerName, 6);
                break;
            }
        }
    }

    updatePlayer(playerName);
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
    let cost = [2, 10, 12, 25][index];
    if (players[playerName].money < cost) return false;
    addMoneyToPlayer(playerName, -cost);

    installPlugin(playerName, item);
    return true;
}

function installPlugin(playerName, item) {
    players[playerName].items.push(item);

    switch (item) {
        case -2:
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
        let card = document.getPackCard(rarity);
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

    let type = document.getItemDetails(item).type;
    switch (type) {
        case "attack": {
            requestTarget(playerName, item);
            break;
        }
        case "utility": {
            utilityCard(playerName, item);
            break;
        }
        case "status": {
            statusCard(playerName, item);
            break;
        }
        case "curse": {
            curseCard(playerName, item);
            break;
        }
    }
    updatePlayer(playerName);
    return true;
}

function getTargetablePlayers(playerName) {
    let targetable = [];
    for (let i = 0; i < Object.keys(players).length; i++) {
        let player = Object.keys(players)[i];
        if (player === playerName) continue;
        if (players[player].currentlyCloaked) continue;
        targetable.push(player);
    }
    return targetable;
}

function statusCard(playerName, item) {
    let player = players[playerName];
    switch (item) {
        case 19:
            if (player.money < 8) {
                player.items.push(item);
                return;
            }
            addMoneyToPlayer(playerName, -8)
            break;
        case 20:
            if (player.money < 12) {
                player.items.push(item);
                return;
            }
            addMoneyToPlayer(playerName, -12)
            break;
        case 21:
            if (player.money < 16) {
                player.items.push(item);
                return;
            }
            addMoneyToPlayer(playerName, -16)
            break;
        case 22:
            if (player.money < 20) {
                player.items.push(item);
                return;
            }
            addMoneyToPlayer(playerName, -20)
            break;
    }
}

function curseCard(playerName, item) {
    let player = players[playerName];
    switch (item) {
        case 23:
            addMoneyToPlayer(playerName, -10)
            break;
        case 24:
            addMoneyToPlayer(playerName, -20)
            break;
        case 25:
            addMoneyToPlayer(playerName, -30)
            break;
        case 26:
            addMoneyToPlayer(playerName, -40)
            break;
        case 27: {
            let plugins = getPlugins(player);
            if (plugins.length === 0) return;
            let index = Math.floor(Math.random() * plugins.length);
            let plugin = plugins[index];
            player.items.splice(player.items.indexOf(plugin), 1);
            break;
        }
        case 28: {
            let plugins = getPlugins(player);
            for (let i = 0; i < plugins.length; i++) {
                player.items.splice(player.items.indexOf(plugins[i]), 1);
            }
            break;
        }
    }
}

function getPlugins(player) {
    let plugins = [];
    for (let i = 0; i < player.items.length; i++) {
        let item = player.items[i];
        if (item >= 0) continue;
        plugins.push(item);
    }
    return plugins;
}

function utilityCard(playerName, item) {
    let player = players[playerName];
    switch (item) {
        case 4: {
            addMoneyToPlayer(playerName, 1);
            break;
        }
        case 5: {
            addMoneyToPlayer(playerName, 3);
            break;
        }
        case 6: {
            addMoneyToPlayer(playerName, 5);
            break;
        }
        case 7: {
            addMoneyToPlayer(playerName, player.money < 0 ? -player.money : player.money);
            break;
        }
        case 8: {
            addMoneyToPlayer(playerName, player.money < 0 ? -(player.money * 2) : (player.money * 2));
            break;
        }
        case 9: {
            addMoneyToPlayer(playerName, player.money < 0 ? -(player.money * 4) : (player.money * 4));
            break;
        }
        case 29: {
            if (!player.onWin) {
                player.onWin = 0;
            }
            if (!player.onLose) {
                player.onLose = 0;
            }

            player.onWin += 5;
            player.onLose -= 10;
            break;
        }
        case 30: {
            if (!player.onWin) {
                player.onWin = 0;
            }

            player.onWin += 10;
            player.onLose -= 15;
            break;
        }
        case 31: {
            if (!player.onWin) {
                player.onWin = 0;
            }
            if (!player.onLose) {
                player.onLose = 0;
            }

            player.onWin += 20;
            player.onLose -= 30;
            break;
        }
        case 32: {
            if (!player.onWin) {
                player.onWin = 0;
            }
            if (!player.onLose) {
                player.onLose = 0;
            }

            player.onWin += 30;
            player.onLose -= 40;
            break;
        }
        case 33: {
            if (!player.onWin) {
                player.onWin = 0;
            }
            if (!player.onLose) {
                player.onLose = 0;
            }

            player.onWin += 50;
            player.onLose -= 60;
            break;
        }
        case 34: {
            if (!player.onWin) {
                player.onWin = 0;
            }
            if (!player.onLose) {
                player.onLose = 0;
            }

            player.onWin += 100;
            player.onLose -= 150;
            break;
        }
        case 35: {
            let plugin = document.getPlugin(0, getPlugins(player));
            if (plugin === null) return;
            player.items.push(plugin);
            break;
        }
        case 36: {
            let plugin = document.getPlugin(1, getPlugins(player));
            if (plugin === null) return;
            player.items.push(plugin);
            break;
        }
        case 37: {
            let plugin = document.getPlugin(2, getPlugins(player));
            if (plugin === null) return;
            player.items.push(plugin);
            break;
        }
        case 38: {
            let plugin = document.getPlugin(3, getPlugins(player));
            if (plugin === null) return;
            player.items.push(plugin);
            break;
        }
        case 39: {
            let plugin = document.getPlugin(4, getPlugins(player));
            if (plugin === null) return;
            player.items.push(plugin);
            break;
        }
        case 40: {
            let plugin = document.getPlugin(5, getPlugins(player));
            if (plugin === null) return;
            player.items.push(plugin);
            break;
        }
        case 57: {
            player.blackout = 0;
            break;
        }
        case 58: {
            player.blackout = 1;
            break;
        }
        case 59: {
            addMoneyToPlayer(playerName, 10);
            let card = document.getCard(null, "curse");
            player.items.push(card);
            break;
        }
        case 60: {
            addMoneyToPlayer(playerName, 20);
            for (let i = 0; i < 2; i++) {
                let card = document.getCard(null, "curse");
                player.items.push(card);
            }
            break
        }
        case 61: {
            addMoneyToPlayer(playerName, 30);
            for (let i = 0; i < 3; i++) {
                let card = document.getCard(null, "curse");
                player.items.push(card);
            }
            break
        }
        case 62: {
            addMoneyToPlayer(playerName, 100);
            for (let i = 0; i < 6; i++) {
                let card = document.getCard(null, "curse");
                player.items.push(card);
            }
            break
        }
        case 63: {
            let curse = getRandomCard(player, "curse");
            if (curse === null) return;
            player.items.splice(player.items.indexOf(curse), 1);
            break;
        }
        case 64: {
            let curses = getCards(player, "curse");
            if (curses === null) return;
            for (let i = 0; i < curses.length; i++) {
                player.items.splice(player.items.indexOf(curses[i]), 1);
            }
            break;
        }
        case 65: {
            let cards = getCards(player);
            if (cards === null) return;
            for (let i = 0; i < cards.length; i++) {
                player.items.splice(player.items.indexOf(cards[i]), 1);
                let details = document.getItemDetails(cards[i]);
                let rarity = details.rarity;
                let newRarity = rarity >= 5 ? 5 : rarity + 1;
                let newCard = document.getCard(newRarity);
                player.items.push(newCard);
            }
            break;
        }
        case 66: {
            player.cloaked = true;
            break;
        }
        case 67: {
            let card = getRandomCard(player);
            if (card === null) return;
            player.items.splice(player.items.indexOf(card), 1);

            let details = document.getItemDetails(card);
            let rarity = details.rarity;
            let newRarity = rarity >= 5 ? 5 : rarity + 1;
            let newCard = document.getCard(newRarity);
            player.items.push(newCard);

            break;
        }
    }
}

function getCards(player, type = null) {
    let cards = []
    for (let i = 0; i < player.items.length; i++) {
        let item = player.items[i];
        let details = document.getItemDetails(item);
        if (details === null) continue;
        if ((details.type === type || type === null) && item > 3) {
            cards.push(item);
        }
    }

    if (cards.length === 0) return null;
    return cards;
}


document.giveCard = function(playerName, card) {
    players[playerName].items.push(card);
    updatePlayer(playerName);
}

function getRandomCard(player, type = null) {
    let cards = getCards(player, type)
    if (cards === null) return null;
    if (cards.length === 0) return null;
    let random = Math.floor(Math.random() * cards.length);
    return cards[random];
}

function attackCard(playerName, targetName, item) {
    let player = players[playerName];
    let target = players[targetName];

    let itemRarity = document.getItemDetails(item).rarity;
    let voodoo = handleVoodoo(target, itemRarity);
    if (voodoo) return;

    switch (item) {
        case 10: {
            addMoneyToPlayer(targetName, -1);
            break;
        }
        case 11: {
            addMoneyToPlayer(targetName, -3);
            break;
        }
        case 12: {
            addMoneyToPlayer(targetName, -5);
            break;
        }
        case 13: {
            target.money = target.money < 0 ? (target.money * 2) : Math.floor(target.money / 2)
            break;
        }
        case 14: {
            target.money = target.money < 0 ? target.money : 0;

            break;
        }
        case 15: {
            target.money = target.money < 0 ? target.money : -target.money;

            break;
        }
        case 16: {
            let swapTemp = player.money;
            player.money = target.money;
            target.money = swapTemp;
            break;
        }
        case 17: {
            player.money = target.money;
            target.money = 0;
            break;
        }
        case 18: {
            addMoneyToPlayer(playerName, target.money)
            target.money = 0;
            break;
        }
        case 41: {
            if (!target.betting) {
                target.betting = {};
            }

            if (!target.betting[playerName]) {
                target.betting[playerName] = 0;
            }

            addMoneyToPlayer(playerName, -10)

            target.betting[playerName] += 20;
            break;
        }
        case 42: {
            if (!target.betting) {
                target.betting = {};
            }

            if (!target.betting[playerName]) {
                target.betting[playerName] = 0;
            }

            addMoneyToPlayer(playerName, -25)

            target.betting[playerName] += 50;
            break;
        }
        case 43: {
            if (!target.betting) {
                target.betting = {};
            }

            if (!target.betting[playerName]) {
                target.betting[playerName] = 0;
            }

            addMoneyToPlayer(playerName, -50)

            target.betting[playerName] += 100;
            break;
        }
        case 44: {
            if (!target.betting) {
                target.betting = {};
            }

            if (!target.betting[playerName]) {
                target.betting[playerName] = 0;
            }

            addMoneyToPlayer(playerName, -100)

            target.betting[playerName] += 200;
            break;
        }
        case 68: {
            let card = getRandomCard(target);
            if (card === null) break;
            target.items.splice(target.items.indexOf(card), 1);
            player.items.push(card);
            break;
        }
        case 69: {
            for (let i = 0; i < 2; i++) {
                let card = getRandomCard(target);
                if (card === null) break;
                target.items.splice(target.items.indexOf(card), 1);
                player.items.push(card);
            }
            break;
        }
        case 70: {
            for (let i = 0; i < 3; i++) {
                let card = getRandomCard(target);
                if (card === null) break;
                target.items.splice(target.items.indexOf(card), 1);
                player.items.push(card);
            }
            break;
        }
        case 71: {
            for (let i = 0; i < 4; i++) {
                let card = getRandomCard(target);
                if (card === null) break;
                target.items.splice(target.items.indexOf(card), 1);
                player.items.push(card);
            }
            break;
        }
        case 72: {
            let cards = getCards(target);
            if (cards === null) break;
            for (let i = 0; i < cards.length; i++) {
                target.items.splice(target.items.indexOf(cards[i]), 1);
                player.items.push(cards[i]);
            }
            break;
        }
        case 73: {
            let curse = document.getCard(0, "curse");
            target.items.push(curse);
            break;
        }
        case 74: {
            let curse = document.getCard(1, "curse");
            target.items.push(curse);
            break;
        }
        case 75: {
            let curse = document.getCard(2, "curse");
            target.items.push(curse);
            break;
        }
        case 76: {
            let curse = document.getCard(3, "curse");
            target.items.push(curse);
            break;
        }
        case 77: {
            let curse = document.getCard(4, "curse");
            target.items.push(curse);
            break;
        }
        case 78: {
            let curse = document.getCard(5, "curse");
            target.items.push(curse);
            break;
        }
        case 79: {
            if (!target.leeches) {
                target.leeches = {};
            }

            target.leeches[playerName] = 0;
            break;
        }
        case 80: {
            if (!target.leeches) {
                target.leeches = {};
            }

            target.leeches[playerName] = 1;
            break;
        }
        case 81: {
            if (!target.leeches) {
                target.leeches = {};
            }

            target.leeches[playerName] = 2;
            break;
        }
        case 82: {
            if (!target.leeches) {
                target.leeches = {};
            }

            target.leeches[playerName] = 3;
            break;
        }
        case 83: {
            target.items.push(19);
            break;
        }
        case 84: {
            target.items.push(20);
            break;
        }
        case 85: {
            target.items.push(21);
            break;
        }
        case 86: {
            target.items.push(22);
            break;
        }
    }

    updatePlayer(targetName);
    updatePlayer(playerName);
}

function handleVoodoo(target, rarity) {
    if (rarity === 0 || rarity === 1) {
        if (target.items.includes(-1)) {
            target.items.splice(target.items.indexOf(-1), 1);
            updatePlayer(target);
            return true;
        }
    } else if (rarity === 2 || rarity === 3) {
        if (target.items.includes(-5)) {
            target.items.splice(target.items.indexOf(-5), 1);
            updatePlayer(target);
            return true;
        }
    } else if (rarity >= 4) {
        if (target.items.includes(-6)) {
            target.items.splice(target.items.indexOf(-6), 1);
            updatePlayer(target);
            return true;
        }
    }

    return false;
}

function processAttack(playerName, targetName, item) {
    attackCard(playerName, targetName, item)
    playerEvent(playerName, targetName, "attacked");

    updateMoneyTable(playerName);
    updateMoneyTable(targetName);

}

function requestTarget(playerName, item) {
    let targets = getTargetablePlayers(playerName);
    if (targets.length === 0) {
        players[playerName].items.push(item);
        return;
    }

    document.socket.emit('request-target', {code: lobbyCode, playerName: playerName, targets: targets})

    document.socket.on('target', function(data) {
        const { playerName, target } = data;
        if (playerName === playerName && players[target]) {
            processAttack(playerName, target, item);
            document.socket.off("target");
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
    if (players[playerName].currentlyBlackout !== undefined) {
        if (players[playerName].currentlyBlackout === 0) {
            let randomMoney = Math.floor(Math.random() * 100) - 20;
            document.getElementsByClassName("money-text")[index].textContent = randomMoney + " ";
        } else {
            let randomMoney = Math.floor(Math.random() * 20) - 3;
            document.getElementsByClassName("money-text")[index].textContent = randomMoney + " ";
        }
    } else {
        document.getElementsByClassName("money-text")[index].textContent = players[playerName].money + " ";
    }
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
    if (Object.keys(players).includes(data.playerName)) {
        console.log(`User ${data.playerName} rejoined server!`);
        updatePlayer(data.playerName);
        return;
    }

    addPlayer(data.playerName);
    console.log("New user joined server with name " + data.playerName);
})

document.socket.on('lobby-created', function(data) {
    if (data.success) {
        openHostScreen(data.code);
        lobbyCode = data.code;
        console.log("New lobby created with code " + data.code);
    } else {
        document.showError(data.message);
        console.log("Couldn't create lobby: " + data.message);

    }
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
    if (question === null) return;
    if (players[playerName]) {
        if (players[playerName].answered) return;
        players[playerName].toggled = !players[playerName].toggled;
        updateToggleColor(playerName);
    } else {
        console.error("Toggling a player which does not exist...");
    }
})