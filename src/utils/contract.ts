import { ethers } from 'ethers'
import DeadTarget from './DeadTarget.json'

const provider = new ethers.providers.Web3Provider(window.ethereum)
const signer = provider.getSigner()
const account = localStorage.getItem('_metamask')
const abi = DeadTarget.abi
const contractAddress = '0x24Cb77452567Cb8ab837F7D030E06122EF338d82'
const contract = new ethers.Contract(contractAddress, abi, signer)

export const verifyGuess = async (inputs: string[]) => {
  if (!account) {
    return
  }
  try {
    const guess = await contract.guess(
      inputs[0],
      inputs[1],
      inputs[2],
      inputs[3]
    )
    console.log(guess, 'guesss')
    return guess
  } catch (error) {
    console.log(error)
  }
}

export const startGame = async (hash: string) => {
  if (!account) {
    return
  }
  try {
    const tx = await contract.startGame(hash, {
      gasLimit: 400000,
    })
    console.log(tx, 'init')
    const receipt = await tx.wait()
    console.log(receipt, 'end')
    if (receipt.blockNumber) {
      return true
    } else {
      return false
    }
  } catch (error) {
    console.log(error)
  }
}

export const wonGame = async () => {
  if (!account) {
    return
  }
  try {
    const tx = await contract.won(account)
    console.log(tx, 'init')
    const receipt = await tx.wait()
    console.log(receipt, 'end')
    if (receipt.blockNumber) {
      contract.on('MintNFT', (id, reciever) => {
        console.log(`NFT ${id} minted to ${reciever}`)
      })
      console.log(receipt.transactionHash)
      return receipt.transactionHash
    } else {
      return 'Error occoured while minting your nft'
    }
  } catch (error) {
    console.log(error)
  }
}
