import { useState } from 'react'
import { JoinModal } from './components/modals/JoinModal'
import { CreateModal } from './components/modals/CreateModal'
import { HandleConnect } from './utils/contract'
import { AboutModal } from './components/modals/AboutModal'

type Props = {
  socket: any
}

function Home({ socket }: Props) {
  const [isJoinModalOpen, setJoinModalOpen] = useState(false)
  const [isAboutModalOpen, setAboutModalOpen] = useState(false)
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false)

  const createModal = () => {
    // HandleConnect(socket)
    // if (window.ethereum.selectedAddress) {
    setIsCreateModalOpen(true)
    // }
  }

  const joinModal = () => {
    // HandleConnect(socket)
    // if (window.ethereum.selectedAddress) {
    setJoinModalOpen(true)
    // }
  }

  return (
    <div className="py-8 max-w-8xl mx-auto sm:px-6 lg:px-8">
      <div className="flex w-1/2 mx-auto items-center mb-5 pt-8">
        <h1 className="text-5xl grow font-bold text-center">
          Can you crack your opponent's code before they crack yours?
        </h1>
      </div>
      <AboutModal
        isOpen={isAboutModalOpen}
        handleClose={() => setAboutModalOpen(false)}
      />
      <JoinModal
        isOpen={isJoinModalOpen}
        handleClose={() => setJoinModalOpen(false)}
        socket={socket}
      />
      <CreateModal
        isOpen={isCreateModalOpen}
        handleClose={() => setIsCreateModalOpen(false)}
        socket={socket}
      />
      <div className="flex justify-center mb-1 ">
        {/* {window.ethereum.selectedAddress?( 
          <div>*/}

        <button
          type="button"
          className="mx-3 mt-8 flex items-center px-3 py-3 border border-transparent text-sm font-medium rounded text-white bg-indigo-700 hover:bg-indigo-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
          onClick={createModal}
        >
          Start a new game
        </button>
        <button
          type="button"
          className="mx-3 mt-8 flex items-center px-3 py-3 border border-indigo-700 text-sm font-medium rounded text-indigo-700 bg-transparent hover:bg-indigo-100 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
          onClick={joinModal}
        >
          Enter game code
        </button>
        {/* </div>
        ):(
          <div>
        <button
          type="button"
          className="mx-3 mt-8 flex items-center px-3 py-3 border border-transparent text-sm font-medium rounded text-white bg-indigo-700 hover:bg-indigo-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
          onClick={()=>HandleConnect(socket)}
        >
         Connect Wallet
        </button>

          </div>
        )} */}
      </div>
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

export default Home
