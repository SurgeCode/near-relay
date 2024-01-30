declare module '@near-relay/server' {
    import { FinalExecutionOutcome } from '@near-wallet-selector/core';
  
    export interface RelayOptions {
      network?: string;
      accountId?: string;
      privateKey?: string;
    }
  
    export function relay(encodedDelegate: Uint8Array, options?: RelayOptions): Promise<FinalExecutionOutcome>;
  
    export function createAccount(accountId: string, publicKey: string): Promise<FinalExecutionOutcome>;
  }