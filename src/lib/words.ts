export const isWinningWord = (word: string) => {
  return solution === word
}

export const makeid = () => {
  const solution = []
  while (solution.length < 4) {
    const r = Math.floor(Math.random() * 10)
    if (solution.indexOf(r) === -1) solution.push(r)
  }
  return solution.join('')
}

export const solution = makeid()
