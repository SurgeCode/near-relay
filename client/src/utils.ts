import * as CryptoJS from 'crypto-js';
import { Action, actionCreators } from "@near-js/transactions";
import BN from "bn.js";

/**
 * Stores an encrypted account in local storage.
 * @param {string} encryptedPrivateKey - The encrypted private key.
 * @param {string} accountId - The account ID.
 * @param {string} publicKey - The public key of the account.
 */
export function storeEncryptedAccount(encryptedPrivateKey: string, accountId: string, publicKey: string): void {
    const storageItem = {
        publicKey,
        encryptedPrivateKey,
        accountId
    };
    localStorage.setItem(`near-account-${accountId}`, JSON.stringify(storageItem));
}

/**
 * Helper function to encrypt private key.
 * @param {string} privateKey - The private key to encrypt.
 * @param {string} password - The password used for encryption.
 * @returns {string} The encrypted private key.
 */
export function encryptPrivateKey(privateKey: string, password: string): string {
    return CryptoJS.AES.encrypt(privateKey, password).toString();
}

/**
 * Helper function to decrypt private key.
 * @param {string} encryptedPrivateKey - The encrypted private key.
 * @param {string} password - The password used for decryption.
 * @returns {string} The decrypted private key.
 */
export function decryptPrivateKey(encryptedPrivateKey: string, password: string): string {
    const bytes = CryptoJS.AES.decrypt(encryptedPrivateKey, password);
    return bytes.toString(CryptoJS.enc.Utf8);
}

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



