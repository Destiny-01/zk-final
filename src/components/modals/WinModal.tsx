import { Fragment, useState } from 'react'
import { Dialog, Transition } from '@headlessui/react'
import { CheckIcon } from '@heroicons/react/outline'
import { Alert } from '../alerts/Alert'
import { wonGame } from '../../utils/contract'

type Props = {
  isOpen: boolean
  handleClose: () => void
}

export const WinModal = ({ isOpen, handleClose }: Props) => {
  const [isAlertOpen, setIsAlertOpen] = useState('')
  const [isMinting, setIsMinting] = useState(false)
  const [isErrorOpen, setIsErrorOpen] = useState('')
  const handleMint = async () => {
    setIsMinting(true)
    const tx = await wonGame()
    if (tx?.startsWith('Error')) {
      setIsErrorOpen(tx)
      setIsMinting(false)
      return
    } else {
      setIsMinting(false)
      setIsAlertOpen(tx)
    }
  }
  return (
    <Transition.Root show={isOpen} as={Fragment}>
      <Dialog
        as="div"
        className="fixed z-10 inset-0 overflow-y-auto"
        onClose={() => {}}
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
              <div>
                <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-green-100">
                  <CheckIcon
                    className="h-6 w-6 text-green-600"
                    aria-hidden="true"
                  />
                </div>
                <Alert
                  message={`Success. You should see your nft soon. Your tx hash is ${isAlertOpen}`}
                  isOpen={isAlertOpen.length !== 0}
                  variant="success"
                />
                <Alert
                  message={isErrorOpen}
                  isOpen={isErrorOpen.length !== 0}
                />
                <div className="mt-3 text-center sm:mt-5">
                  <Dialog.Title
                    as="h3"
                    className="text-lg leading-6 font-medium text-gray-900"
                  >
                    You won!
                  </Dialog.Title>
                  <div className="mt-2">
                    <p className="text-sm text-gray-500">
                      And as a reward, you can mint a winner nft below
                    </p>
                    {!isAlertOpen && !isErrorOpen ? (
                      <button
                        type="button"
                        className="w-full mt-2 items-center py-3 border border-transparent text-sm font-medium rounded text-white bg-indigo-700 hover:bg-indigo-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                        style={
                          isMinting
                            ? { opacity: '0.4', pointerEvents: 'none' }
                            : {}
                        }
                        onClick={handleMint}
                      >
                        Mint NFT
                      </button>
                    ) : (
                      <button
                        type="button"
                        className="w-full mt-2 items-center py-3 border border-transparent text-sm font-medium rounded text-white bg-indigo-700 hover:bg-indigo-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                        onClick={() => handleClose()}
                      >
                        Back
                      </button>
                    )}

                    {isMinting && (
                      <h6 className=" mt-2 items-center">Minting...</h6>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </Transition.Child>
        </div>
      </Dialog>
    </Transition.Root>
  )
}
