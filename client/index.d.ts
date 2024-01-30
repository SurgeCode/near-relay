import { Action } from "@near-js/transactions";
import { Account, KeyPair } from "near-api-js";

/**
 * Generates a new keypair locally and stores it in passkey and then sends the
 * account ID and publicKey to a relayer to be created on chain via a smart contract call
 * 
 * @param relayerUrl - The URL of the server to send the request to.
 * @param accountId - The ID of the account to create.
 * @returns A promise that resolves to the response from the server.
 */
export declare function createAccount(relayerUrl: string, accountId: string): Promise<any>;

/**
 * Signs a transaction and sends it to a relayer to get dispatched 
 * 
 * @param action - The list of actions to include in the transaction.
 * @param receiverId - The ID of the receiver.
 * @param relayerUrl - The URL of the relayer.
 * @returns Most likely a receipt (depends on format being returned by relayer).
 * @throws If there is an error relaying the transaction.
 */
export declare function relayTransaction(action: Action, receiverId: string, relayerUrl: string): Promise<any>;

/**
 * Retrieves a instantiated NEAR account using the provided keys provided from the biometric method.
 * 
 * @param network - The network to connect to (e.g., 'testnet' or 'mainnet').
 * @param keys - An array containing two KeyPair objects returned from getKeys.
 * @returns A promise that resolves to the Account object or null if no correct key is found.
 */
export declare function getNearAccount(network: string, keys: [KeyPair, KeyPair]): Promise<Account | null>;

/**
 * Finds the correct public key from the pair returned in getKeys based on the associated username or if not provided any account data.
 * @param keys - An array of KeyPair objects.
 * @param username - The username to match against the associated data.
 * @returns The correct public key as a string.
 * @throws Error if no account is found for key.
 */
export declare function getCorrectPublicKey(keys: [KeyPair, KeyPair], username?: string): Promise<{ keyPair: KeyPair, accountId: string }>;

/**
 * Generates a mint action for a given NFT contract.
 * 
 * @param nftContractId - The ID of the NFT contract.
 * @param media - Optional media metadata for the mint action.
 * @param reference - Optional reference metadata for the mint action.
 * @returns An Action object representing the mint action.
 */
export declare function getMintAction(nftContractId: string, media?: string, reference?: string): Action;
