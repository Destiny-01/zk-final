import { useState } from 'react'
import { CompletedRow } from './CompletedRow'
import { CurrentRow } from './CurrentRow'
import { EmptyRow } from './EmptyRow'

type Props = {
  guesses: string[]
  socket: any
  currentGuess: string
  player: string
}

export const Grid = ({ player, guesses, socket, currentGuess }: Props) => {
  const [isGameStarted, setIsGameStarted] = useState(false)

  socket.on('startGame', () => {
    console.log('dataaaaaaaa')
    setIsGameStarted(true)
  })

  const empties =
    guesses.length < 5 ? Array.from(Array(4 - guesses.length)) : []

  return (
    <div className="pb-6 mx-5">
      <h1 className="pb-2">{player} Guess</h1>
      <div className="wait">
        {!isGameStarted && 'Waiting for opponent to join'}
      </div>
      {guesses.map((guess, i) => (
        <CompletedRow key={i} guess={guess} />
      ))}
      {guesses.length < 5 && <CurrentRow guess={currentGuess} />}
      {empties.map((_, i) => (
        <EmptyRow key={i} />
      ))}
    </div>
  )
}
