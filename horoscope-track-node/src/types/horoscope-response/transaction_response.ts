import { IBlockResponse } from './block_response';
import { IEventResponse } from './event_response';
import { IMessageResponse } from './message_response';

export interface ITransactionResponse {
  height: number;
  hash: string;
  code: number;
  codespace: string;
  memo: string;
  index: number;
  messages: IMessageResponse[];
  events: IEventResponse[];
  // relation
  block: IBlockResponse;
}
