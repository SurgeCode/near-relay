//biometric createKey
//send key to server
//add create account route to server

import { createKey, getKeys } from "@near-js/biometric-ed25519";
import { Action } from "@near-wallet-selector/core";
import { Account, KeyPair, Near, keyStores } from "near-api-js";
import { accountsByPublicKey } from '@mintbase-js/data';


export async function createAccount(relayerUrl: string, accountId: string): Promise<any> {

    const key = await createKey(accountId)

    const publicKey = key.getPublicKey().toString();

    const result = await fetch(relayerUrl, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({
            accountId,
            publicKey
        })
    })

    return await result.json();
}

export async function sendTransaction(action: any) {
    const keys = await getKeys('surge.near');
    console.log("HERE")
    getNearAccount('testnet', keys)

}

export const getNearAccount = async (
    network: string,
    keys?: KeyPair[],
): Promise<Account | null> => {

    let correctKey = null
    let accountId = null

    for (const _key of keys) {
        const publicKeyString = _key.getPublicKey()?.toString();

        if (!publicKeyString) {
            return;
        }
        const { data } = await accountsByPublicKey(publicKeyString);

        if (data.length > 0) {
            accountId = data?.[0]
            correctKey = _key;
            break;
        }
    }


if (!correctKey) {
    console.error('No correct key found for the given account ID.');
    return null;
}

const keyStore = new keyStores.InMemoryKeyStore();
await keyStore.setKey(network, accountId, correctKey);

const networkConfig = {
    networkId: network,
    nodeUrl: `https://rpc.${network}.near.org`,
    walletUrl: `https://wallet.${network}.near.org`,
    helperUrl: `https://helper.${network}.near.org`,
};

const near = new Near({
    ...networkConfig,
    deps: { keyStore },
});

return new Account(near.connection, accountId);
  };

//getKey
//create action
//call geNearAccount
//create delegate
//sign delegate
//send to relayer