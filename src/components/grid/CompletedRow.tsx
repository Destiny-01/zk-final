import { useState } from 'react'
import { getGuessStatuses } from '../../lib/statuses'
import { Cell } from './Cell'

type Props = {
  guess: string
  socket: any
  status: any
}

export const CompletedRow = ({ guess, socket, status }: Props) => {
  return (
    <div className="flex justify-center mb-1">
      {guess.split('').map((letter, i) => {
        return <Cell key={i} value={letter} status={status && status[i]} />
      })}
    </div>
  )
}
