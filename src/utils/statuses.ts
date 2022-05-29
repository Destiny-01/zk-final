export type CharStatus = 'absent' | 'present' | 'correct'

export type CharValue =
  | '1'
  | '2'
  | '3'
  | '4'
  | '5'
  | '6'
  | '7'
  | '8'
  | '9'
  | '0'

export type KeyValue = CharValue | 'ENTER' | 'DELETE'

export const getStatuses = (
  guesses: string[],
  solution: string
): { [key: string]: CharStatus } => {
  const charObj: { [key: string]: CharStatus } = {}

  guesses.forEach((word) => {
    word.split('').forEach((letter, i) => {
      if (!solution.includes(letter)) {
        return (charObj[letter] = 'absent')
      }

      if (letter === solution[i]) {
        return (charObj[letter] = 'correct')
      }

      if (charObj[letter] !== 'correct') {
        return (charObj[letter] = 'present')
      }
    })
  })

  return charObj
}

export const getGuessStatuses = (result: any[]): any => {
  const statuses: CharStatus[] = Array.from(Array(result.length))

  result.forEach((soln) => {
    const solnMap = soln.split('')
    switch (solnMap[0]) {
      case '3':
        statuses[solnMap[1]] = 'correct'
        break
      case '4':
        statuses[solnMap[1]] = 'present'
        break
      case '5':
        statuses[solnMap[1]] = 'absent'
        break
    }
  })

  return statuses
}
