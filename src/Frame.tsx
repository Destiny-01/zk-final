import { useLocation } from 'react-router-dom'
import Home from './Home'
import App from './App'
import { io } from 'socket.io-client'

const socket = io('http://localhost:8000')
function Frame() {
  const search = useLocation().search
  const gameCode = new URLSearchParams(search).get('room_id')

  return !gameCode ? <Home socket={socket} /> : <App socket={socket} />
}

export default Frame
