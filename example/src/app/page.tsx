'use client'

import { useState } from 'react'
import { relayTransaction, createAccount, getMintAction } from '@near-relay/client'
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"

export default function Home() {

  const [accountId, setAccountId] = useState('')
  const [createReceipt, setCreateReceipt] = useState<any>()
  const [relayReceipt, setRelayReceipt] = useState<any>()

  const handleCreateAccount = async () => {
    const receipt = await createAccount('/api/relayer/create-account', accountId)
    setCreateReceipt(JSON.stringify(receipt.transaction))
  }

  const handleRelay = async () => {
    const mintAction = getMintAction('drop.mintbase1.near', 'mdu45CgSh5vUq9OFNTfJoCawGE3xGIbAXfWBTeoCqoM')
    const receipt = await relayTransaction(mintAction, '0.drop.proxy.mintbase.near', '/api/relayer')
    setRelayReceipt(JSON.stringify(receipt.transaction))
  }

  return (
    <main className="h-screen flex flex-col items-center justify-center bg-dark">

      <h1 className=" mb-10 scroll-m-20 text-4xl text-white font-extrabold tracking-tight lg:text-5xl">
        @near-relay demo
      </h1>
      <h3 className=" mb-10 scroll-m-20 text-2xl text-white font-bold tracking-tight lg:text-1xl">
        Try create an account and then relay a test transaction
      </h3>
      <div>
      <Input className='text-white'placeholder="Enter Account ID" value={accountId} onChange={(e) => setAccountId(e.target.value)} />

      </div>

      <div className='mb-10 mt-2'>
      <Button  onClick={handleCreateAccount} disabled={!accountId}>Create Account</Button>
     

      </div>
      
      <Button className='mb-5'onClick={handleRelay} >Relay Transaction</Button>
      {createReceipt  && < h1 className=" mb-10 scroll-m-20 text-2xl text-white font-bold tracking-tight lg:text-1xl">Account created</h1>}
      {relayReceipt  && <h1 className=" mb-10 scroll-m-20 text-2xl text-white font-bold tracking-tight lg:text-1xl" >Transaction relayed</h1>}
    </main>

  )
}