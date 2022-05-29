import { Fragment } from 'react'
import { Dialog, Transition } from '@headlessui/react'
import { Cell } from '../grid/Cell'

type Props = {
  isOpen: boolean
  handleClose: () => void
}

export const InfoModal = ({ isOpen, handleClose }: Props) => {
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
                <div className="text-center">
                  <Dialog.Title
                    as="h3"
                    className="text-lg leading-6 font-medium text-gray-900"
                  >
                    How to play
                  </Dialog.Title>
                  <div className="mt-2">
                    <p className="text-sm text-gray-500">
                      Guess your opponent number in 6 tries. After each guess,
                      the color of the tiles will change to show how close your
                      guess was to opponent's number.
                    </p>

                    <div className="flex justify-center mb-1 mt-4">
                      <Cell value="7" status="correct" />
                      <Cell value="1" />
                      <Cell value="4" />
                      <Cell value="2" />
                    </div>
                    <p className="text-sm text-gray-500">
                      The 7 is part of opponent's number and in the correct
                      spot.
                    </p>

                    <div className="flex justify-center mb-1 mt-4">
                      <Cell value="7" />
                      <Cell value="3" />
                      <Cell value="6" />
                      <Cell value="0" status="present" />
                    </div>
                    <p className="text-sm text-gray-500">
                      The 0 is part of opponent's number but in the wrong spot.
                    </p>

                    <div className="flex justify-center mb-1 mt-4">
                      <Cell value="2" />
                      <Cell value="6" />
                      <Cell value="3" status="absent" />
                      <Cell value="9" />
                    </div>
                    <p className="text-sm text-gray-500">
                      The 3 is not part of opponent's number.
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => handleClose()}
                    className="w-full items-center mt-2 py-3 border border-transparent text-sm font-medium rounded text-white bg-indigo-700 hover:bg-indigo-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                  >
                    Let's Play
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
