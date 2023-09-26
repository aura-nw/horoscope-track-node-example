import { IEventResponse } from './event_response';
import { ITransactionResponse } from './transaction_response';
export interface IBlockResponse {
  height: number;
  hash: string;
  time: Date;
  events: IEventResponse[];
  txs: ITransactionResponse[];
}
