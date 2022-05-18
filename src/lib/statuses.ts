// import { solution } from './words'

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

// export const getGuessStatuses = (
//   result: any[]
//   // solution: string
// ): any => {
//   while (result.length < 4) {
//     result.push('0')
//   }

//   const statuses: CharStatus[] = Array.from(Array(result.length))
//   // const arr: any[] = []
//   result.forEach((soln, i) => {
//     if (soln.length < 2) {
//       statuses[i] = 'absent'
//       return
//     }

//     const solnMap = soln.split('')

//     if (solnMap[0] === '3') {
//       statuses[solnMap[1]] = 'correct'
//       // arr.push(solnMap[1])
//       return
//     }
//     if (solnMap[0] === '4') {
//       // arr.push(solnMap[1])
//       statuses[solnMap[1]] = 'present'
//       return
//     }
//   })

//   return statuses
// }

// export const getGuessStatuses = (guess: string): CharStatus[] => {
//   const splitSolution = solution.split('')
//   const splitGuess = guess.split('')

//   const solutionCharsTaken = splitSolution.map((_) => false)

//   const statuses: CharStatus[] = Array.from(Array(guess.length))

//   // handle all correct cases first
//   splitGuess.forEach((letter, i) => {
//     if (letter === splitSolution[i]) {
//       statuses[i] = 'correct'
//       solutionCharsTaken[i] = true
//       return
//     }
//   })

//   splitGuess.forEach((letter, i) => {
//     if (statuses[i]) return

//     if (!splitSolution.includes(letter)) {
//       // handles the absent case
//       statuses[i] = 'absent'
//       return
//     }

//     // now we are left with "present"s
//     const indexOfPresentChar = splitSolution.findIndex(
//       (x, index) => x === letter && !solutionCharsTaken[index]
//     )

//     if (indexOfPresentChar > -1) {
//       statuses[i] = 'present'
//       solutionCharsTaken[indexOfPresentChar] = true
//       return
//     } else {
//       statuses[i] = 'absent'
//       return
//     }
//   })

//   return statuses
// }
