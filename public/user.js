let playerName = "";
let lobbyCode = null;
let current = {money: 0, answered: false, toggled: false, cooldown: false};

function openUserScreen() {
    window.scrollTo(0, 0);
    document.getElementById("startPage").style.display = "none";
    document.getElementById("userPage").style.display = "flex";
}

let bulbScreen = false;
function openBulbScreen() {
    bulbScreen = true;

    current.answered = false;
    current.toggled = false;
    document.getElementById("bulb-page").style.display = "flex";
    document.getElementById("bulb-page").animate([
        {opacity: "0%"},
        {opacity: "100%"},
    ], {
        duration: 500,
        iterations: 1,
        fill: "forwards"
    })

    document.getElementById("playing-page").style.display = "none";
    updateBackground();
}

function hideBulbScreen() {
    bulbScreen = false;

    current.answered = false;
    current.toggled = false;
    current.cooldown = false;
    if (cooldown !== null) {
        clearTimeout(cooldown);
        cooldown = null;
    }

    document.getElementById("playing-page").style.display = "flex";
    document.getElementById("bulb-page").animate([
        {opacity: "100%"},
        {opacity: "0%"},
    ], {
        duration: 500,
        iterations: 1,
        fill: "forwards"
    })

    setTimeout(function() {
        document.getElementById("bulb-page").style.display = "none";
    }, 500);
}

function updateBackground() {
    if (current.toggled) {
        document.getElementById("bulb-page").style.filter = "invert(1)"
    } else {
        document.getElementById("bulb-page").style.filter = "invert(0)"
    }

    if (current.answered) {
        document.getElementById('bulb-img').src = 'images/broken bulb.png';
        document.getElementById('bulb-line').style.display = "block";
    }  else if (current.cooldown) {
        document.getElementById('bulb-img').src = 'images/wait.png';
        document.getElementById('bulb-line').style.display = "none";
    } else {
        document.getElementById('bulb-img').src = 'images/bulb.png';
        document.getElementById('bulb-line').style.display = "block";
    }
}

let previousItems = [];
function displayAllItems(items) {
    resetCards();
    resetPlugins();
    for (let i = 0; i < items.length; i++) {
        if (items[i] < 0) {
            // is a plugin
            displayPlugin(items[i]);
        } else {
            // is a card - if new, animate
            displayCard(items[i], !previousItems.includes(items[i]));
        }
    }

    previousItems = items;
}

function displayCard(item, isNew = false) {
    const rarities = ["common", "rare", "epic", "legendary", "mythic", "godly"]

    let cardDetails = document.getItemDetails(item);
    if (cardDetails === null) return;

    let newDiv = document.createElement("div");
    let cardCategory = document.createElement("span");
    let br = document.createElement("br");
    let rarity = document.createElement("span");
    let description = document.createElement("div");
    let title = document.createElement("div");

    newDiv.classList.add("card");

    cardCategory.textContent = cardDetails.type;
    rarity.textContent = rarities[cardDetails.rarity];
    newDiv.classList.add(rarities[cardDetails.rarity]);

    description.textContent = cardDetails.description;
    description.classList.add("card-description");
    title.textContent = cardDetails.name;
    title.classList.add("card-title");

    newDiv.onclick = function() {
        selectCard(this, item);
    }

    newDiv.appendChild(cardCategory);
    newDiv.appendChild(br);
    newDiv.appendChild(rarity);
    newDiv.appendChild(title);
    newDiv.appendChild(description);

    if (isNew) {
        newDiv.animate([
            {transform: "translateY(-100px)", opacity: "0%", width: "0"},
            {transform: "translateY(0px)", opacity: "100%", width: "250px"},
        ], {
            duration: 200,
            iterations: 1,
            easing: "cubic-bezier(0.65, 0.05, 0.36, 1)"
        })
    }

    document.getElementById("cards").appendChild(newDiv);
}

function displayPlugin(item) {
    let newDiv = document.createElement("div");
    let img = document.createElement("img");

    newDiv.classList.add("plugin-grid-item");


    let details = document.getItemDetails(item);
    newDiv.onclick = function() {
        showDescription(details);
    }

    img.src = `images/${details.image}`

    const rarities = ["common", "rare", "epic", "legendary", "mythic", "godly"]
    img.classList.add(rarities[details.rarity])

    newDiv.appendChild(img);
    document.getElementById("plugins").appendChild(newDiv);
}

function showDescription(details) {
    const rarities = ["common", "rare", "epic", "legendary", "mythic", "godly"]

    document.getElementById("description-box").style.display = "block";
    document.getElementById("description").textContent = details.description + ` (rarity: ${rarities[details.rarity]})`
}

let selectingAttack = false;
function showAttackSelection(players) {
    if (players.length <= 0) return;
    selectingAttack = true;

    document.getElementById("attacked").innerHTML = "";
    animateDarken();
    setTimeout(function() {
        document.openWindow(document.getElementById("attack-box"), true, true)
    }, 500);


    for (let i = 0; i < players.length; i++) {
        if (players[i] === playerName) continue;
        addAttackRow(players[i])
    }
}

function addAttackRow(playerName) {
    let newRow = document.createElement("tr");
    let newItem = document.createElement("td");
    let newDiv = document.createElement("div");

    newRow.onclick = function() {
        target(playerName);
    }

    newDiv.classList.add("playerDiv");
    newDiv.textContent = playerName;

    newRow.classList.add("row");
    newItem.classList.add("normal");

    newItem.appendChild(newDiv);
    newRow.appendChild(newItem);
    document.getElementById("attacked").appendChild(newRow);
}

function target(targetName) {
    selectingAttack = false;

    document.getElementById("attacked").innerHTML = "";
    document.closeWindow(document.getElementById("attack-box"), true, true)
    document.getElementById("darken").style.display = "none";

    document.socket.emit('target', {code: lobbyCode, playerName: playerName, target: targetName});
}

function animateDarken() {
    document.getElementById("darken").style.display = "block";
    document.getElementById("darken").animate([
        {height: "0vh"},
        {height: "100vh"},
    ], {
        duration: 500,
        iterations: 1,
        fill: "forwards"
    })
}

function resetCards() {
    let text = document.getElementById("max-capacity").textContent;
    document.getElementById("cards").innerHTML = "";

    let capacity = document.createElement("div");
    capacity.id = "max-capacity";
    capacity.textContent = text;
    document.getElementById("cards").appendChild(capacity);
}

function resetPlugins() {
    document.getElementById("plugins").innerHTML = "";
}

let selected = null;
let selectedTimeout = null;
function selectCard(div, item) {
    if (selectingAttack) return;

    if (selected !== null) {
        if (div === selected) {
            useCard(div, item);
            clearTimeout(selectedTimeout);
            selectedTimeout = null;
            return;
        }
        selected.classList.remove("selected");
    }
    if (selectedTimeout !== null) {
        clearTimeout(selectedTimeout);
        selectedTimeout = null;
    }

    selected = div;
    selected.classList.add("selected");

    selectedTimeout = setTimeout(function() {
        selected.classList.remove("selected");
        selected = null;
        selectedTimeout = null;
    }, 2000);
}

let selectedShop = null;
let selectedShopTimeout = null;
document.selectShopItem = function (div, item) {
    if (selectingAttack) return;

    if (selectedShop !== null) {
        document.getElementById("pointer").remove();
    }
    if (selectedShopTimeout !== null) {
        clearTimeout(selectedShopTimeout);
        selectedShopTimeout = null;
    }

    selectedShop = div;

    let pointer = document.createElement("img");
    pointer.id = "pointer";
    pointer.src = "images/pointer.png"
    selectedShop.prepend(pointer);

    pointer.animate([
        {transform: "rotate(10deg)", opacity: "0%"},
        {transform: "rotate(0deg)", opacity: "100%"},
    ], {
        duration: 200,
        iterations: 1,
        fill: "forwards",
        easing: "cubic-bezier(0.65, 0.05, 0.36, 1)"
    })


    updateClippert(item);
    setPurchase(item);

    selectedShopTimeout = setTimeout(function() {
        document.getElementById("pointer").remove();
        selectedShop = null;
        selectedShopTimeout = null;
        resetPurchase();
        resetClippert();
    }, 5000);
}

document.removeSelections = function () {
    if (selectedShop !== null) {
        document.getElementById("pointer").remove();
        selectedShop = null;
        resetClippert();
        resetPurchase();
    }
    if (selectedShopTimeout !== null) {
        clearTimeout(selectedShopTimeout);
        selectedShopTimeout = null;
    }

    if (selected !== null) {
        selected.classList.remove("selected");
        selected = null;
    }
    if (selectedTimeout !== null) {
        clearTimeout(selectedTimeout);
        selectedTimeout = null;
    }
}

function updateClippert(item) {
    let cardDetails = document.getItemDetails(item);
    if (cardDetails === null) {
        document.getElementById("speech").textContent = "I don't know what this is.";
    } else {
        document.getElementById("speech").textContent = cardDetails.description;
    }

    if (responseCooldown !== null) {
        clearTimeout(responseCooldown);
        responseCooldown = null;
    }
}

function resetClippert() {
    document.getElementById("speech").textContent = "Welcome to my store!"
}

let responseCooldown = null;
function clippertResponse(success) {
    if (responseCooldown !== null) return;
    if (success) {
        document.getElementById("speech").textContent = "Thanks for the purchase!"
    } else {
        document.getElementById("speech").textContent = "You can't purchase this!"
    }

    responseCooldown = setTimeout(function() {
        resetClippert();
        responseCooldown = null;
    }, 5000);
}

function setPurchase(item) {
    document.getElementById("purchase").classList.add("canBuy");
    document.getElementById("purchase").onclick = function () {
        buy(item);
        resetPurchase();
    }
}

function resetPurchase() {
    document.getElementById("purchase").classList.remove("canBuy");
    document.getElementById("purchase").onclick = null;
    if (selectedShop !== null) {
        clearTimeout(selectedShopTimeout);
        selectedShopTimeout = null;
        selectedShop = null;
        document.getElementById("pointer").remove();
    }
}

function useCard(div, item) {
    div.animate([
        {transform: "translateY(-20px)", opacity: "100%", width: "250px"},
        {transform: "translateY(-100px)", opacity: "0%", width: "0"},
    ], {
        duration: 200,
        iterations: 1,
        fill: "forwards",
        easing: "cubic-bezier(0.65, 0.05, 0.36, 1)"
    })

    setTimeout(function () {
        div.remove();
        use(item);
    }, 200)
}

let cooldown = null;
function startCooldown() {
    if (cooldown !== null) return;
    current.cooldown = true;

    updateBackground();

    cooldown = setTimeout(function() {
        endCooldown();
    }, 10000);
}

function endCooldown() {
    if (cooldown === null) return;
    current.cooldown = false;
    cooldown = null;

    clearTimeout(cooldown);
    updateBackground();
}

document.toggleBulb = function () {
    if (current.answered || current.cooldown || !bulbScreen) return;
    current.toggled = !current.toggled;
    updateBackground();
    document.socket.emit('bulb-toggle', {code: lobbyCode, playerName: playerName})
}

function processEvent(playerName, event) {
    switch (event) {
        case "pockets":
            document.getElementById("max-capacity").textContent = "Max capacity of 9!";
            break;
        case "attacked":
            document.showError(`You have been attacked by ${playerName}!`)
            break;
        case "joinDuringQuestion":
            openBulbScreen();
            break;
        default:
            console.error("Processing unknown event!");
            break;
    }
}

function buy(item) {
    document.socket.emit('buy', {code: lobbyCode, playerName: playerName, item: item});
}

function use(item) {
    document.socket.emit('use', {code: lobbyCode, playerName: playerName, item: item})
}

document.socket.on('lobby-joined', function(data) {
    if (data.success) {
        console.log('Successfully joined lobby');
        lobbyCode = data.code;
        playerName = data.playerName;
        openUserScreen();
    } else {
        console.error('Failed to join lobby:', data.message);
        document.showError("Failed to join lobby: " + data.message)
    }
});

document.socket.on('start-question', function(data) {
    openBulbScreen();
})

document.socket.on('end-question', function(data) {
    hideBulbScreen();
})

document.socket.on('update-player', function(data) {
    const { money, items } = data;
    current.money = money;
    current.items = items;

    document.getElementById("money").textContent = "$"+current.money;

    displayAllItems(items);

    console.log("Updated!")
});

document.socket.on('mark-player', function(data) {
    const { correct } = data;
    current.toggled = false;
    if (correct) {
        current.answered = true;
    } else {
        startCooldown();
    }

    updateBackground();
    console.log("Marked!")
});

document.socket.on('buy-response', function(data) {
    if (data.success) {
        console.log("Successful purchase of item", data.item);
        clippertResponse(true);
    } else {
        console.error("Failed to buy item:", data.message);
        clippertResponse(false);
    }
})

document.socket.on('use-response', function(data) {
    if (data.success) {
        console.log("Successful use of item", data.item);
    } else {
        console.error("Failed to use item:", data.message);
        document.showError("Failed to use item: " + data.message)
    }
})

document.socket.on('event', function(data) {
    processEvent(data.playerName, data.event)
})

document.socket.on('request-target', function(data) {
    console.log(`Target request!`);
    let players = data.players;
    showAttackSelection(players);
})

document.socket.on('disconnect-lobby', function(data) {
    location.reload();
})