import { IBlockResponse } from './block_response';
import { ITransactionResponse } from './transaction_response';

export interface IMessageResponse {
  type: string;
  sender: string;
  content: any;
  index: number;

  // relation
  block?: IBlockResponse;
  transaction?: ITransactionResponse;
}
