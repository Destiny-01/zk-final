import { useState } from 'react'
import Web3 from 'web3'
import { Alert } from '../components/alerts/Alert'
import { abi } from './abi'

export const HandleConnect = async (socket: any) => {
  const [isAlertOpen, setIsAlertOpen] = useState(false)
  try {
    const { ethereum } = window
    if (!ethereum) {
      setIsAlertOpen(true)
      setTimeout(() => {
        setIsAlertOpen(false)
      }, 3000)
      return
    }
    if (ethereum.selectedAddress) {
      return
    }
    const web3 = new Web3(Web3.givenProvider || 'ws://localhost:8545')
    window.web3 = web3
    const accounts = await ethereum.request({
      method: 'eth_requestAccounts',
    })
    console.log('Connected', accounts[0], abi[0])
    // const contractAddress = '0xD87d2d064f59284bddCce34B31656FD47f20D75e'
    // const contract = new web3.eth.Contract(parsed, contractAddress)
    // socket.emit('contract', contract, accounts[0])
    return <Alert isOpen={isAlertOpen} message="Please install MetaMask!" />
  } catch (error) {
    console.log(error)
  }
}
