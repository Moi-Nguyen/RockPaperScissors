const express = require('express');
const http = require('http');
const socketIo = require('socket.io');
const cors = require('cors');

const app = express();
const server = http.createServer(app);

// CORS configuration
app.use(
    cors({
        origin: 'http://localhost:5173',
        methods: ['GET', 'POST'],
        credentials: true
    })
);

const io = socketIo(server, {
    cors: {
        origin: 'http://localhost:5173',
        methods: ['GET', 'POST'],
        credentials: true
    }
});

function determineWinner(choice1, choice2) {
    if (choice1 === choice2) return 'tie';

    const winConditions = {
        rock: 'scissors',
        paper: 'rock',
        scissors: 'paper'
    };

    return winConditions[choice1] === choice2 ? 'player1' : 'player2';
}

function initializeGameState() {
    return {
        round: 1,
        scores: { player1: 0, player2: 0 },
        phase: 'choosing',
        choices: {},
        timer: 30,
        gameOver: false,
        winner: null
    };
}

function startRoundTimer(roomCode) {
    const room = rooms.get(roomCode);
    if (!room) return;

    const timer = setInterval(() => {
        room.gameState.timer--;

        io.to(roomCode).emit('timer-update', {
            timeLeft: room.gameState.timer
        });

        if (room.gameState.timer <= 0) {
            clearInterval(timer);
            handleTimeOut(roomCode);
        }
    }, 1000);

    room.gameState.timerInterval = timer;
}

function handleTimeOut(roomCode) {
    const room = rooms.get(roomCode);
    if (!room) return;

    // Auto-assign random choices for players who didn't choose
    const randomChoices = ['rock', 'paper', 'scissors'];

    room.players.forEach(player => {
        if (!room.gameState.choices[player.id]) {
            const randomChoice = randomChoices[Math.floor(Math.random() * 3)];
            room.gameState.choices[player.id] = {
                choice: randomChoice,
                playerIndex: room.players.findIndex(p => p.id === player.id)
            };
        }
    });

    processRoundResult(roomCode);
}

function processRoundResult(roomCode) {
    const room = rooms.get(roomCode);
    if (!room) return;

    const choices = room.gameState.choices;
    const playerIds = Object.keys(choices);

    if (playerIds.length !== 2) return;

    const choice1 = choices[playerIds[0]].choice;
    const choice2 = choices[playerIds[1]].choice;

    const result = determineWinner(choice1, choice2);

    // Update scores
    if (result === 'player1') {
        room.gameState.scores.player1++;
    } else if (result === 'player2') {
        room.gameState.scores.player2++;
    }

    // Check for game over
    const maxScore = Math.max(
        room.gameState.scores.player1,
        room.gameState.scores.player2
    );
    if (maxScore >= 3) {
        room.gameState.gameOver = true;
        room.gameState.winner =
            room.gameState.scores.player1 >= 3
                ? room.players[0].name
                : room.players[1].name;
    }

    room.gameState.phase = 'result';

    // Clear timer if exists
    if (room.gameState.timerInterval) {
        clearInterval(room.gameState.timerInterval);
    }

    io.to(roomCode).emit('round-result', {
        result:
            result === 'tie'
                ? 'Hòa!'
                : result === 'player1'
                ? `${room.players[0].name} thắng!`
                : `${room.players[1].name} thắng!`,
        choices: choices,
scores: room.gameState.scores,
        round: room.gameState.round,
        gameOver: room.gameState.gameOver,
        winner: room.gameState.winner
    });
}

// Add to socket handlers:
/////


io.on('connection', socket => {
    console.log('New client connected:', socket.id);

    socket.emit('connected', { message: 'Connected to server successfully!' });

    // Handle room creation
    socket.on('create-room', ({ roomCode, playerName }) => {
        console.log(`🏠 Creating room: ${roomCode} for ${playerName}`);

        // Check if room already exists
        if (rooms.has(roomCode)) {
            socket.emit('room-error', {
                message: 'Room already exists! Try another code.'
            });
            return;
        }

        // Create new room
        const room = {
            code: roomCode,
            players: [{ id: socket.id, name: playerName }],
            ownerId: socket.id,
            gameStarted: false,
            gameState: null
        };

        rooms.set(roomCode, room);
        players.set(socket.id, { name: playerName, roomCode });

        socket.join(roomCode);
        socket.emit('room-created', {
            roomCode,
            playerName,
            isOwner: true
        });

        console.log(`✅ Room ${roomCode} created successfully`);
    });

    // Handle room joining
    socket.on('join-room', ({ roomCode, playerName }) => {
        console.log(`👤 ${playerName} trying to join room: ${roomCode}`);

        const room = rooms.get(roomCode);
        if (!room) {
            socket.emit('room-error', { message: 'Room not found!' });
            return;
        }

        if (room.players.length >= 2) {
            socket.emit('room-error', { message: 'Room is full!' });
            return;
        }

        // Check for duplicate names
        if (room.players.some(p => p.name === playerName)) {
            socket.emit('room-error', {
                message: 'Name already taken in this room!'
            });
            return;
        }

        // Add player to room
        room.players.push({ id: socket.id, name: playerName });
        players.set(socket.id, { name: playerName, roomCode });

        socket.join(roomCode);

        // Notify all players in room
        io.to(roomCode).emit('player-joined', {
            players: room.players,
            ownerId: room.ownerId,
            gameStarted: room.gameStarted
        });

        console.log(`✅ ${playerName} joined room ${roomCode}`);
    });

    // Start game
    socket.on('start-game', ({ roomCode }) => {
        const room = rooms.get(roomCode);
        if (!room || room.ownerId !== socket.id || room.players.length !== 2) {
            socket.emit('game-error', { message: 'Cannot start game!' });
            return;
        }

        room.gameStarted = true;
        room.gameState = initializeGameState();

        io.to(roomCode).emit('game-started', {
            message: 'Game started!',
            gameState: room.gameState
        });

        startRoundTimer(roomCode);
    });

    // Player choice
    socket.on('player-choice', ({ roomCode, choice }) => {
        const room = rooms.get(roomCode);
        if (!room || !room.gameStarted) return;

        const playerIndex = room.players.findIndex(p => p.id === socket.id);
        if (playerIndex === -1) return;

        room.gameState.choices[socket.id] = { choice, playerIndex };

        io.to(roomCode).emit('choice-made', {
            playerId: socket.id,
            choicesCount: Object.keys(room.gameState.choices).length
        });

        // Check if both players made choices
        if (Object.keys(room.gameState.choices).length === 2) {
            clearInterval(room.gameState.timerInterval);
            processRoundResult(roomCode);
        }
    });

    // Next round
    socket.on('next-round', ({ roomCode }) => {
        const room = rooms.get(roomCode);
        if (!room || !room.gameStarted || room.gameState.gameOver) return;

        // Reset for next round
        room.gameState.round++;
        room.gameState.choices = {};
        room.gameState.timer = 30;
        room.gameState.phase = 'choosing';

        io.to(roomCode).emit('next-round-started', {
            round: room.gameState.round,
            timer: room.gameState.timer
        });

        startRoundTimer(roomCode);
    });
    // Handle disconnect
    socket.on('disconnect', () => {
        console.log('User disconnected:', socket.id);

        const player = players.get(socket.id);
        if (player && player.roomCode) {
            const room = rooms.get(player.roomCode);
            if (room) {
                room.players = room.players.filter(p => p.id !== socket.id);

                if (room.players.length === 0) {
                    rooms.delete(player.roomCode);
                    console.log(`🗑️ Room ${player.roomCode} deleted (empty)`);
                } else {
                    io.to(player.roomCode).emit('player-left', {
                        roomCode: player.roomCode,
                        players: room.players,
                        leftPlayerName: player.name
                    });
                }
            }
        }
        players.delete(socket.id);
    });
});

// Game state storage
const rooms = new Map();
const players = new Map();

// Basic route
app.get('/', (req, res) => {
    res.send('Rock Paper Scissors Server is running!');
});

// Socket connection handling
io.on('connection', socket => {
    console.log('New client connected:', socket.id);

    socket.emit('connected', {
        message: 'Connected to server successfully!'
    });

    socket.on('disconnect', () => {
        console.log('User disconnected:', socket.id);
    });
});

const PORT = process.env.PORT || 3001;
server.listen(PORT, () => {
    console.log(`🚀 Server running on port ${PORT}`);
});