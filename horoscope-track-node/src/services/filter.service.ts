import {
  COSMOS_TX_SUCCESS_CODE,
  HANDLER_FILTER_TYPES,
} from '../shared/constants/common';
import {
  IBlockFilter,
  IEventAttributesFilter,
  IMessageFilter,
  ITransactionFilter,
} from '../types/filter/filters';
import isEqual from 'lodash/isEqual';
import { IBlockResponse } from '../types/horoscope-response/block_response';
import { ITransactionResponse } from '../types/horoscope-response/transaction_response';
import { IMessageResponse } from '../types/horoscope-response/message_response';
import { IEventResponse } from '../types/horoscope-response/event_response';

export function findFilters(handlers: any): {
  blockFilter: IBlockFilter;
  transactionFilter: ITransactionFilter;
  messageFilter: IMessageFilter[];
  eventFilter: IEventAttributesFilter[];
} {
  let blockFilter!: IBlockFilter;
  let transactionFilter!: ITransactionFilter;
  let messageFilter!: IMessageFilter[];
  let eventFilter!: IEventAttributesFilter[];

  handlers?.forEach((handler: any) => {
    switch (handler.type) {
      case HANDLER_FILTER_TYPES.BLOCK:
        blockFilter = handler.filter;
        break;
      case HANDLER_FILTER_TYPES.TRANSACTION:
        transactionFilter = handler.filter;
        break;
      case HANDLER_FILTER_TYPES.MESSAGE:
        messageFilter = handler.filter;
        break;
      case HANDLER_FILTER_TYPES.EVENT:
        eventFilter = handler.filter;
        break;
      default:
        break;
    }
  });

  return {
    blockFilter,
    transactionFilter,
    messageFilter,
    eventFilter,
  };
}

export function isValidBlock(
  filter: IBlockFilter | undefined,
  block: IBlockResponse,
): boolean {
  if (!filter) return true;

  if (!block) return false;

  if (
    new Date(filter?.startTime as any) > new Date(block.time) ||
    new Date(filter?.endTime as any) < new Date(block.time)
  ) {
    return false;
  }

  return true;
}

export function isValidTx(
  filter: ITransactionFilter | undefined,
  tx: ITransactionResponse,
): boolean {
  if (!filter || filter?.includeFailedTx) {
    return true;
  }

  if (!tx) return false;

  if (tx.code !== COSMOS_TX_SUCCESS_CODE) {
    return false;
  }

  return true;
}

export function isValidMessage(
  filters: IMessageFilter[] | undefined,
  message: IMessageResponse,
): boolean {
  if (!filters) return true;

  if (!message) return false;

  let result = false;

  for (const filter of filters) {
    const typeMatch = !filter.type || filter.type === message.type;
    const contractCallMatch =
      !filter.contractCall ||
      message.content?.msg?.includes(filter.contractCall);
    const valuesMatch =
      !filter.values ||
      Object.keys(filter.values as any).every(
        (key) => filter.values![key] === message.content[key],
      );

    if (typeMatch && contractCallMatch && valuesMatch) {
      result = true;
    }
  }

  return result;
}

export function isValidEvent(
  filters: IEventAttributesFilter[] | undefined,
  event: IEventResponse,
): boolean {
  if (!filters) return true;

  if (!event) return false;

  let result = false;

  for (const filter of filters) {
    const typeMatch = !filter.type || filter.type === event.type;
    const sourceMatch = !filter.source || filter.source === event.source;
    const attributeMatch =
      !filter.attributes ||
      event.attributes.some((attribute) =>
        isEqual(attribute, filter.attributes),
      );

    if (typeMatch && sourceMatch && attributeMatch) {
      result = true;
    }
  }

  return result;
}
