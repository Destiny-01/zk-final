import { InformationCircleIcon } from '@heroicons/react/outline'
import { useState, useEffect } from 'react'
import { Alert } from './components/alerts/Alert'
import { Grid } from './components/grid/Grid'
import { Keyboard } from './components/keyboard/Keyboard'
import { InfoModal } from './components/modals/InfoModal'
import { WinModal } from './components/modals/WinModal'
import { useHistory, useLocation } from 'react-router-dom'
import { CharStatus, getGuessStatuses } from './lib/statuses'
import { LoseModal } from './components/modals/LoseModal'
import { AboutModal } from './components/modals/AboutModal'

type Props = {
  socket: any
}

function App({ socket }: Props) {
  const [currentGuess, setCurrentGuess] = useState('')
  const [solution, setSolution] = useState('')
  const [isGameWon, setIsGameWon] = useState(false)
  const [isWinModalOpen, setIsWinModalOpen] = useState(false)
  const [isLoseModalOpen, setIsLoseModalOpen] = useState(false)
  const [isGameEnded, setIsGameEnded] = useState(false)
  const [isAboutModalOpen, setAboutModalOpen] = useState(false)
  const [isInfoModalOpen, setIsInfoModalOpen] = useState(false)
  const [isWordNotFoundAlertOpen, setIsWordNotFoundAlertOpen] = useState(false)
  const [turn, setTurn] = useState(1)
  const [isGameLost, setIsGameLost] = useState('')
  const [myGuesses, setMyGuesses] = useState<string[]>([])
  const [opponentGuesses, setOpponentGuesses] = useState<string[]>([])
  const [myStatus, setMyStatus] = useState<CharStatus[]>([])
  const [opponentStatus, setOpponentStatus] = useState<CharStatus[]>([])

  const search = useLocation().search
  const gameCode = new URLSearchParams(search).get('room_id')
  const history = useHistory()
  let isTurn: boolean = turn === Number(localStorage.getItem('item'))

  useEffect(() => {
    if (isGameWon) {
      setIsWinModalOpen(true)
    }
  }, [isGameWon])

  useEffect(() => {
    setIsInfoModalOpen(true)
  }, [])

  const onChar = (value: string) => {
    if (currentGuess.length < 4 && myGuesses.length < 6 && !isGameEnded) {
      setCurrentGuess(`${currentGuess}${value}`)
    }
  }

  const onDelete = () => {
    setCurrentGuess(currentGuess.slice(0, -1))
  }

  useEffect(() => {
    socket.on('yourGuess', (guess: any, result: any) => {
      const status = getGuessStatuses(result)
      setMyGuesses([...myGuesses, guess])
      setMyStatus([...myStatus, status])
    })

    socket.on('guess', (guess: any, result: any) => {
      const status = getGuessStatuses(result)
      setOpponentStatus([...opponentStatus, status])
      setOpponentGuesses([...opponentGuesses, guess])
    })

    socket.on('turn', (num: number) => setTurn(num))
    socket.on('init', (sol: string, num: number) => setSolution(sol))
    socket.on('wonGame', () => {
      setIsGameWon(true)
      setIsWinModalOpen(true)
      setIsGameEnded(true)
    })
    socket.on('lostGame', (solution: string) => {
      setIsGameEnded(true)
      setIsLoseModalOpen(true)
      setIsGameLost(solution)
    })
  }, [
    turn,
    myGuesses,
    myStatus,
    opponentGuesses,
    opponentStatus,
    socket,
    solution,
  ])

  const onEnter = () => {
    const guessArr = String(currentGuess)
      .split('')
      .map((currentGuess) => {
        return Number(currentGuess)
      })
    if (
      currentGuess.length !== 4 ||
      !guessArr.every((e, i, a) => a.indexOf(e) === i)
    ) {
      setIsWordNotFoundAlertOpen(true)
      return setTimeout(() => {
        setIsWordNotFoundAlertOpen(false)
      }, 3000)
    }

    if (currentGuess.length === 4 && myGuesses.length < 6 && !isGameEnded) {
      socket.emit('guess', currentGuess, gameCode)
      setCurrentGuess('')
    }
  }

  return (
    <div className="py-8 max-w-7xl mx-auto sm:px-6 lg:px-8">
      <Alert
        message="Please input a non repeating 4 digit number"
        isOpen={isWordNotFoundAlertOpen}
      />
      <div className="flex w-80 mx-auto items-center mb-8">
        <h1 className="text-xl grow font-bold">Primel</h1>
        <InformationCircleIcon
          className="h-6 w-6 cursor-pointer"
          onClick={() => setIsInfoModalOpen(true)}
        />
      </div>
      <div className="flex justify-center mb-1">
        <Grid
          player="My"
          guesses={myGuesses}
          currentGuess={currentGuess}
          socket={socket}
          solution={''}
          isTurn={isTurn}
          status={myStatus}
        />
        <Grid
          status={opponentStatus}
          isTurn={isTurn}
          player="Opponent"
          guesses={opponentGuesses}
          currentGuess={''}
          socket={socket}
          solution={solution}
        />
      </div>
      {isGameEnded ? (
        <button
          type="button"
          onClick={() => history.push('/')}
          className="w-full items-center mt-2 py-3 border border-transparent text-sm font-medium rounded text-white bg-indigo-700 hover:bg-indigo-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
        >
          End Game and Go Home
        </button>
      ) : (
        <Keyboard
          solution={solution}
          onChar={onChar}
          onDelete={onDelete}
          onEnter={onEnter}
          guesses={myGuesses}
          isTurn={isTurn}
        />
      )}
      <WinModal
        isOpen={isWinModalOpen}
        handleClose={() => setIsWinModalOpen(false)}
      />
      <LoseModal
        isOpen={isLoseModalOpen}
        solution={isGameLost}
        handleClose={() => setIsLoseModalOpen(false)}
      />
      <InfoModal
        isOpen={isInfoModalOpen}
        socket={socket}
        handleClose={() => setIsInfoModalOpen(false)}
      />
      <AboutModal
        isOpen={isAboutModalOpen}
        handleClose={() => setAboutModalOpen(false)}
      />
      <button
        type="button"
        // className="mx-auto mt-8 flex items-center px-2.5 py-1.5 border border-transparent text-xs font-medium rounded text-indigo-700 bg-indigo-100 hover:bg-indigo-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
        onClick={() => setAboutModalOpen(true)}
      >
        About this game
      </button>
    </div>
  )
}

export default App
