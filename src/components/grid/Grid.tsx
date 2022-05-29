import { useState, useEffect } from 'react'
import { useLocation } from 'react-router-dom'
import { Alert } from '../alerts/Alert'
import { GuessModal } from '../modals/GuessModal'
import { Cell } from './Cell'
import { CompletedRow } from './CompletedRow'
import { CurrentRow } from './CurrentRow'
import { EmptyRow } from './EmptyRow'

type Props = {
  allGuesses: string[]
  socket: any
  currentGuess: string
  player: string
  solution: any
  isTurn: boolean
  status: any
}

export const Grid = ({
  player,
  allGuesses,
  socket,
  currentGuess,
  solution,
  isTurn,
  status,
}: Props) => {
  const [isGameStarted, setIsGameStarted] = useState(false)
  const [isGuessing, setIsGuessing] = useState(false)
  const [isError, setIsError] = useState(false)

  useEffect(() => {
    socket.on('startGame', () => {
      setIsGameStarted(true)
    })

    socket.on('guessing', () => {
      setIsGuessing(true)
    })

    socket.on('error', () => {
      setIsGuessing(false)
      setIsError(true)
    })

    socket.on('done', () => setIsGuessing(false))
  }, [status, socket, isGuessing])

  const guesses = allGuesses.filter((i, a, e) => e.indexOf(i) === a)
  useEffect(() => {
    guesses.length === 5 && socket.emit('draw')
  }, [socket, guesses.length])

  const search = useLocation().search
  const gameCode = new URLSearchParams(search).get('room_id')
  const empties =
    guesses.length < 5 ? Array.from(Array(4 - guesses.length)) : []

  return (
    <div className="pb-6 mx-5">
      <Alert
        isOpen={isError}
        message="Something went wrong while guessing. Hope no one tried anything funny"
      />
      <h1 className="pb-2 text-2xs font-bold">{player} Guesses</h1>
      <GuessModal isOpen={isGuessing} isTurn={isTurn} />
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
        <CompletedRow key={i} guess={guess} status={status && status[i]} />
      ))}
      {guesses.length < 5 && <CurrentRow guess={currentGuess} />}
      {empties.map((_, i) => (
        <EmptyRow key={i} />
      ))}
    </div>
  )
}
