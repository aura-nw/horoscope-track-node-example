import { CHAIN_DB_DEFAULT, CHAIN_ID_DEFAULT } from '../shared/constants/common';
import { BlockCheckpointService } from './block_checkpoint.service';
import * as util from 'util';
import * as appConfig from '../shared/configs/configuration';
import { INDEXER_API_V2 } from '../shared/constants/graphql.query';
import { ServiceUtil } from '../shared/util/service.util';
import { Job } from 'bullmq';
import {
  handleBlocks,
  handleEvents,
  handleMessages,
  handleTransactions,
} from '../mappings/mappingHandlers';
import { IBlockResponse } from '../types/horoscope-response/block_response';
import { HoroscopeHandlerKind } from '../types/horoscope-response/project';
import { filterAny } from '../shared/util/cosmos.utils';
import { PrismaClient } from '@prisma/client';
import {
  EventSource,
  IEventResponse,
} from '../types/horoscope-response/event_response';
import { ITransactionResponse } from '../types/horoscope-response/transaction_response';
import { IMessageResponse } from '../types/horoscope-response/message_response';
import { HandleConfigMap } from '../shared/configs/configuration';
import { IFilter } from '../types/filter/filters';
import {
  isValidBlock,
  isValidEvent,
  isValidMessage,
  isValidTx,
} from './filter.service';

const config = appConfig.default();
const service = new ServiceUtil();
const prisma = new PrismaClient();

const FilterTypeMap = {
  [HoroscopeHandlerKind.Block]: filterAny,
  [HoroscopeHandlerKind.Transaction]: filterAny,
  [HoroscopeHandlerKind.Message]: filterAny,
  [HoroscopeHandlerKind.Event]: filterAny,
};

const HandleTypeMap = {
  [HoroscopeHandlerKind.Block]: handleBlocks,
  [HoroscopeHandlerKind.Transaction]: handleTransactions,
  [HoroscopeHandlerKind.Message]: handleMessages,
  [HoroscopeHandlerKind.Event]: handleEvents,
};

export class DataHandleService {
  private blockCheckpoint: BlockCheckpointService;
  private chainDB: string;
  private chainId: string;
  constructor() {
    this.blockCheckpoint = new BlockCheckpointService();
    this.chainDB = config.indexerV2.chainDB || CHAIN_DB_DEFAULT;
    this.chainId = config.indexerV2.chainId || CHAIN_ID_DEFAULT;
  }

  public async handleData(_job: Job, filters: IFilter) {
    const startBlock = await this.blockCheckpoint.getCheckpoint(
      _job.name,
      config.crawlBlock.startBlock,
    );

    const graphqlQuery = {
      query: util.format(INDEXER_API_V2.GRAPH_QL.LAST_BLOCK, this.chainDB),
      variables: {},
      operationName: INDEXER_API_V2.OPERATION_NAME.LAST_BLOCK,
    };

    const response = await service.fetchDataFromGraphQL(
      graphqlQuery,
      config.indexerV2.graphQL,
      'POST',
    );

    const latestBlockNetwork = response?.data[this.chainDB]['block'][0].height;

    let endBlock = startBlock + config.crawlBlock.numberOfBlockPerCall;
    if (endBlock > latestBlockNetwork) {
      endBlock = latestBlockNetwork;
    }

    console.log(
      `[Start] ========================== [${startBlock}] ==> [${endBlock}]`,
    );
    /******************* Handle Data *********************/
    await this.indexBlockData(startBlock, endBlock, filters);

    /******************* Save Checkpoint *********************/
    await this.blockCheckpoint.setCheckpoint(_job.name, endBlock);
    console.log(
      `[Done] ========================== [${startBlock}] ==> [${endBlock}]`,
    );
  }

  private async indexBlockData(
    startBlock: number,
    endBlock: number,
    filters: IFilter,
  ) {
    /******************* Save Block Data *********************/
    const responseBlocks: IBlockResponse[] = await service.fetchDataFromGraphQL(
      {
        chainid: this.chainId,
        startBlock: startBlock,
        endBlock: endBlock,
      },
      config.indexerV2.api,
      'POST',
    );

    // insert data with transaction
    await prisma.$transaction(async (trx) => {
      for (const block of responseBlocks) {
        //index blocks content
        if (
          HandleConfigMap[HoroscopeHandlerKind.Block] &&
          isValidBlock(filters.blockFilter, block)
        )
          await this.indexBlockContent(block, trx);
        //index BEGIN_BLOCK_EVENT
        for (const event of block.events.filter(
          (b) => b.source === EventSource.BEGIN_BLOCK_EVENT,
        )) {
          if (
            HandleConfigMap[HoroscopeHandlerKind.Event] &&
            isValidEvent(filters.eventFilter, event)
          ) {
            await this.indexEvent(event, trx);
          }
        }

        // index transactions
        for (const transaction of block.txs) {
          if (
            HandleConfigMap[HoroscopeHandlerKind.Transaction] &&
            isValidTx(filters.transactionFilter, transaction)
          ) {
            await this.indexTransaction(transaction, trx);
          }

          if (HandleConfigMap[HoroscopeHandlerKind.Event]) {
            const eventTx = transaction.events.filter(
              (t) => t.tx_msg_index === null,
            );
            for (const event of eventTx) {
              if (isValidEvent(filters.eventFilter, event))
                await this.indexEvent(event, trx);
            }
          }
          //index messages
          const messages = transaction.messages;
          for (let i = 0; i < messages.length; i++) {
            if (
              HandleConfigMap[HoroscopeHandlerKind.Message] &&
              isValidMessage(filters.messageFilter, messages[i])
            ) {
              await this.indexMessageContent(messages[i], trx);
            }

            const eventInMsg = transaction.events.filter(
              (t) => t.tx_msg_index === i,
            );
            //index events in message
            for (const event of eventInMsg) {
              if (
                HandleConfigMap[HoroscopeHandlerKind.Event] &&
                isValidEvent(filters.eventFilter, event)
              )
                await this.indexEvent(event, trx);
            }
          }
        }
        //index END_BLOCK_EVENT
        if (HandleConfigMap[HoroscopeHandlerKind.Event]) {
          for (const event of block.events.filter(
            (b) => b.source === EventSource.END_BLOCK_EVENT,
          )) {
            if (isValidEvent(filters.eventFilter, event))
              await this.indexEvent(event, trx);
          }
        }
      }
    });
  }

  async indexBlockContent(block: IBlockResponse, trx: any) {
    this.indexData(HoroscopeHandlerKind.Block, block, trx);
  }
  async indexEvent(event: IEventResponse, trx: any) {
    this.indexData(HoroscopeHandlerKind.Event, event, trx);
  }
  async indexTransaction(transaction: ITransactionResponse, trx: any) {
    this.indexData(HoroscopeHandlerKind.Transaction, transaction, trx);
  }
  async indexMessageContent(message: IMessageResponse, trx: any) {
    this.indexData(HoroscopeHandlerKind.Message, message, trx);
  }
  async indexData(kind: HoroscopeHandlerKind, data: any, trx: any) {
    // TODO: do filter before call handle
    const checkFilter = true;
    // call handler with each kind
    if (checkFilter) {
      HandleTypeMap[kind](data, trx);
    }
  }
}
