const app = require("http").createServer();

const snarkjs = require("snarkjs");
const { buildPoseidon } = require("circomlibjs");
const io = require("socket.io")(app, {
  cors: {
    origin: [
      "https://dead-target.netlify.app",
      "https://dead-target-testnet.netlify.app",
      "http://localhost:3000",
    ],
    methods: ["GET", "POST"],
    credentials: true,
  },
});
const { initGame } = require("./game");
const { BigNumber, ethers } = require("ethers");

const state = {};
const clientRooms = {};

io.on("connection", (client) => {
  console.log(client.id, "inittttt");
  client.on("newGame", handleNewGame);
  client.on("guess", handleGuess);
  client.on("turn", turn);
  client.on("draw", draw);
  client.on("verify", verify);
  client.on("hash1", hashSol1);
  client.on("hash2", hashSol2);
  client.on("joinGame", handleJoinGame);

  function handleNewGame(roomName, input, hash, salt) {
    clientRooms[client.id] = roomName;
    state[roomName] = initGame(input, hash, salt);

    client.join(roomName);
    client.number = 1;
    client.roomName = roomName;
    client.emit("init", input, 1);
  }

  async function hashSol1(input) {
    const poseidonHash = await buildPoseidon();
    const salt = ethers.utils.randomBytes(16).join("2");
    const hash = BigNumber.from(
      poseidonHash.F.toString(poseidonHash([...input, salt]))
    );

    client.emit("hash1", hash.toString(), salt);
  }

  async function hashSol2(input, gameCode) {
    if (state[gameCode].active) {
      return;
    }
    const room = io.sockets.adapter.rooms.get(gameCode);
    const numClients = room ? room.size : 0;
    if (numClients !== 1) {
      client.emit("unknownGame");
      return;
    }
    const poseidonHash = await buildPoseidon();
    const salt = ethers.utils.randomBytes(16).join("2");
    const hash = BigNumber.from(
      poseidonHash.F.toString(poseidonHash([...input, salt]))
    );

    client.emit("hash2", hash.toString(), salt);
  }

  function handleJoinGame(gameCode, guess, hash, salt) {
    console.log(client.id, "234");

    clientRooms[client.id] = gameCode;
    state[gameCode].players[1].solution = guess;
    state[gameCode].players[1].hash = hash;
    state[gameCode].players[1].salt = salt;
    state[gameCode].active = true;

    client.number = 2;
    client.join(gameCode);
    client.roomName = gameCode;
    client.emit("init", guess, 2);
    io.in(gameCode).emit("startGame");
  }

  async function handleGuess(guess, gameCode) {
    if (!state[gameCode].active) {
      return;
    }
    try {
      if (client.number !== state[gameCode].turn) {
        state[gameCode].turn == 1
          ? (state[gameCode].turn = 2)
          : (state[gameCode].turn = 1);
        return;
      }
      if (guess.length !== 4) {
        return;
      }
      io.in(gameCode).emit("guessing");
      const otherPlayer = state[gameCode].players[(client.number + 2) % 2];
      const guessArr = String(guess)
        .split("")
        .map((currentGuess) => {
          return Number(currentGuess);
        });
      const solutionArr = String(otherPlayer.solution)
        .split("")
        .map((currentGuess) => {
          return Number(currentGuess);
        });
      const hash = BigNumber.from(otherPlayer.hash);

      const { proof, publicSignals } = await snarkjs.groth16.fullProve(
        {
          guess: guessArr,
          solution: solutionArr,
          saltedSolution: otherPlayer.salt,
          hashedSolution: hash,
        },
        "src/Dead.wasm",
        "src/test_0001.zkey"
      );
      const editedPublicSignals = unstringifyBigInts(publicSignals);
      const editedProof = unstringifyBigInts(proof);
      const calldat = await snarkjs.groth16.exportSolidityCallData(
        editedProof,
        editedPublicSignals
      );

      const calldata = calldat
        .replace(/["[\]\s]/g, "")
        .split(",")
        .map((x) => BigInt(x).toString());
      const input = [
        [calldata[0], calldata[1]],
        [
          [calldata[2], calldata[3]],
          [calldata[4], calldata[5]],
        ],
        [calldata[6], calldata[7]],
        calldata.splice(8),
      ];
      const result = publicSignals.filter((signal) => signal.length === 2);
      const response = calc(result);
      console.log(response, "jfkfk");
      client.emit("calldata", input, response);
    } catch (err) {
      io.in(gameCode).emit("error");
      console.log(err.code);
      console.log(err);
    }
  }

  function verify(guess, response) {
    try {
      const oppSolution =
        state[client.roomName].players[(client.number + 2) % 2].solution;
      const solution =
        state[client.roomName].players[client.number - 1].solution;
      console.log(guess, oppSolution, client.number, "lllll");

      client.emit("yourGuess", guess, response);
      client.broadcast.emit("guess", guess, response);

      if (oppSolution === guess) {
        client.emit("wonGame");
        client.broadcast.emit("lostGame", solution);
        state[client.roomName].active = false;
      }

      io.in(client.roomName).emit("done", state[client.roomName].turn);
    } catch (err) {
      console.log(err);
    }
  }

  function draw() {
    const oppSolution =
      state[client.roomName].players[(client.number + 2) % 2].solution;
    const solution = state[client.roomName].players[client.number - 1].solution;
    client.emit("lostGame", oppSolution);
    client.broadcast.emit("lostGame", solution);
  }

  function turn() {
    console.log(state[client.roomName].turn, turn, "tuutuu");
    state[client.roomName].turn == 1
      ? (state[client.roomName].turn = 2)
      : (state[client.roomName].turn = 1);
    io.in(client.roomName).emit("turn", state[client.roomName].turn);
  }
});

function calc(result) {
  let response = [];
  const solution = [];
  const arr = ["0", "1", "2", "3"];

  if (result.length < 1) {
    return (response = ["50", "51", "52", "53"]);
  }
  if (result.length === 4) {
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

function unstringifyBigInts(o) {
  if (typeof o == "string" && /^[0-9]+$/.test(o)) {
    return BigInt(o);
  } else if (typeof o == "string" && /^0x[0-9a-fA-F]+$/.test(o)) {
    return BigInt(o);
  } else if (Array.isArray(o)) {
    return o.map(unstringifyBigInts);
  } else if (typeof o == "object") {
    if (o === null) return null;
    const res = {};
    const keys = Object.keys(o);
    keys.forEach((k) => {
      res[k] = unstringifyBigInts(o[k]);
    });
    return res;
  } else {
    return o;
  }
}

app.listen(process.env.PORT || 8000, () => {
  console.log("server up");
});
