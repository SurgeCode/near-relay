import { createKey, getKeys } from "@near-js/biometric-ed25519";
import {accountsByPublicKey} from '@mintbase-js/data'
import { Action, actionCreators, encodeSignedDelegate } from "@near-js/transactions";
import BN from "bn.js";
import { Account, KeyPair, Near, keyStores } from "near-api-js";
/**
 * Generates a new keypair locally and stores it in passkey and then sends the
 * account ID and publicKey to a relayer to be created on chain via a smart contract call
 * 
 * @param {string} relayerUrl - The URL of the server to send the request to.
 * @param {string} accountId - The ID of the account to create.
 * @param {KeyPair} keyPair - Instead of using biometric library add your own keypair
 * @returns {Promise<any>} - A promise that resolves to the response from the server.
 */
export async function createAccount(relayerUrl: string, accountId: string, keyPair?: KeyPair): Promise<any> {

    const key = keyPair || await createKey(accountId)

    const publicKey = key.getPublicKey().toString();

    try {
        const result = await fetch(relayerUrl, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                accountId,
                publicKey
            })
        });

        if (!result.ok) {
            const errorText = await result.text();
            throw new Error(`Error: ${result.status} ${result.statusText} - ${errorText}`);
        }

        return await result.json();
    } catch (error) {
        console.error('Failed to create account:', error);
        throw error;
    }

}
/**
 * Signs a transaction and sends it to a relayer to get dispatched 
 * 
 * @param {Action[]} action - The list of actions to include in the transaction.
 * @param {string} receiverId - The ID of the receiver.
 * @param {string} relayerUrl - Url for the relayer to which the tx will be sent
 * @param {Account?} account - Optionally pass in local account
 * @param {string?} network - 'mainnet | testnet'
 * @returns {Promise<any>} - Most likely a receipt (depends on format being returned by relayer).
 * @throws {Error} - If there is an error relaying the transaction.
 */
export async function relayTransaction(action: Action | Action[], receiverId: string, relayerUrl: string, network: string = 'mainnet', account?: Account) {
    if (!account) {
        const keys = await getKeys('this-shouldnt-be-required');
        const retrievedAccount = await getNearAccount(network, keys);
        if (!retrievedAccount) {
            throw new Error("Failed to retrieve account with provided keys.");
        }
        account = retrievedAccount;
    }

    const signedDelegate = await account.signedDelegate({
        actions: Array.isArray(action) ? action: [action],
        blockHeightTtl: 60,
        receiverId: receiverId,
    })


    try {
        const res = await fetch(relayerUrl, {
            method: "POST",
            mode: "cors",
            body: JSON.stringify([Array.from(encodeSignedDelegate(signedDelegate))]),
            headers: new Headers({ "Content-Type": "application/json" }),
        });

        if (!res.ok) {
            const errorText = await res.text();
            throw new Error(`Error: ${res.status} ${res.statusText} - ${errorText}`);
        }

        const result = await res.json();
        return result;
    } catch (e: any) {
        throw new Error(`Failed to relay transaction: ${e.message}`);
    }
}

/**
 * Retrieves a instaited NEAR account using the provided keys provided from the biometric method.
 * 
 * @param network - The network to connect to (e.g., 'testnet' or 'mainnet').
 * @param keys - An array containing two KeyPair objects returned from getKeys.
 * @returns A promise that resolves to the Account object or null if no correct key is found.
 */
export const getNearAccount = async (
    network: string,
    keys: [KeyPair, KeyPair],
): Promise<Account | null> => {

    const {keyPair, accountId} = await getCorrectPublicKey(keys);
  
    if (!keyPair) { 
        console.error('No correct key found for the given account ID.');
        return null;
    }

    const keyStore = new keyStores.InMemoryKeyStore();
    await keyStore.setKey(network, accountId, keyPair);

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

/**
 * Finds the correct public key from the pair returned in getKeys based on the associated username or if not provided any account data.
 * @param keys - An array of KeyPair objects.
 * @param username - The username to match against the associated data.
 * @returns The correct public key as a string.
 * @throws Error if no account is found for the key.
 */
export const getCorrectPublicKey = async (keys: [KeyPair, KeyPair], username?: string): Promise<{ keyPair: KeyPair, accountId: string }> => {
    for (const key of keys) {
        const publicKeyString = key.getPublicKey()?.toString();
        const { data } = await accountsByPublicKey(publicKeyString);

        if (data) {
            const isValidKey = username ? data.some((id) => id === username) : data.length > 0;

            if (isValidKey) {
                return {
                    keyPair: key,
                    accountId: data?.[0]
                };
            }
        }
    }

    throw new Error("No account found for key");
};

export const getMintAction = (nftContractId: string, media?: string, reference?: string): Action => {
    return actionCreators.functionCall(
        'mint',
        {
            metadata: {media: media, reference: reference},
               nft_contract_id: nftContractId
       },
        new BN("200000000000000"),
        new BN("10000000000000000000000")
      );
}


