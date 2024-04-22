document.socket = io({
    transports: ['websocket']
});

document.createServer = function () {
    document.socket.emit('create-lobby', {});
}

let interval = null;
document.showError = function (message) {
    if (interval !== null) clearInterval(interval);
    document.getElementById("errorBox").style.display = "inline-block";
    document.getElementById("errorBox").textContent = message;

    interval = setTimeout(function() {
        document.getElementById("errorBox").style.display = "one";
    }, 5000);
}

document.joinLobby = function() {
    const lobbyCode = document.getElementById('lobbyCode').value;
    const playerName = document.getElementById('playerName').value;

    document.socket.emit('join-lobby', { code: lobbyCode, playerName: playerName });
    window.scrollTo(0, 0);
}