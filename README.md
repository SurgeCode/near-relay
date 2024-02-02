
# @near-relay

The @near-relay library streamlines the development of meta transactions on the NEAR Protocol, aiming to simplify the process for developers. 

Meta transactions enable a signed transaction to be delegated to another account (the relayer) for submission. This delegation mechanism eliminates the need for the signer to cover gas fees, thereby enhancing the onboarding experience for users.

## @near-relay/server

The server-side component of the package offers methods that facilitate the submission of delegated transactions, including "relay" and "createAccount".

### Server Example 
Here's a basic example demonstrating how these methods can be utilized within a server:

[This code can be easily emulated to produce simple relayer](https://github.com/SurgeCode/near-relay/blob/main/server/server.ts)
```ts
import { createAccount, relay } from "@near-relay/server;

app.post('/', async (req: any, res: any) => {
    const body = req.body;
    const result = await relay(body)
   
    res.json({ message: 'Relayed', data: result });
});

app.post('/create-account', async (req: any, res: any) => {
    const body = req.body;
    const result = await createAccount(body.accountId, body.publicKey)
    res.json({ message: 'Relayed', data: result });
});
```

As far as environment variables you need to have a near accounts credentials set

```ts
//id of the relayer account
RELAYER_ACCOUNT_ID=

//private key of the relayer account (corresponding to the previous ID)
RELAYER_PRIVATE_KEY=

NEAR_NETWORK='mainnet' or 'testnet'
``````

## @near-relay/client

The client-side module employs @near-js/biometric-ed25519 to facilitate the creation of keypairs using a passkey. These keypairs are then used to sign transactions, which are subsequently sent to a relayer for processing.

### Creating an Account

The createAccount function generates an arbitrary keypair using a passkey. The resulting public key, along with the specified account ID, is sent to the designated relayerUrl, which should be an API endpoint invoking the createAccount method on the server side.
```ts
const receipt = await createAccount(relayerUrl: string, accountId: string)
```


### Relaying Transactions
The relayTransaction function simplifies the process of obtaining a keypair from a passkey, creating a transaction, signing it, encoding it, and sending it to a relayer – all in a single line of code. The relayerUrl parameter should correspond to the appropriate API route invoking the relay() method on the server side.
```ts
const receipt = await relayTransaction(action: Action, receiverId: string, relayerUrl: string)
``````



# Example Usage

To get started with the `@near-relay` project, clone the example directory which includes a fully functional NEXT.js 14 project. This project is equipped with a relayer API and a frontend interface that allows for the creation of wallets and the relaying of transactions.

### Frontend Implementation

Within the `page.tsx` file of the example project, you'll find the following key code snippets that demonstrate how to create a new account and relay a transaction using the `@near-relay/client` package. The code below is a simplified version, focusing on the main functionality:

For the relay function a simple minting action is passed into the arguments with a helper method that creates the transaction object. You can create your own actions for calling any contract with near-api-js


```tsx
"use client";

import { useState } from "react";
import {
  relayTransaction,
  createAccount,
  getMintAction,
} from "@near-relay/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export default function Home() {


  const handleCreateAccount = async () => {
    const receipt = await createAccount(
      "/api/relayer/create-account",
      accountId
    );
    setCreateReceipt(JSON.stringify(receipt.transaction));
  };

  const handleRelay = async () => {
    const mintAction = getMintAction(
      "drop.mintbase1.near",
      "mdu45CgSh5vUq9OFNTfJoCawGE3xGIbAXfWBTeoCqoM"
    );
    const receipt = await relayTransaction(
      mintAction,
      "0.drop.proxy.mintbase.near",
      "/api/relayer"
    );
    setRelayReceipt(JSON.stringify(receipt.transaction));
  };

  return (

      <div className="mb-10 mt-2">
        <Button onClick={handleCreateAccount} disabled={!accountId}>
          Create Account
        </Button>
      </div>

      <Button className="mb-5" onClick={handleRelay}>
        Relay Transaction
      </Button>
 
    </main>
  );
}

```



The backend includes endpoints for account creation and transaction relaying with the account set in the environment variables

### Create Account
```ts

import { NextRequest, NextResponse } from "next/server";
import { createAccount } from '@near-relay/server'

export async function POST(req: NextRequest, res: NextResponse) {
    try {
        const { publicKey, accountId } = await req.json();

        const receipt = await createAccount(accountId, publicKey)

        return NextResponse.json(receipt, {
            status: 200,
            headers: { "content-type": "application/json" },
        });
    } catch (error: any) {
        console.error(error);
        return NextResponse.json(
            { msg: error.toString(), error },
            { headers: { "content-type": "application/json" }, status: 500 }
        );
    }
}

```

### Relay


```ts

import { NextRequest, NextResponse } from "next/server";
import { relay } from '@near-relay/server'

export async function POST(req: NextRequest, res: NextResponse) {
    try {
        const transaction = await req.json();

        const receipt = await relay(transaction)

        return NextResponse.json(receipt, {
            status: 200,
            headers: { "content-type": "application/json" },
        });
    } catch (error: any) {
        console.error(error);
        return NextResponse.json(
            { msg: error.toString(), error },
            { headers: { "content-type": "application/json" }, status: 500 }
        );
    }
}

```
