"use client";
import { useState } from "react";
import {
  relayTransaction,
  createAccount,
} from "@near-relay/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { actionCreators } from "@near-js/transactions";

export default function Home() {
 
  const [accountId, setAccountId] = useState("");
  const [createReceipt, setCreateReceipt] = useState<any>();
  const [relayReceipt, setRelayReceipt] = useState<any>();

  const handleCreateAccount = async () => {
    const receipt = await createAccount(
      "/api/relayer/create-account",
      accountId,
      {password: "lfg"}
    );
    setCreateReceipt(JSON.stringify(receipt.transaction));
  };

  const handleRelay = async () => {

    const action = actionCreators.functionCall(
      'set_greeting',
      {
          greeting: "hello"
     },
     BigInt(30000000000000), 
     BigInt(0)
    )
    const receipt = await relayTransaction(action as any, "surgedev.near", "/api/relayer", "mainnet", {password: "lfg"});

    setRelayReceipt(JSON.stringify(receipt));
  };

  return (
    <main className="h-screen flex flex-col items-center justify-center bg-dark">
      <h1 className=" mb-10 scroll-m-20 text-4xl text-white font-extrabold tracking-tight lg:text-5xl">
        @near-relay demo
      </h1>
      <h3 className=" mb-10 scroll-m-20 text-2xl text-white font-bold tracking-tight lg:text-1xl">
        Try create an account and then relay a test transaction
      </h3>
      <div>
        <Input
          className="text-white"
          placeholder="Enter Account ID"
          value={accountId}
          onChange={(e) => setAccountId(e.target.value)}
        />
      </div>

      <div className="mb-10 mt-2">
        <Button onClick={handleCreateAccount} disabled={!accountId}>
          Create Account
        </Button>
      </div>

      <Button className="mb-5" onClick={handleRelay}>
        Relay Transaction
      </Button>
      {createReceipt && (
        <h1 className=" mb-10 scroll-m-20 text-2xl text-white font-bold tracking-tight lg:text-1xl">
          Account created
        </h1>
      )}
      {relayReceipt && (
        <h1 className=" mb-10 scroll-m-20 text-2xl text-white font-bold tracking-tight lg:text-1xl">
          Transaction relayed
        </h1>
      )}
    </main>
  );
}
