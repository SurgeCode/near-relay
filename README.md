
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

## @near-relay/client

The client-side module employs @near-js/biometric-ed25519 to facilitate the creation of keypairs using a passkey. These keypairs are then used to sign transactions, which are subsequently sent to a relayer for processing.

### Creating an Account

The createAccount function generates an arbitrary keypair using a passkey. The resulting public key, along with the specified account ID, is sent to the designated relayerUrl, which should be an API endpoint invoking the createAccount method on the server side.
```ts
const receipt = createAccount(relayerUrl: string, accountId: string)
```


### Relaying Transactions
The relayTransaction function simplifies the process of obtaining a keypair from a passkey, creating a transaction, signing it, encoding it, and sending it to a relayer – all in a single line of code. The relayerUrl parameter should correspond to the appropriate API route invoking the relay() method on the server side.
```ts
const receipt = relayTransaction(action: Action, receiverId: string, relayerUrl: string)
``````



