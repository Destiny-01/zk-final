function initGame(solution, hash, salt) {
  return {
    players: [
      {
        guesses: [],
        solution,
        hash,
        salt,
      },
      {
        guesses: [],
        solution: "",
        hash: "",
        salt: "",
      },
    ],
    turn: 1,
    active: false,
  };
}

module.exports = { initGame };
