const app = require("http").createServer();

const { groth16 } = require("snarkjs");
const io = require("socket.io")(app, {
  cors: {
    origin: "http://localhost:3000",
    methods: ["GET", "POST"],
    // credentials: true,
  },
});
const { initGame } = require("./game");

const state = {};
const clientRooms = {};

io.on("connection", (client) => {
  console.log(client.id, "inittttt");
  //   client.on("keydown", handleKeyDown);
  client.on("newGame", handleNewGame);
  client.on("guess", handleGuess);
  // client.on("getGame", handleGetGame);
  // client.on("startGame", handleStartGame);
  client.on("joinGame", handleJoinGame);

  function handleNewGame(roomName, input) {
    clientRooms[client.id] = roomName;
    state[roomName] = initGame(input);

    client.join(roomName);
    client.number = 1;
    client.emit("init", 1);
    console.log(client.id, "233");
  }

  function handleJoinGame(gameCode, guess) {
    const room = io.sockets.adapter.rooms.get(gameCode);
    const numClients = room ? room.size : 0;

    if (numClients === 0) {
      client.emit("unknownGame");
      return;
    } else if (numClients > 1) {
      client.emit("tooManyPlayers");
      return;
    }

    clientRooms[client.id] = gameCode;

    client.join(gameCode);
    state[gameCode].players[1].solution = guess;
    console.log(client.id, "234", room);
    io.in(gameCode).emit("startGame");
    client.number = 2;
    client.emit("init", 2);

    startGameInterval(gameCode);
  }

  function handleGuess(guess, gameCode) {
    const solution = state[gameCode].players[(client.number + 2) % 2].solution;

    if (solution === guess) {
      client.emit("wonGame");
      client.broadcast.emit("lostGame");
    }

    client.broadcast.emit("guess", guess);
  }

  function handleGetGame(roomName) {
    const room = io.sockets.adapter.rooms.get(roomName);
    if (room) {
      return client.emit("unknownGame");
    }
    client.join(roomName);
  }
});

function startGameInterval(roomName) {
  // io.sockets.in(roomName).emit("startGame");
  // setTimeout(() => {
  // const intervalId = setInterval(() => {
  // const winner = gameLoop(state[roomName]);
  // if (!winner) {
  //   emitGameState(roomName, state[roomName]);
  // } else {
  //   emitGameOver(roomName, winner);
  // state[roomName] = null;
  // clearInterval(intervalId);
  // }
  // }, 1000 / FRAME_RATE);
  // }, 7000);
}

function emitGameState(roomName, state) {
  io.sockets.in(roomName).emit("gameState", JSON.stringify(state));
}

function emitGameOver(roomName, winner) {
  io.sockets.in(roomName).emit("gameOver", JSON.stringify({ winner }));
}

app.listen(process.env.PORT || 8000, () => {
  console.log("server up");
});
