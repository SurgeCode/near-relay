import { createKey, getKeys } from "@near-js/biometric-ed25519";
import * as nearAPI from "near-api-js";
import { accountsByPublicKey } from '@mintbase-js/data';
import { encodeSignedDelegate } from "@near-js/transactions";
import { Action, FunctionCallAction } from "@near-wallet-selector/core";
import { createAction } from "@near-wallet-selector/wallet-utils";

/**
 * Generates a new keypair locally and stores it in passkey and then sends the
 * account ID and publicKey to a relayer to be created on chain via a smart contract call
 * 
 * @param {string} relayerUrl - The URL of the server to send the request to.
 * @param {string} accountId - The ID of the account to create.
 * @returns {Promise<any>} - A promise that resolves to the response from the server.
 */
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

/**
 * Signs a transaction and sends it to a relayer to get dispatched 
 * 
 * @param {Action[]} action - The list of actions to include in the transaction.
 * @param {string} receiverId - The ID of the receiver.
 * @param {string} network - tesnet | mainnet.
 * @returns {Promise<any>} - Most likely a receipt (depends on format being returned by relayer).
 * @throws {Error} - If there is an error relaying the transaction.
 */
export async function relayTransaction(action: any) {
    const keys = await getKeys('this-shouldnt-be-required');
    const account = await getNearAccount('mainnet', keys);

    //test
    console.log(account)
    console.log(action)
    
    const x = await account.addKey("fhjdskjfhsdfjsdpfjdlçsçlsdf")

    // const signedDelegate = await account.signedDelegate({
    //     actions: [createAction(action)],
    //     blockHeightTtl: 60,
    //     receiverId: '1.minsta.mintbus.near',
    // })

    // console.log(signedDelegate)

    // try {
    //     const res = await fetch("/api/relay", {
    //         method: "POST",
    //         mode: "cors",
    //         body: JSON.stringify(Array.from(encodeSignedDelegate(signedDelegate))),
    //         headers: new Headers({ "Content-Type": "application/json" }),
    //     });

    //     if (res.ok) {
    //         const result = await res.json();
    //         return result;
    //     }
    // } catch (e) {
    //     throw new Error('Error relaying transaction');
    // }
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


