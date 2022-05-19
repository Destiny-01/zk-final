import { Dialog, Transition } from '@headlessui/react'
import { XCircleIcon } from '@heroicons/react/outline'
import { Fragment, useState } from 'react'
import { useHistory } from 'react-router-dom'
import { Alert } from '../alerts/Alert'

type Props = {
  isOpen: boolean
  handleClose: () => void
  socket: any
}

let gameCode = ''

const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789'
for (let i = 0; i < 5; i++) {
  gameCode += characters.charAt(Math.floor(Math.random() * characters.length))
}
export const CreateModal = ({ isOpen, handleClose, socket }: Props) => {
  const [input, setInput] = useState('')
  const [isWordNotFoundAlertOpen, setIsWordNotFoundAlertOpen] = useState(false)
  const history = useHistory()

  const handleCreate = () => {
    const guessArr = String(input)
      .split('')
      .map((currentGuess) => {
        return Number(currentGuess)
      })
    if (
      input.length !== 4 ||
      !guessArr.every((e, i, a) => a.indexOf(e) === i)
    ) {
      setIsWordNotFoundAlertOpen(true)
      return setTimeout(() => {
        setIsWordNotFoundAlertOpen(false)
      }, 3000)
    }
    // const start=await contract.methods.
    socket.emit('newGame', gameCode, input)
    history.push(`/?room_id=${gameCode}`)
  }
  return (
    <Transition.Root show={isOpen} as={Fragment}>
      <Dialog
        as="div"
        className="fixed z-10 inset-0 overflow-y-auto"
        onClose={handleClose}
      >
        <div className="flex items-end justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
          <Transition.Child
            as={Fragment}
            enter="ease-out duration-300"
            enterFrom="opacity-0"
            enterTo="opacity-100"
            leave="ease-in duration-200"
            leaveFrom="opacity-100"
            leaveTo="opacity-0"
          >
            <Dialog.Overlay className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity" />
          </Transition.Child>

          {/* This element is to trick the browser into centering the modal contents. */}
          <span
            className="hidden sm:inline-block sm:align-middle sm:h-screen"
            aria-hidden="true"
          >
            &#8203;
          </span>
          <Transition.Child
            as={Fragment}
            enter="ease-out duration-300"
            enterFrom="opacity-0 translate-y-4 sm:translate-y-0 sm:scale-95"
            enterTo="opacity-100 translate-y-0 sm:scale-100"
            leave="ease-in duration-200"
            leaveFrom="opacity-100 translate-y-0 sm:scale-100"
            leaveTo="opacity-0 translate-y-4 sm:translate-y-0 sm:scale-95"
          >
            <div className="inline-block align-bottom bg-white rounded-lg px-4 pt-5 pb-4 text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-sm sm:w-full sm:p-6">
              <div className="absolute right-4 top-4">
                <XCircleIcon
                  className="h-6 w-6 cursor-pointer"
                  onClick={() => handleClose()}
                />
              </div>
              <Alert
                message="Please input a non repeating 4 digit number"
                isOpen={isWordNotFoundAlertOpen}
              />
              <div>
                <div className="text-center mb-3">
                  <Dialog.Title
                    as="h3"
                    className="text-lg leading-6 font-medium text-gray-900"
                  >
                    Game created
                  </Dialog.Title>
                  <p className="text-xs">
                    Your game id is: <b>{gameCode}</b>.
                  </p>
                  Share with a friend to compete
                </div>
                <div className="mt-3">
                  <label className="block">
                    <span className="block text-sm font-medium text-slate-700">
                      Create a unique non-repeating 4-digit code. You might need
                      to sign a transaction before proceeding
                    </span>
                    <input
                      className=" placeholder:text-slate-400 block bg-white w-full border border-slate-300 rounded-md py-2 px-3 mb-3 shadow-sm focus:outline-none focus:border-indigo-500 focus:ring-indigo-500 focus:ring-1 sm:text-sm"
                      placeholder="Enter number to be guessed"
                      onChange={(e) => {
                        console.log(e)
                        e.target.value === 'Enter'
                          ? handleCreate()
                          : setInput(e.target.value)
                      }}
                      type="number"
                    />
                  </label>

                  <button
                    type="button"
                    className="w-full items-center py-3 border border-transparent text-sm font-medium rounded text-white bg-indigo-700 hover:bg-indigo-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                    onClick={handleCreate}
                  >
                    Launch game
                  </button>
                </div>
              </div>
            </div>
          </Transition.Child>
        </div>
      </Dialog>
    </Transition.Root>
  )
}
