import { createKey} from "@near-js/biometric-ed25519";
import { Action, encodeSignedDelegate } from "@near-js/transactions";
import { Account, KeyPair} from "near-api-js";
import { encryptPrivateKey, storeEncryptedAccount } from "./utils";
import { createAccountRequest, getBiometricAccount, getPasswordBasedAccount } from "./account";
/**
 * Generates a new keypair locally and stores it in passkey, local storage, or uses a provided keypair,
 * then sends the account ID and publicKey to a relayer to be created on chain via a smart contract call
 * 
 * @param {string} relayerUrl - The URL of the server to send the request to.
 * @param {string} accountId - The ID of the account to create.
 * @param {Object} options - Optional parameters for account creation
 * @param {KeyPair} options.keyPair - Use a custom keypair instead of generating one
 * @param {string} options.password - Password for local storage encryption
 * @param {boolean} options.usePasskey - Whether to use passkey for key generation
 * @returns {Promise<any>} - A promise that resolves to the response from the server.
 */
export async function createAccount(relayerUrl: string, accountId: string, options: {
    keyPair?: KeyPair,
    password?: string,
    usePasskey?: boolean
} = {}): Promise<any> {
    let key: KeyPair;

    if (options.keyPair) {
        key = options.keyPair;
    } else if (options.usePasskey) {
        key = await createKey(accountId);
    } else {
        key = KeyPair.fromRandom('ed25519');
    }

    const publicKey = key.getPublicKey().toString();

    try {
        const response = await createAccountRequest(relayerUrl, accountId, publicKey);
        
        if (options.password) {
            const privateKey = (key as any).secretKey;
            const encryptedPrivateKey = encryptPrivateKey(privateKey, options.password);
            storeEncryptedAccount(encryptedPrivateKey, accountId, publicKey);
        }

        return response;
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
 * @param {string} network - 'mainnet | testnet'
 * @param {Object} options - Optional parameters
 * @param {Account} options.account - Optionally pass in local account
 * @param {string} options.password - Password for decrypting the private key (for password-based accounts)
 * @returns {Promise<any>} - Most likely a receipt (depends on format being returned by relayer).
 * @throws {Error} - If there is an error relaying the transaction.
 */
export async function relayTransaction(
    action: Action | Action[],
    receiverId: string,
    relayerUrl: string,
    network: string = 'mainnet',
    options: {
        account?: Account,
        password?: string
    } = {}
) {
    let account = options.account;

    if (options.password) {
        account = await getPasswordBasedAccount(receiverId, options.password, network);
    } else {
        account = await getBiometricAccount(network);
    }

    if (!account) {
        throw new Error("Failed to retrieve or create an account.");
    }

    const signedDelegate = await account.signedDelegate({
        actions: Array.isArray(action) ? action : [action],
        blockHeightTtl: 60,
        receiverId: receiverId,
    });

    return await relayRequest(signedDelegate, relayerUrl);
}


async function relayRequest(signedDelegate: any, relayerUrl: string): Promise<any> {
    const headers = new Headers({ "Content-Type": "application/json" });
    const bitteApiKey = process.env.BITTE_API_KEY;
    if (bitteApiKey) {
        headers.append("bitte-api-key", bitteApiKey);
    }

    try {
        const res = await fetch(relayerUrl, {
            method: "POST",
            mode: "cors",
            body: JSON.stringify([Array.from(encodeSignedDelegate(signedDelegate))]),
            headers: headers,
        });

        if (!res.ok) {
            const errorText = await res.text();
            throw new Error(`Error: ${res.status} ${res.statusText} - ${errorText}`);
        }

        return await res.json();
    } catch (e: any) {
        throw new Error(`Failed to relay transaction: ${e.message}`);
    }
}


