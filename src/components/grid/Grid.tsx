import { useState, useEffect } from 'react'
import { useLocation } from 'react-router-dom'
import { GuessModal } from '../modals/GuessModal'
import { Cell } from './Cell'
import { CompletedRow } from './CompletedRow'
import { CurrentRow } from './CurrentRow'
import { EmptyRow } from './EmptyRow'

type Props = {
  guesses: string[]
  socket: any
  currentGuess: string
  player: string
  solution: any
  isTurn: boolean
  status: any
}

export const Grid = ({
  player,
  guesses,
  socket,
  currentGuess,
  solution,
  isTurn,
  status,
}: Props) => {
  const [isGameStarted, setIsGameStarted] = useState(false)
  const [isGuessing, setIsGuessing] = useState(false)

  useEffect(() => {
    socket.on('startGame', () => {
      setIsGameStarted(true)
    })

    socket.on('guessing', () => {
      setIsGuessing(true)
    })

    socket.on('result', () => setIsGuessing(false))
  }, [status, socket])

  const search = useLocation().search
  const gameCode = new URLSearchParams(search).get('room_id')
  const empties =
    guesses.length < 5 ? Array.from(Array(4 - guesses.length)) : []

  return (
    <div className="pb-6 mx-5">
      <h1 className="pb-2">{player} Guess</h1>
      <GuessModal
        isOpen={isGuessing}
        isTurn={isTurn}
        handleClose={() => setIsGuessing(false)}
      />
      <div className="wait">
        {!isGameStarted &&
          `Waiting for opponent to join. Share game code: ${gameCode} `}
      </div>
      <div className="flex justify-center mb-1">
        {solution.split('').map((letter: any, i: any) => (
          <Cell key={i} value={letter} />
        ))}
      </div>
      {guesses.map((guess, i) => (
        <CompletedRow
          key={i}
          guess={guess}
          socket={socket}
          status={status && status[i]}
        />
      ))}
      {guesses.length < 5 && <CurrentRow guess={currentGuess} />}
      {empties.map((_, i) => (
        <EmptyRow key={i} />
      ))}
    </div>
  )
}
