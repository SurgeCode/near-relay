import { deserialize } from "borsh";
import { SCHEMA } from "../near-schema";
import { SignedDelegate } from "@near-js/transactions";
import { Account } from "@near-js/accounts";
import { KeyPair } from "@near-js/crypto";
import { InMemoryKeyStore } from "@near-js/keystores";
import { JsonRpcProvider } from "@near-js/providers";
import { InMemorySigner } from "@near-js/signers";
import { actionCreators } from "@near-js/transactions";
import { FinalExecutionOutcome } from "@near-wallet-selector/core";
import 'dotenv/config'
export const { signedDelegate } = actionCreators;


const relayerAccountId: any = process.env.RELAYER_ACCOUNT_ID 
const relayerPrivateKey: any = process.env.RELAYER_PRIVATE_KEY
const network:any = process.env.NEAR_NETWORK

/**
 * Configuration options for the relay function.
 */
export interface RelayOptions {
  /**
   * The NEAR network. Defaults to the value of the NEAR_NETWORK environment variable.
   */
  network?: string;
  /**
   * The NEAR relayer account ID. Defaults to the value of the RELAYER_ACCOUNT_ID environment variable.
   */
  accountId?: string;
  /**
   * The NEAR relayer private key. Defaults to the value of the RELAYER_PRIVATE_KEY environment variable.
   */
  privateKey?: string;
}

/**
 * Relay a signed transaction.
 *
 * @param encodedDelegate - The encoded signed transaction to relay. To obtain this, you can use the following:
 *  Call the signedDelegate with the near-api-js account object.
 *  Encode the signedDelegate to a Uint8Array:
 * @example
 *    const signedDelegate = await accountObj.signedDelegate({});
 *    const encodedDelegate = new Uint8Array(signedDelegate.encode());
 *    
 * @param options - Configuration options for the relay function.
 * @returns A promise that resolves to the final execution outcome.
 * @throws An error if required options are missing.
 */

export async function relay(encodedDelegate: Uint8Array, options: RelayOptions = {}): Promise<FinalExecutionOutcome> {

  if (!network || !relayerAccountId || !relayerPrivateKey) {
    throw new Error("Network, relayerAccountId, and relayerPrivateKey must be provided as environment variables or arguments.");
  }

  const deserializeDelegate = deserialize(
    SCHEMA,
    SignedDelegate,
    Buffer.from(new Uint8Array(encodedDelegate))
  );

  return submitTransaction(deserializeDelegate);
}

/**
 * Submit a NEAR transaction.
 * @param delegate - The signed delegate object.
 * @returns A promise that resolves to the final execution outcome.
 * @throws An error if the submission fails.
 */
async function submitTransaction(
  delegate: SignedDelegate,
): Promise<FinalExecutionOutcome> {
  try {
    const relayerAccount = await getRelayer();

    const result = await relayerAccount.signAndSendTransaction({
      actions: [signedDelegate(delegate)],
      receiverId: delegate.delegateAction.senderId,
    });

    return result;
  } catch (error) {
    throw error;
  }
}


/**
 * Creates a new account with the given account ID and public key.
 *
 * @param {string} accountId - The ID of the new account to be created.
 * @param {string} publicKey - The public key to be associated with the new account.
 * @return {Promise<FinalExecutionOutcome>} The result of the account creation process.
 */
export async function createAccount(
    accountId: string,
    publicKey: string,
  ): Promise<FinalExecutionOutcome> {

    try { 
      const relayerAccount = await getRelayer()  
  
      const result = await relayerAccount.functionCall({
        contractId: network == "mainnet" ? "near" : "testnet",
        methodName: "create_account",
        args: {
          new_account_id: accountId,
          new_public_key: publicKey,
        },
        gas: "300000000000000",
        attachedDeposit: "0",
      });
  
      return result;
    } catch (error) {
      throw error;
    }
  }

  /**
   * Retrieves the relayer account using the provided network and account ID.
   *
   * @return {Promise<Account>} The relayer account object.
   */
  async function getRelayer(){
    
    const provider = new JsonRpcProvider({
        url: `https://rpc.${network}.near.org`,
      });
  
      const keyStore = new InMemoryKeyStore();
      await keyStore.setKey(network, relayerAccountId, KeyPair.fromString(relayerPrivateKey));
  
      const signer = new InMemorySigner(keyStore);
  
        return new Account(
        {
          networkId: network,
          provider,
          signer,
          jsvmAccountId: "",
        },
        relayerAccountId
      );
  }