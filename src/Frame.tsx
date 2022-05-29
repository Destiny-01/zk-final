import { useLocation } from 'react-router-dom'
import Home from './Home'
import App from './App'
import { io } from 'socket.io-client'
import { Connect } from './utils/connect'

const socket = io('http://localhost:8000')
const Frame = () => {
  const search = useLocation().search
  const gameCode = new URLSearchParams(search).get('room_id')

  return (
    <div className="">
      <Connect />
      {!gameCode ? (
        <Home socket={socket} />
      ) : (
        <App socket={socket} gameCode={gameCode} />
      )}
    </div>
  )
}

export default Frame
