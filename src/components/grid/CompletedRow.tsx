import { useState } from 'react'
import { getGuessStatuses } from '../../lib/statuses'
import { Cell } from './Cell'

type Props = {
  guess: string
  socket: any
  status: any
}

export const CompletedRow = ({ guess, socket, status }: Props) => {
  //   const [statuses, setStatuses] = useState<Array<String>>([])
  //  const allStatus = []
  //   socket.on('result', (result: any) => {
  //     const status = getGuessStatuses(result)
  //     allStatus.push(status)
  //     // console.log(status)
  //     // setStatuses(status)
  //   })
  const stat = localStorage.getItem('status')

  return (
    <div className="flex justify-center mb-1">
      {guess.split('').map((letter, i) => {
        return <Cell key={i} value={letter} status={status && status[i]} />
      })}
      {/* {guess.split('').map((letter, i) => (
        // console.log(i)
        <Cell key={i} value={letter} status={statuses[i]} />
      ))} */}
    </div>
  )
}
