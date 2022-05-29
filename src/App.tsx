import { useState, useEffect } from 'react'
import { InformationCircleIcon } from '@heroicons/react/outline'
import { Alert } from './components/alerts/Alert'
import { Grid } from './components/grid/Grid'
import { Keyboard } from './components/keyboard/Keyboard'
import { InfoModal } from './components/modals/InfoModal'
import { WinModal } from './components/modals/WinModal'
import { CharStatus, getGuessStatuses } from './utils/statuses'
import { LoseModal } from './components/modals/LoseModal'
import { verifyGuess } from './utils/contract'
import { AboutModal } from './components/modals/AboutModal'

type Props = {
  socket: any
  gameCode: any
}

function App({ socket, gameCode }: Props) {
  const [currentGuess, setCurrentGuess] = useState('')
  const [solution, setSolution] = useState('')
  const [isGameWon, setIsGameWon] = useState(false)
  const [isLoseModalOpen, setIsLoseModalOpen] = useState(false)
  const [isGameEnded, setIsGameEnded] = useState(false)
  const [isEnter, setIsEnter] = useState(false)
  const [isAboutModalOpen, setAboutModalOpen] = useState(false)
  const [isInfoModalOpen, setIsInfoModalOpen] = useState(false)
  const [isWordNotFoundAlertOpen, setIsWordNotFoundAlertOpen] = useState(false)
  const [turn, setTurn] = useState(1)
  const [oppGameCode, setOppGameCode] = useState('')
  const [myGuesses, setMyGuesses] = useState<string[]>([])
  const [opponentGuesses, setOpponentGuesses] = useState<string[]>([])
  const [myStatus, setMyStatus] = useState<CharStatus[]>([])
  const [opponentStatus, setOpponentStatus] = useState<CharStatus[]>([])

  const isTurn = turn === Number(localStorage.getItem('item'))

  useEffect(() => {
    setIsInfoModalOpen(true)
  }, [])

  const onChar = (value: string) => {
    if (currentGuess.length < 4 && !isGameEnded) {
      setCurrentGuess(`${currentGuess}${value}`)
    }
  }

  const onDelete = () => {
    setCurrentGuess(currentGuess.slice(0, -1))
  }

  useEffect(() => {
    socket.on('yourGuess', (guess: any, result: any) => {
      const status = getGuessStatuses(result)
      setMyGuesses((guesses) => [...guesses, guess])
      setMyStatus((guesses) => [...guesses, status])
    })

    socket.on('guess', (guess: any, result: any) => {
      const status = getGuessStatuses(result)
      setOpponentStatus((guesses) => [...guesses, status])
      setOpponentGuesses((guesses) => [...guesses, guess])
    })
    socket.on('turn', (num: number) => setTurn(num))
    socket.on('init', (sol: string, num: number) => {
      localStorage.setItem('item', String(num))
      setSolution(sol)
    })
    socket.on('wonGame', () => {
      setIsGameWon(true)
      setIsGameEnded(true)
    })
    socket.on('lostGame', (so: string) => {
      setIsGameEnded(true)
      setIsLoseModalOpen(true)
      setOppGameCode(so)
    })
  }, [socket])

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

    socket.emit('guess', currentGuess, gameCode)
    setTimeout(() => {
      socket.emit('turn')
    }, 8000)
    socket.on('calldata', (inputs: string[], response: any) => {
      setIsEnter(false)
      verifyGuess(inputs).then((verified) => {
        setCurrentGuess('')
        if (verified === true) {
          socket.emit('verify', currentGuess, response)
        }
      })
    })
    setIsEnter(true)
  }

  return (
    <div className="py-8 max-w-7xl mx-auto sm:px-6 lg:px-8">
      <Alert
        message="Please input a non repeating 4 digit number"
        isOpen={isWordNotFoundAlertOpen}
      />
      <div className="flex w-80 mx-auto items-center mb-8">
        <h1 className="text-xl grow font-bold">DeadTarget</h1>
        <InformationCircleIcon
          className="h-6 w-6 cursor-pointer"
          onClick={() => setIsInfoModalOpen(true)}
        />
      </div>
      <div className="flex justify-center mb-1">
        <Grid
          player="My"
          allGuesses={myGuesses}
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
          allGuesses={opponentGuesses}
          currentGuess={''}
          socket={socket}
          solution={solution}
        />
      </div>
      {isGameEnded ? (
        <a href="/">
          <button
            type="button"
            className="mx-auto flex items-center mt-2 p-3 border border-transparent text-sm font-medium rounded text-white bg-indigo-700 hover:bg-indigo-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
          >
            Game Ended. Go Home
          </button>
        </a>
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
      <WinModal isOpen={isGameWon} handleClose={() => setIsGameWon(false)} />
      <LoseModal
        isOpen={isLoseModalOpen}
        solution={oppGameCode}
        handleClose={() => setIsLoseModalOpen(false)}
      />
      <InfoModal
        isOpen={isInfoModalOpen}
        handleClose={() => setIsInfoModalOpen(false)}
      />
      <AboutModal
        isOpen={isAboutModalOpen}
        handleClose={() => setAboutModalOpen(false)}
      />
      <button
        type="button"
        className="mx-auto mt-8 flex items-center px-2.5 py-1.5 border border-transparent text-xs font-medium rounded text-indigo-700 bg-indigo-100 hover:bg-indigo-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
        onClick={() => setAboutModalOpen(true)}
      >
        About this game
      </button>
    </div>
  )
}

export default App
