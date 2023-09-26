export const BULL_JOB_NAME = {
  DATA: 'handle-data',
  BLOCK: 'handle-block',
  TX: 'handle-tx',
  EVENT: 'handle-event',
  MESSAGE: 'handle-message',
};

export const BULL_MQ = 'handle-bullmq';
export const YAML_DEFAULT = './project.yaml';

export enum HANDLER_FILTER_TYPES {
  BLOCK = 'block',
  TRANSACTION = 'transaction',
  MESSAGE = 'message',
  EVENT = 'event',
}

export const COSMOS_TX_SUCCESS_CODE = 0;
export const CHAIN_DB_DEFAULT = 'auratestnet';
export const CHAIN_ID_DEFAULT = 'auratestnet-2';
