import { HANDLER_FILTER_TYPES } from '../../shared/constants/common';
import {
  IBlockFilter,
  IEventAttributesFilter,
  IMessageFilter,
  ITransactionFilter,
} from '../filter/filters';

export interface IHandler {
  handler: string;
  type: HANDLER_FILTER_TYPES;
  filter:
    | IBlockFilter
    | ITransactionFilter
    | IMessageFilter
    | IEventAttributesFilter;
}
