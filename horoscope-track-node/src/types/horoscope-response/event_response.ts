import { IAttributeResponse } from './attribute_response';
import { IBlockResponse } from './block_response';
import { IMessageResponse } from './message_response';
import { ITransactionResponse } from './transaction_response';

export enum EventSource {
  BEGIN_BLOCK_EVENT = 'BEGIN_BLOCK_EVENT',
  END_BLOCK_EVENT = 'END_BLOCK_EVENT',
  TX_EVENT = 'TX_EVENT',
}

export interface IEventResponse {
  type: string;
  source: EventSource;
  tx_msg_index?: number | null;
  attributes: IAttributeResponse[];

  // relation
  block?: IBlockResponse;
  transaction?: ITransactionResponse;
  message?: IMessageResponse;
}
