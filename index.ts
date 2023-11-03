import { deserialize } from "borsh";
import { SCHEMA } from "./near-schema";
import { SignedDelegate } from "@near-js/transactions";
import { Account } from "@near-js/accounts";
import { KeyPair } from "@near-js/crypto";
import { InMemoryKeyStore } from "@near-js/keystores";
import { JsonRpcProvider } from "@near-js/providers";
import { InMemorySigner } from "@near-js/signers";
import { actionCreators } from "@near-js/transactions";
import { FinalExecutionOutcome } from "@near-wallet-selector/core";

export const { signedDelegate } = actionCreators;
const keyStore = new InMemoryKeyStore();

export default async function relay(signedTx: any,
  network: string = 'testnet',
  relayerAccountId: string,
  relayerPrivateKey: string): Promise<FinalExecutionOutcome> {

  const deserializeDelegate = deserialize(
    SCHEMA,
    SignedDelegate,
    Buffer.from(new Uint8Array(signedTx))
  );


  return submitTransaction({
    network: network,
    delegate: deserializeDelegate,
    relayerAccountId,
    relayerPrivateKey
  });
}

const submitTransaction = async ({
  network = "testnet",
  delegate,
  relayerAccountId,
  relayerPrivateKey
}: {
  network: string;
  delegate: SignedDelegate;
  relayerAccountId: string;
  relayerPrivateKey: string;
}): Promise<FinalExecutionOutcome> => {

  try {

    const provider = new JsonRpcProvider({
      url: `https://rpc.${network}.near.org`,
    });

    await keyStore.setKey(network, relayerAccountId, KeyPair.fromString(relayerPrivateKey))

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
};

