const express = require('express');
const http = require('http');
const socketIo = require('socket.io');

const app = express();
const index = http.createServer(app);
const io = socketIo(index, {
    cors: {
        methods: ["GET", "POST"] // Allow only GET and POST requests
    }});

app.use(express.static("public"))

const lobbies = {};
const lobbyHosts = {};

index.listen(process.env.PORT || 8080, () => {
    console.log("Server started on port 8080.")
})

function generateLobbyCode() {
    let code;

    while (true) {
        code = Math.floor(10000 + Math.random() * 90000).toString();
        if (!lobbies[code]) break;
    }
    return code;
}

function checkIfNameExists(lobby, playerName) {
    for (let i = 0; i < lobby.players.length; i++) {
        if (lobby.players[i].name === playerName) {
            return true;
        }
    }
    return false;
}

function getPlayer(lobby, playerName) {
    for (let i = 0; i < lobby.players.length; i++) {
        if (lobby.players[i].name === playerName) {
            return lobby.players[i];
        }
    }
}

function getPlayerNames(lobby) {
    let players = [];
    for (let i = 0; i < lobby.players.length; i++) {
        players.push(lobby.players[i].name);
    }
    return players;
}

function joinLobby(lobby, playerName) {
    io.to(lobby.host).emit('new-user', {playerName: playerName});
}

io.on('connection', (socket) => {
    console.log("User connected.");

    socket.on('create-lobby', () => {
        const lobbyCode = generateLobbyCode();
        lobbies[lobbyCode] = {
            host: socket.id,
            players: []
        }

        lobbyHosts[socket.id] = lobbyCode;

        console.log("New lobby with host " + socket.id);
        socket.emit('lobby-created', {code: lobbyCode});
    })

    socket.on('join-lobby', (data) => {
        const { code, playerName } = data;
        if (lobbies[code]) {
            if (checkIfNameExists(lobbies[code], playerName)) {
                socket.emit('lobby-joined', { success: false, message: 'Name already exists'});
            } else if (playerName.length > 20 || playerName.length === 0) {
                socket.emit('lobby-joined', { success: false, message: 'Invalid name!'});
            }
            else {
                lobbies[code].players.push(
                    {
                        name: playerName,
                        id: socket.id
                    }
                );
                socket.emit('lobby-joined', { success: true, code: code, playerName: playerName });
                joinLobby(lobbies[code], playerName);
            }

        } else {
            socket.emit('lobby-joined', { success: false, message: 'Lobby not found'});
        }
    })

    socket.on('disconnect', () => {
        if (lobbyHosts[socket.id]) {
            let code = lobbyHosts[socket.id];
            let lobby = lobbies[code];

            for (let i = 0; i < lobby.players.length; i++) {
                io.to(lobby.players[i].id).emit('disconnect-lobby', {});
            }

            delete lobbies[code];
            console.log("Shut down lobby " + code + "!");
        }
    })

    socket.on('bulb-toggle', (data) => {
        const { code, playerName } = data;
        let lobby = lobbies[code];
        try {
            let player = getPlayer(lobby, playerName);
            if (player !== undefined && player.id === socket.id) {
                io.to(lobby.host).emit('bulb-toggle', { playerName: playerName })
            }
        } catch (e) {
            console.error("Bulb toggle exception: " + e);
        }
    })

    socket.on('update-player', (data) => {
        const { code, playerName, money, items } = data;
        let lobby = lobbies[code];
        try {
            let player = getPlayer(lobby, playerName);
            if (player !== undefined && socket.id === lobby.host) {
                io.to(player.id).emit('update-player', {money: money, items: items});
            }
        } catch (e) {
            console.error("Cannot update player: " + e);
        }
    })

    socket.on('start-question', (data) => {
        const { code } = data;
        let lobby = lobbies[code];
        try {
            if (socket.id === lobby.host) {
                for (let i = 0; i < lobby.players.length; i++) {
                    io.to(lobby.players[i].id).emit('start-question', {});
                }
            }
        } catch (e) {
            console.error("Cannot start question: " + e);
        }
    })

    socket.on('end-question', (data) => {
        const { code } = data;
        let lobby = lobbies[code];
        try {
            if (socket.id === lobby.host) {
                for (let i = 0; i < lobby.players.length; i++) {
                    io.to(lobby.players[i].id).emit('end-question', {});
                }
            }
        } catch (e) {
            console.error("Cannot end question: " + e);
        }
    })

    socket.on('mark-player', (data) => {
        const { code, playerName, correct } = data;
        let lobby = lobbies[code];
        try {
            let player = getPlayer(lobby, playerName);
            if (player !== undefined && socket.id === lobby.host) {
                io.to(player.id).emit('mark-player', {correct: correct});
            }
        } catch (e) {
            console.error("Cannot mark player: " + e);
        }
    })

    socket.on('buy', (data) => {
        const { code, playerName, item } = data;
        let lobby = lobbies[code];
        try {
            let player = getPlayer(lobby, playerName);
            if (player !== undefined && player.id === socket.id) {
                io.to(lobby.host).emit('buy', { playerName: playerName, item: item });
            }
        } catch (e) {
            console.error("Cannot buy: " + e);
            socket.emit('buy-response', { success: false, message: "Server side error" });
        }
    })

    socket.on('buy-response', (data) => {
        const { code, playerName, item, success, message } = data;
        let lobby = lobbies[code];
        try {
            let player = getPlayer(lobby, playerName);
            if (player !== undefined && socket.id === lobby.host) {
                io.to(player.id).emit('buy-response', { item: item, success: success, message: message });
            }
        } catch (e) {
            console.error("Failure in buy response: " + e);
        }
    })

    socket.on('use', (data) => {
        const { code, playerName, item } = data;
        let lobby = lobbies[code];
        try {
            let player = getPlayer(lobby, playerName);
            if (player !== undefined && player.id === socket.id) {
                io.to(lobby.host).emit('use', { playerName: playerName, item: item });
            }
        } catch (e) {
            console.error("Cannot use: " + e);
            socket.emit('use-response', { success: false, message: "Server side error" });
        }
    })

    socket.on('use-response', (data) => {
        const { code, playerName, item, success, message } = data;
        let lobby = lobbies[code];
        try {
            let player = getPlayer(lobby, playerName);
            if (player !== undefined && socket.id === lobby.host) {
                io.to(player.id).emit('use-response', { item: item, success: success, message: message });
            }
        } catch (e) {
            console.error("Failure in use response: " + e);
        }
    })

    socket.on('event', (data) => {
        const { code, toPlayer, fromPlayer, event } = data;
        let lobby = lobbies[code];
        try {
            let player = getPlayer(lobby, toPlayer);
            if (player !== undefined && socket.id === lobby.host) {
                io.to(player.id).emit('event', { playerName: fromPlayer, event: event });
            }
        } catch (e) {
            console.error("Failure in effect: " + e);
        }
    })

    socket.on('request-target', (data) => {
        const { code, playerName } = data;
        let lobby = lobbies[code];
        try {
            let player = getPlayer(lobby, playerName);
            if (player !== undefined && socket.id === lobby.host) {
                io.to(player.id).emit('request-target', { players: getPlayerNames(lobby) });
            }
        } catch (e) {
            console.error("Failure in target request: " + e);
        }
    })

    socket.on('target', (data) => {
        const { code, playerName, target } = data;
        let lobby = lobbies[code];
        try {
            let player = getPlayer(lobby, playerName);
            if (player !== undefined && player.id === socket.id) {
                io.to(lobby.host).emit('target', { playerName: playerName, target: target });
            }
        } catch (e) {
            console.error("Cannot target: " + e);
        }
    })
})