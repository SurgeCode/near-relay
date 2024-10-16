declare module '@near-relay/server' {
  import { FinalExecutionOutcome } from 'near-api-js/lib/providers';
    export interface RelayOptions {
      network?: string;
      accountId?: string;
      privateKey?: string;
    }
  
    export function relay(encodedDelegate: Buffer, options?: RelayOptions): Promise<FinalExecutionOutcome>;
  
    export function createAccount(accountId: string, publicKey: string): Promise<FinalExecutionOutcome>;
  }