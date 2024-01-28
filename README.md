
# @near-relay

Tooling to simplify metatransactions development to be as easy as possible on NEAR.

Metatransactions are a way to allow a signed transaction to be delegated to another account to be submitted (relayer). This allows the signer to not have to pay for gas allowing a better onboarding experience.

## @near-relay/server

The server side of the package exposes methods to more easily submit delegated transactions in this case "relay" and "createAccount"

Here is an example of how these could be used in a simple server

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

The client side uses @near-js/biometric-ed25519 to handle creation of keypairs using passkey which then get used to sign transactions which are then sent to a relayer

Create account creates an arbitrary keypair using passkey. Its public key along with the account ID received as argument gets sent to the relayerUrl which in this case should be an api endpoint that calls the @near-relay/server createAccount method
```ts
const receipt = createAccount(relayerUrl: string, accountId: string)
```


Relay transaction is a method that allows you to easily get the keypair from passkey, create a transaction sign it, encode it and send it to a relayer with a single line
In this case relayer url should be the correponding api route which calls relay()
```ts
const receipt = relayTransaction(action: Action, receiverId: string, relayerUrl: string)
``````




