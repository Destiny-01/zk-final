import { useEffect, useState } from 'react'
import { testnet, mainnet } from './chains'

export const Connect = () => {
  const chain =
    window.location.host === 'dead-target.netlify.app' ? mainnet : testnet
  const [correctChain, setCorrectChain] = useState(false)
  const { ethereum } = window

  const account = window.ethereum.selectedAddress
  useEffect(() => {
    checkChainId()
    if (account && correctChain) {
      return
    }
  }, [account, correctChain])

  const handleConnect = async () => {
    if (!ethereum) {
      alert('Please install metamask')
      return
    }
    const accounts = await ethereum.request({
      method: 'eth_requestAccounts',
    })
    if (!correctChain || !account) {
      changeChainId()
      return
    }
    localStorage.setItem('_metamask', accounts[0])
    console.log('Connected', accounts[0])
  }

  const changeChainId = async () => {
    let chainId = await ethereum.request({ method: 'eth_chainId' })

    console.log('target chain: ', chain.chainId)
    console.log('current chain: ', chainId)

    if (chainId !== chain.chainId) {
      try {
        await ethereum.request({
          method: 'wallet_switchEthereumChain',
          params: [
            {
              chainId: chain.chainId,
            },
          ],
        })
        chainId = await ethereum.request({ method: 'eth_chainId' })
      } catch (error) {
        if (error.code === 4902) {
          try {
            await ethereum.request({
              method: 'wallet_addEthereumChain',
              params: [chain],
            })
          } catch (addError) {
            console.error(addError)
          }
        }
        console.error(error)
      }
    }
    const accounts = await ethereum.request({
      method: 'eth_requestAccounts',
    })
    setTimeout(() => {
      window.location.reload()
    }, 2000)
    localStorage.setItem('_metamask', accounts[0])
    setCorrectChain(chainId === chain.chainId)
  }

  const checkChainId = async () => {
    let chainId = await ethereum.request({ method: 'eth_chainId' })
    console.log('Chain ID:', chainId, parseInt(chainId))

    setCorrectChain(chainId === chain.chainId)
  }
  console.log(account, correctChain)

  return (
    <div className="">
      {account && correctChain ? (
        <button
          type="button"
          disabled
          className="buttonn px-3 py-3 border border-transparent text-sm font-medium rounded text-white bg-indigo-700 hover:bg-indigo-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
        >
          {account.slice(0, 5)}...{account.slice(-5)}
        </button>
      ) : (
        <button
          type="button"
          className="buttonn px-3 py-3 border border-transparent text-sm font-medium rounded text-white bg-indigo-700 hover:bg-indigo-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
          onClick={handleConnect}
        >
          Connect Wallet to harmony chain
        </button>
      )}
    </div>
  )
}
