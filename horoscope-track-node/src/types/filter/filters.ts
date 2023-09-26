export interface IBlockFilter {
  startTime?: string;
  endTime?: string;
  limit?: number;
}

export interface ITransactionFilter {
  includeFailedTx?: boolean;
}

export interface IMessageFilter {
  type?: string;
  contractCall?: string;
  values?: { [key: string]: string };
}

export interface IEventAttributesFilter {
  type?: string;
  source?: any;
  attributes?: { key: string; value: string };
}

export interface IFilter {
  blockFilter?: IBlockFilter;
  transactionFilter?: ITransactionFilter;
  messageFilter?: IMessageFilter[];
  eventFilter?: IEventAttributesFilter[];
}
