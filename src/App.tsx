import { InformationCircleIcon } from '@heroicons/react/outline'
import { useState, useEffect } from 'react'
import { Alert } from './components/alerts/Alert'
import { Grid } from './components/grid/Grid'
import { Keyboard } from './components/keyboard/Keyboard'
import { InfoModal } from './components/modals/InfoModal'
import { WinModal } from './components/modals/WinModal'
import { isWinningWord, solution } from './lib/words'
import { useLocation } from 'react-router-dom'
import { CharStatus, getGuessStatuses } from './lib/statuses'

type Props = {
  socket: any
}

function App({ socket }: Props) {
  const [currentGuess, setCurrentGuess] = useState('')
  const [solution, setSolution] = useState('')
  const [isGameWon, setIsGameWon] = useState(false)
  const [isMyTurn, setIsMyTurn] = useState(false)
  const [isWinModalOpen, setIsWinModalOpen] = useState(false)
  const [isInfoModalOpen, setIsInfoModalOpen] = useState(false)
  const [isAboutModalOpen, setIsAboutModalOpen] = useState(false)
  const [isWordNotFoundAlertOpen, setIsWordNotFoundAlertOpen] = useState(false)
  const [isGameLost, setIsGameLost] = useState(false)
  const [shareComplete, setShareComplete] = useState(false)
  const [myGuesses, setMyGuesses] = useState<string[]>([])
  const [opponentGuesses, setOpponentGuesses] = useState<string[]>([])
  const [myStatus, setMyStatus] = useState<CharStatus[]>([])
  const [opponentStatus, setOpponentStatus] = useState<CharStatus[]>([])

  const search = useLocation().search
  const gameCode = new URLSearchParams(search).get('room_id')

  useEffect(() => {
    if (isGameWon) {
      setIsWinModalOpen(true)
    }
  }, [isGameWon])

  const onChar = (value: string) => {
    if (currentGuess.length < 4 && myGuesses.length < 6) {
      setCurrentGuess(`${currentGuess}${value}`)
    }
  }

  const onDelete = () => {
    setCurrentGuess(currentGuess.slice(0, -1))
  }

  // const switchTurn = (turn: boolean) => {
  //   setTimeout(() => {
  //     setIsMyTurn(turn)
  //   }, 4000)
  // }

  useEffect(() => {
    socket.on('result', (result: any) => {
      const status = getGuessStatuses(result)
      console.log(isMyTurn)
      if (isMyTurn === true) {
        setMyStatus([...myStatus, status])
      } else {
        setOpponentStatus([...opponentStatus, status])
      }
      // isMyTurn
      //   ? setMyStatus([...myStatus, status])
      //   : setOpponentStatus([...opponentStatus, status])
    })
    socket.on('yourGuess', (guess: any) => {
      setMyGuesses([...myGuesses, guess])
      // switchTurn(false)
    })
    socket.on('guess', (guess: any) => {
      setOpponentGuesses([...opponentGuesses, guess])
      // switchTurn(true)
    })
    socket.on('init', (sol: string, num: number) => {
      setSolution(sol)
      console.log('inittttttttt')
      num === 1 ? setIsMyTurn(true) : setIsMyTurn(false)
    })
    socket.on('wonGame', () => {
      setIsGameWon(true)
    })
    socket.on('lostGame', () => {
      setIsGameLost(true)
      return setTimeout(() => {
        setIsGameLost(false)
      }, 4000)
    })
  }, [
    isMyTurn,
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

    // const winningWord = isWinningWord(currentGuess)

    if (currentGuess.length === 4 && myGuesses.length < 6 && !isGameWon) {
      socket.emit('guess', currentGuess, gameCode)
      // console.log('blahhhhhh')
      // setMyGuesses([...myGuesses, currentGuess])
      setCurrentGuess('')

      // if (winningWord) {
      //   return setIsGameWon(true)
      // }

      if (myGuesses.length === 5) {
        setIsGameLost(true)
        return setTimeout(() => {
          setIsGameLost(false)
        }, 4000)
      }
    }
  }
  console.log(myStatus, opponentStatus, myGuesses, opponentGuesses, isMyTurn)

  return (
    <div className="py-8 max-w-7xl mx-auto sm:px-6 lg:px-8">
      <Alert
        message="Please input a non repeating 4 digit number"
        isOpen={isWordNotFoundAlertOpen}
      />
      <Alert
        message={`You lost, your opponent guess was ${solution}`}
        isOpen={isGameLost}
      />
      <Alert
        message="Game copied to clipboard"
        isOpen={shareComplete}
        variant="success"
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
          isTurn={isMyTurn}
          status={myStatus}
        />
        <Grid
          status={opponentStatus}
          isTurn={isMyTurn}
          player="Opponent"
          guesses={opponentGuesses}
          currentGuess={''}
          socket={socket}
          solution={solution}
        />
      </div>
      <Keyboard
        solution={solution}
        onChar={onChar}
        onDelete={onDelete}
        onEnter={onEnter}
        guesses={myGuesses}
        isMyTurn={isMyTurn}
      />
      <WinModal
        isOpen={isWinModalOpen}
        handleClose={() => setIsWinModalOpen(false)}
        guesses={myGuesses}
        handleShare={() => {
          setIsWinModalOpen(false)
          setShareComplete(true)
          return setTimeout(() => {
            setShareComplete(false)
          }, 2000)
        }}
      />
      <InfoModal
        isOpen={isInfoModalOpen}
        handleClose={() => setIsInfoModalOpen(false)}
      />

      <button
        type="button"
        className="mx-auto mt-8 flex items-center px-2.5 py-1.5 border border-transparent text-xs font-medium rounded text-indigo-700 bg-indigo-100 hover:bg-indigo-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
        onClick={() => setIsAboutModalOpen(true)}
      >
        About this game
      </button>
    </div>
  )
}

export default App
