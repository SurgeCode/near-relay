import { getKeys } from "@near-js/biometric-ed25519";
import { decryptPrivateKey } from "./utils";
import { Account, KeyPair, keyStores, Near } from "near-api-js";
import { accountsByPublicKey } from "@mintbase-js/data";

/**
 * Fetches account creation from the relayer.
 * @param {string} relayerUrl - The URL of the relayer.
 * @param {string} accountId - The account ID to be created.
 * @param {string} publicKey - The public key associated with the account.
 * @returns {Promise<any>} The response from the relayer.
 * @throws {Error} If the fetch request fails.
 */
export async function createAccountRequest(relayerUrl: string, accountId: string, publicKey: string): Promise<any> {
    const result = await fetch(relayerUrl, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({ accountId, publicKey })
    });

    if (!result.ok) {
        const errorText = await result.text();
        throw new Error(`Error: ${result.status} ${result.statusText} - ${errorText}`);
    }

    return result.json();
}

export async function getBiometricAccount(network: string): Promise<Account> {
    const keys = await getKeys('this-shouldnt-be-required');
    const retrievedAccount = await getNearAccount(network, keys);
    if (!retrievedAccount) {
        throw new Error("Failed to retrieve account with provided keys.");
    }
    return retrievedAccount;
}

export async function getPasswordBasedAccount(password: string, network: string): Promise<Account> {
    // TODO: Add support for multiple accounts later
    const storedAccounts = Object.keys(localStorage).filter(key => key.startsWith('near-account-'));
    if (storedAccounts.length === 0) {
        throw new Error("No stored accounts found.");
    }
    const storedAccount = localStorage.getItem(storedAccounts[0]);
    if (!storedAccount) {
        throw new Error("Failed to retrieve stored account.");
    }
    const { encryptedPrivateKey, publicKey, accountId } = JSON.parse(storedAccount);
    const privateKey = decryptPrivateKey(encryptedPrivateKey, password);
    const keyPair = KeyPair.fromString(privateKey);
    const account = await getNearAccount(network, keyPair, accountId);
    if (!account) {
        throw new Error("Failed to retrieve account with provided keys.");
    }
    return account;
}

/**
 * Retrieves an instantiated NEAR account using the provided key(s) from the biometric method.
 * 
 * @param network - The network to connect to (e.g., 'testnet' or 'mainnet').
 * @param keys - A single KeyPair object or an array containing two KeyPair objects.
 * @param accountId - The account ID (required when a single KeyPair is provided).
 * @returns A promise that resolves to the Account object or null if no correct key is found.
 */
export const getNearAccount = async (
    network: string,
    keys: KeyPair | [KeyPair, KeyPair],
    accountId?: string
): Promise<Account | null> => {
    let keyPair: KeyPair;

    if (Array.isArray(keys)) {
        ({ keyPair, accountId } = await getCorrectPublicKey(keys));
    } else {
        if (!accountId) {
            throw new Error('Account ID is required when providing a single KeyPair');
        }
        keyPair = keys;
    }

    if (!keyPair || !accountId) {
        console.error('No correct key or account ID found.');
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


