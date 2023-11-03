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
  relayerAccountId?: string;
  /**
   * The NEAR relayer private key. Defaults to the value of the RELAYER_PRIVATE_KEY environment variable.
   */
  relayerPrivateKey?: string;
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
  const {
    network = process.env.NEAR_NETWORK,
    relayerAccountId = process.env.RELAYER_ACCOUNT_ID,
    relayerPrivateKey = process.env.RELAYER_PRIVATE_KEY,
  } = options;

  if (!network || !relayerAccountId || !relayerPrivateKey) {
    throw new Error("Network, relayerAccountId, and relayerPrivateKey must be provided as environment variables or arguments.");
  }

  const deserializeDelegate = deserialize(
    SCHEMA,
    SignedDelegate,
    Buffer.from(new Uint8Array(encodedDelegate))
  );

  return submitTransaction(network, deserializeDelegate, relayerAccountId, relayerPrivateKey);
}

/**
 * Submit a NEAR transaction.
 *
 * @param network - The NEAR network.
 * @param delegate - The signed delegate object.
 * @param relayerAccountId - The NEAR relayer account ID.
 * @param relayerPrivateKey - The NEAR relayer private key.
 * @returns A promise that resolves to the final execution outcome.
 * @throws An error if the submission fails.
 */
async function submitTransaction(
  network: string,
  delegate: SignedDelegate,
  relayerAccountId: string,
  relayerPrivateKey: string
): Promise<FinalExecutionOutcome> {
  try {
    const provider = new JsonRpcProvider({
      url: `https://rpc.${network}.near.org`,
    });

    const keyStore = new InMemoryKeyStore();
    await keyStore.setKey(network, relayerAccountId, KeyPair.fromString(relayerPrivateKey));

    const signer = new InMemorySigner(keyStore);

    const relayerAccount = new Account(
      {
        networkId: network,
        provider,
        signer,
        jsvmAccountId: "",
      },
      relayerAccountId
    );

    const result = await relayerAccount.signAndSendTransaction({
      actions: [signedDelegate(delegate)],
      receiverId: delegate.delegateAction.senderId,
    });

    return result;
  } catch (error) {
    throw error;
  }
}
