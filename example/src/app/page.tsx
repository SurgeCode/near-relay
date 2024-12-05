"use client";
import { useState } from "react";
import {
  relayTransaction,
  createAccount,
} from "@near-relay/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Action, actionCreators } from "@near-js/transactions";
import { KeyPair } from "near-api-js";

export default function Home() {
  const CONTRACT_ADDRESS = "surgedev.near"
  const RELAY_URL = "/api/relayer"
  const CREATE_ACCOUNT_URL= "/api/relayer/create-account"
  const NETWORK = "mainnet"
  const [accountId, setAccountId] = useState("");
  const [password, setPassword] = useState("");
  const [createReceipt, setCreateReceipt] = useState<any>();
  const [relayReceipt, setRelayReceipt] = useState<any>();
  const [error, setError] = useState<string>();
  const [createMethod, setCreateMethod] = useState<"passkey" | "password" | "keypair">("passkey");
  const [isCreating, setIsCreating] = useState(false);
  const [isRelaying, setIsRelaying] = useState(false);

  const handleCreateAccount = async () => {
    try {
      setIsCreating(true);
      let receipt;
      
      switch(createMethod) {
        case "passkey":
          receipt = await createAccount(
            CREATE_ACCOUNT_URL,
            accountId,
            { usePasskey: true }
          );
          break;
        
        case "password":
          if (!password) {
            alert("Please enter a password");
            return;
          }
          receipt = await createAccount(
            CREATE_ACCOUNT_URL,
            accountId,
            { password }
          );
          break;
          
        case "keypair":
          const keyPair = KeyPair.fromRandom('ed25519');
          receipt = await createAccount(
            CREATE_ACCOUNT_URL,
            accountId,
            { keyPair }
          );
          break;
      }
      console.log(receipt)
      setCreateReceipt(JSON.stringify(receipt.transaction));
      setError(undefined);
    } catch (err: any) {
      setError(err.message);
      setCreateReceipt(undefined);
    } finally {
      setIsCreating(false);
    }
  };

  const handleRelay = async () => {
    try {
      setIsRelaying(true);
      const action: Action = actionCreators.functionCall(
        'set_greeting',
        {
          greeting: "hello"
        },
        BigInt(30000000000000),
        BigInt(0)
      )
      
      const receipt = await relayTransaction(
        action, 
        CONTRACT_ADDRESS, 
        RELAY_URL, 
        NETWORK,
        password ? { password } : undefined
      );

      setRelayReceipt(JSON.stringify(receipt));
      setError(undefined);
    } catch (err: any) {
      setError(err.message || "Failed to relay transaction");
      setRelayReceipt(undefined);
    } finally {
      setIsRelaying(false);
    }
  };

  return (
    <main className="h-screen flex flex-col items-center justify-center bg-dark">
      <h1 className="mb-10 scroll-m-20 text-4xl text-white font-extrabold tracking-tight lg:text-5xl">
        @near-relay demo
      </h1>
      <h3 className="mb-10 scroll-m-20 text-2xl text-white font-bold tracking-tight lg:text-1xl">
        Try create an account and then relay a test transaction
      </h3>

      <div className="flex flex-col gap-4 w-80">
        <Input
          className="text-white"
          placeholder="Enter Account ID"
          value={accountId}
          onChange={(e) => setAccountId(e.target.value)}
        />

        <div className="flex justify-between gap-2">
          <Button 
            onClick={() => setCreateMethod("passkey")}
            variant={createMethod === "passkey" ? "default" : "secondary"}
            className="flex-1"
          >
            Passkey
          </Button>
          <Button
            onClick={() => setCreateMethod("password")}
            variant={createMethod === "password" ? "default" : "secondary"}
            className="flex-1"
          >
            Password
          </Button>
          <Button
            onClick={() => setCreateMethod("keypair")}
            variant={createMethod === "keypair" ? "default" : "secondary"}
            className="flex-1"
          >
            KeyPair
          </Button>
        </div>

        {createMethod === "password" && (
          <Input
            type="password"
            className="text-white"
            placeholder="Enter Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
        )}

        <Button 
          onClick={handleCreateAccount} 
          disabled={!accountId || (createMethod === "password" && !password) || isCreating}
        >
          {isCreating ? "Creating Account..." : "Create Account"}
        </Button>

        <Button 
          onClick={handleRelay}
          disabled={isRelaying}
        >
          {isRelaying ? "Relaying Transaction..." : "Relay Transaction"}
        </Button>
      </div>

      {error && (
        <h1 className="mt-5 scroll-m-20 text-2xl text-red-500 font-bold tracking-tight lg:text-1xl">
          Error: {error}
        </h1>
      )}
      {createReceipt && (
        <h1 className="mt-5 scroll-m-20 text-2xl text-white font-bold tracking-tight lg:text-1xl">
          Account created using {createMethod}
        </h1>
      )}
      {relayReceipt && (
        <h1 className="mt-5 scroll-m-20 text-2xl text-white font-bold tracking-tight lg:text-1xl">
          Transaction relayed
        </h1>
      )}
    </main>
  );
}