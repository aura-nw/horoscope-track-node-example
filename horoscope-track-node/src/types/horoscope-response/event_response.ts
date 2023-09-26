import { IAttributeResponse } from './attribute_response';

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
}
