# @near-relay 

## Overview

@near-relay is a powerful library that simplifies meta transactions and account management on the NEAR blockchain. It provides a seamless way to create accounts and relay transactions without users needing to manage gas fees directly.

## Key Features

- **Meta Transactions**: Create and use relayers to delegate transaction submission
- **Password-Based Creation**: Create accounts securely using a password
- **Biometric-Based Creation**: Create accounts using device passkeys and biometric authentication
- **KeyPair-Based Creation**: Create accounts using custom ED25519 keypairs

## Installation

Install the library using your preferred package manager:

```bash
# Using pnpm
pnpm i @near-relay/client @near-relay/server

```

## Client-Side Usage

### Creating an Account

The `createAccount` function supports multiple account creation methods:

```typescript
import { createAccount } from '@near-relay/client';

// Passkey-based account creation (default)
const passkeyReceipt = await createAccount(
  '/api/relayer/create-account', 
  'myaccountid.near'
);

// Password-based account creation
const passwordReceipt = await createAccount(
  '/api/relayer/create-account', 
  'myaccountid.near',
  { password: 'securepassword' }
);

// Custom keypair account creation
import { KeyPair } from 'near-api-js';
const keyPair = KeyPair.fromRandom('ed25519');
const keypairReceipt = await createAccount(
  '/api/relayer/create-account', 
  'myaccountid.near',
  { keyPair }
);
```

### Relaying Transactions

The `relayTransaction` function simplifies transaction submission:

```typescript
import { relayTransaction, actionCreators } from '@near-relay/client';

// Create a function call action
const action = actionCreators.functionCall(
  'set_greeting', //method name
  { greeting: "hello" }, //params
  BigInt(30000000000000), // gas
  BigInt(0) // deposit
);

// Relay the transaction
const receipt = await relayTransaction(
  action,           // Transaction action
  'contract.near',  // Receiver contract
  '/api/relayer',   // Relay endpoint
  'mainnet',        // Network
  {                 // Optional account authentication
    password: 'securepassword'
  }
);
```

## Server-Side Implementation

### Environment Variables

Configure your relayer account:

```typescript
// .env file
RELAYER_ACCOUNT_ID=your_relayer_account.near
RELAYER_PRIVATE_KEY=your_private_key
NEAR_NETWORK=mainnet  # or 'testnet'
```

### Create Account Endpoint

```typescript
import { NextRequest, NextResponse } from "next/server";
import { createAccount } from '@near-relay/server';
import { FinalExecutionStatus } from "near-api-js/lib/providers";

export async function POST(req: NextRequest) {
    try {
        const { publicKey, accountId } = await req.json();

        const receipt = await createAccount(accountId, publicKey);
        
        // Check for successful account creation
        if ((receipt.status as FinalExecutionStatus).SuccessValue === 'ZmFsc2U=') {
            return NextResponse.json(
                { error: "Account creation failed" },
                { status: 409 }
            );
        }

        return NextResponse.json(receipt, { status: 201 });
    } catch (error: any) {
        return NextResponse.json(
            { error: error.message || "Internal server error" },
            { status: 500 }
        );
    }
}
```

### Transaction Relay Endpoint

```typescript
import { NextRequest, NextResponse } from "next/server";
import { relay } from '@near-relay/server';

export async function POST(req: NextRequest) {
    try {
        const transaction: Buffer = await req.json();
        const receipt = await relay(transaction);

        return NextResponse.json(receipt, { status: 200 });
    } catch (error: any) {
        return NextResponse.json(
            { error: error.toString() },
            { status: 500 }
        );
    }
}
```
