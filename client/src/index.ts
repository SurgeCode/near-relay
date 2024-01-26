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
    keys?: [nearAPI.KeyPair, nearAPI.KeyPair],
): Promise<nearAPI.Account | null> => {

    const {keyPair, accountId} = await getCorrectPublicKey(keys);

    if (!keyPair) {
        console.error('No correct key found for the given account ID.');
        return null;
    }

    const keyStore = new nearAPI.keyStores.InMemoryKeyStore();
    await keyStore.setKey(network, accountId, keyPair);

    const networkConfig = {
        networkId: network,
        nodeUrl: `https://rpc.${network}.near.org`,
        walletUrl: `https://wallet.${network}.near.org`,
        helperUrl: `https://helper.${network}.near.org`,
    };

    const near = new nearAPI.Near({
        ...networkConfig,
        deps: { keyStore },
    });

    return new nearAPI.Account(near.connection, accountId);
};

export const getCorrectPublicKey = async (keys: [nearAPI.KeyPair, nearAPI.KeyPair], username?: string): Promise<{keyPair: nearAPI.KeyPair, accountId: string}> => {
    for (const key of keys) {
        const publicKeyString = key.getPublicKey()?.toString();
        const { data } = await accountsByPublicKey(publicKeyString);

        const isValidKey = username ? data.some((id) => id === username) : data.length > 0;

        if (isValidKey) {
            return {
                keyPair: key,
                accountId: data?.[0]
            }
        }
    }

    throw new Error("No account found for key");
};

export const getMintAction = (media: string, reference: string, nft_contract_id: string): any => {
    const obj: FunctionCallAction = {
        type: "FunctionCall",
        params: {
            methodName: "mint",
            args: {
                metadata: {media:"dXQsx5qnoRxnAeNmZA3T3N-Q2WmbVzBwUooclwUKlgw"},
                nft_contract_id: "drop.mintbase1.near"
            },
            gas: "200000000000000",
            deposit: "10000000000000000000000"
        }
    };
    return obj;
}


