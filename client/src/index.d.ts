import { Action } from "@near-js/transactions";
import { Account, KeyPair } from "near-api-js";
/**
 * Generates a new keypair locally and stores it in passkey and then sends the
 * account ID and publicKey to a relayer to be created on chain via a smart contract call
 *
 * @param {string} relayerUrl - The URL of the server to send the request to.
 * @param {string} accountId - The ID of the account to create.
 * @returns {Promise<any>} - A promise that resolves to the response from the server.
 */
export declare function createAccount(relayerUrl: string, accountId: string): Promise<any>;
/**
 * Signs a transaction and sends it to a relayer to get dispatched
 *
 * @param {Action[]} action - The list of actions to include in the transaction.
 * @param {string} receiverId - The ID of the receiver.
 * @param {string} network - tesnet | mainnet.
 * @returns {Promise<any>} - Most likely a receipt (depends on format being returned by relayer).
 * @throws {Error} - If there is an error relaying the transaction.
 */
export declare function relayTransaction(action: Action, receiverId: string, relayerUrl: string): Promise<any>;
/**
 * Retrieves a instaited NEAR account using the provided keys provided from the biometric method.
 *
 * @param network - The network to connect to (e.g., 'testnet' or 'mainnet').
 * @param keys - An array containing two KeyPair objects returned from getKeys.
 * @returns A promise that resolves to the Account object or null if no correct key is found.
 */
export declare const getNearAccount: (network: string, keys: [KeyPair, KeyPair]) => Promise<Account | null>;
/**
 * Finds the correct public key from the pair returned in getKeys based on the associated username or if not provided any account data.
 * @param keys - An array of KeyPair objects.
 * @param username - The username to match against the associated data.
 * @returns The correct public key as a string.
 * @throws Error if no account is found for the key.
 */
export declare const getCorrectPublicKey: (keys: [KeyPair, KeyPair], username?: string) => Promise<{
    keyPair: KeyPair;
    accountId: string;
}>;
export declare const getMintAction: (nftContractId: string, media?: string, reference?: string) => Action;
