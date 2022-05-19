const app = require("http").createServer();

const snarkjs = require("snarkjs");
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
  client.on("ready", handleReady);
  // client.on("getGame", handleGetGame);
  // client.on("startGame", handleStartGame);
  client.on("joinGame", handleJoinGame);

  function handleNewGame(roomName, input) {
    clientRooms[client.id] = roomName;
    state[roomName] = initGame(input);

    client.join(roomName);
    client.number = 1;
    client.roomName = roomName;
    client.emit("init", input, 1);
  }

  function handleReady() {
    state[client.roomName].players[client.number - 1].ready = true;
    console.log(
      state[client.roomName].players[(client.number + 2) % 2].ready &&
        state[client.roomName].players[client.number - 1].ready
    );
    // state[roomName].players[(client.number + 2) % 2].ready &&
    // state[roomName].players[client.number - 1].ready
    //   ? startTimer
    //   : "";
  }

  function handleJoinGame(gameCode, guess) {
    const room = io.sockets.adapter.rooms.get(gameCode);
    const numClients = room ? room.size : 0;

    if (numClients === 0) {
      console.log("booo");
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
    client.roomName = gameCode;
    client.emit("init", guess, 2);

    startGameInterval(gameCode);
  }

  async function handleGuess(guess, gameCode) {
    if (client.number != state[gameCode].turn) {
      return state[gameCode].turn == 1
        ? (state[gameCode].turn = 2)
        : (state[gameCode].turn = 1);
    }
    io.in(gameCode).emit("guessing");
    const guessArr = String(guess)
      .split("")
      .map((currentGuess) => {
        return Number(currentGuess);
      });
    const solution = state[gameCode].players[(client.number + 2) % 2].solution;
    const solutionArr = String(solution)
      .split("")
      .map((currentGuess) => {
        return Number(currentGuess);
      });
    const { proof, publicSignals } = await snarkjs.groth16.fullProve(
      { guess: guessArr, solution: solutionArr },
      "test.wasm",
      "test_0001.zkey"
    );
    const calldata = await snarkjs.groth16.exportSolidityCallData(
      proof,
      publicSignals
    );
    const input = JSON.parse("[" + calldata + "]");
    const result = publicSignals.filter((signal) => signal.length > 1);
    const response = calc(result);

    client.emit("yourGuess", guess, response);
    client.broadcast.emit("guess", guess, response);

    state[gameCode].turn == 1
      ? (state[gameCode].turn = 2)
      : (state[gameCode].turn = 1);
    io.in(gameCode).emit("turn", state[gameCode].turn);

    if (solution == guess) {
      client.emit("wonGame");
      client.broadcast.emit("lostGame", solution);
    }
  }

  function calc(result) {
    let response = [];
    const solution = [];
    const arr = ["0", "1", "2", "3"];

    if (result.length < 1) {
      return (response = ["50", "51", "52", "53"]);
    }
    if (result.length == 4) {
      return (response = result);
    }

    result.forEach((soln) => {
      if (response.length < 5) {
        response.push(soln);
        const solnMap = soln.split("");
        solution.push(solnMap[1]);
      }
    });
    const filter = arr.filter((x) => !solution.includes(x));
    filter.forEach((fil) => response.length < 5 && response.push("5" + fil));

    return response;
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
