
import 'dotenv/config'
import { deserialize } from 'borsh';
import { Account, connect, KeyPair } from "near-api-js";
import { SCHEMA, SignedDelegate, actionCreators } from "@near-js/transactions";
import { FinalExecutionOutcome } from 'near-api-js/lib/providers';
import BN from 'bn.js';
import { InMemoryKeyStore } from 'near-api-js/lib/key_stores';

const relayerAccountId: string = process.env.RELAYER_ACCOUNT_ID || '';
const relayerPrivateKey: string = process.env.RELAYER_PRIVATE_KEY || '';
const network: string = process.env.NEAR_NETWORK || '';

/**
 * Configuration options for the relay function.
 */
export interface RelayOptions {
  network?: string;
  accountId?: string;
  privateKey?: string;
}

/**
 * Relay a signed transaction.
 *
 * @param encodedDelegate - The encoded signed transaction to relay.
 * @param options - Configuration options for the relay function.
 * @returns A promise that resolves to the final execution outcome.
 * @throws An error if required options are missing.
 */
export async function relay(encodedDelegate: Buffer, options: RelayOptions = {}): Promise<FinalExecutionOutcome> {

  if (!network) {
    throw new Error("Network must be provided as an environment variable or argument.");
  }
  if (!relayerAccountId) {
    throw new Error("Relayer account ID must be provided as an environment variable or argument.");
  }
  if (!relayerPrivateKey) {
    throw new Error("Relayer private key must be provided as an environment variable or argument.");
  }

  const deserializedTx: SignedDelegate = deserialize(SCHEMA.SignedDelegate, Buffer.from(encodedDelegate)) as SignedDelegate;
  
  const relayerAccount: Account = await getRelayer();
  
  const receipt = await relayerAccount.signAndSendTransaction({
    actions: [actionCreators.signedDelegate(deserializedTx)],
    receiverId: deserializedTx.delegateAction.senderId
  });

  return receipt;
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
    const relayerAccount = await getRelayer();

    const result = await relayerAccount.functionCall({
      contractId: network === "mainnet" ? "near" : "testnet",
      methodName: "create_account",
      args: {
        new_account_id: accountId,
        new_public_key: publicKey,
      },
      gas: new BN("300000000000000"),
      attachedDeposit: new BN("0"),
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
async function getRelayer(): Promise<Account> {
    const keyStore: InMemoryKeyStore = new InMemoryKeyStore();
    await keyStore.setKey(network, relayerAccountId, KeyPair.fromString(relayerPrivateKey));

    const config = {
        networkId: network,
        keyStore,
        nodeUrl: `https://rpc.${network}.near.org`,
    };

    const near = await connect(config);
    return await near.account(relayerAccountId);
}