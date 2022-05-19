import { KeyValue } from '../../lib/keyboard'
// import { getStatuses } from '../../lib/statuses'
import { Key } from './Key'
import { useEffect } from 'react'

type Props = {
  onChar: (value: string) => void
  onDelete: () => void
  onEnter: () => void
  guesses: string[]
  solution: string
  isMyTurn: number
}

export const Keyboard = ({
  onChar,
  onDelete,
  onEnter,
  guesses,
  solution,
  isMyTurn,
}: Props) => {
  // const charStatuses = getStatuses(guesses, solution)

  const onClick = (value: KeyValue) => {
    if (value === 'ENTER') {
      onEnter()
    } else if (value === 'DELETE') {
      onDelete()
    } else {
      onChar(value)
    }
  }

  useEffect(() => {
    const listener = (e: KeyboardEvent) => {
      if (e.code === 'Enter') {
        onEnter()
      } else if (e.code === 'Backspace') {
        onDelete()
      } else {
        const key = e.key.toUpperCase()
        if (key.length === 1 && key >= '0' && key <= '9') {
          onChar(key)
        }
      }
    }
    window.addEventListener('keyup', listener)
    return () => {
      window.removeEventListener('keyup', listener)
    }
  }, [onEnter, onDelete, onChar])

  return (
    <div>
      <div className="flex justify-center mb-1">
        <Key value="1" onClick={onClick} />
        <Key value="2" onClick={onClick} />
        <Key value="3" onClick={onClick} />
        <Key value="4" onClick={onClick} />
        <Key value="5" onClick={onClick} />
        <Key value="6" onClick={onClick} />
        <Key value="7" onClick={onClick} />
        <Key value="8" onClick={onClick} />
        <Key value="9" onClick={onClick} />
        <Key value="0" onClick={onClick} />
      </div>
      <div className="flex justify-center">
        <Key width={65.4} value="ENTER" onClick={onClick}>
          Enter
        </Key>
        {isMyTurn === Number(localStorage.getItem('item')) && <p>hmm</p>}
        <Key width={65.4} value="DELETE" onClick={onClick}>
          Delete
        </Key>
      </div>
    </div>
  )
}
