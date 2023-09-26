import 'dotenv/config';
import { HoroscopeHandlerKind } from '../../types/horoscope-response/project';
import { IHandler } from '../../types/handler/handler';
import { ServiceUtil } from '../util/service.util';

const service = new ServiceUtil();

export default () => ({
  indexerV2: {
    graphQL: `${process.env.INDEXER_V2_URL}${process.env.INDEXER_V2_GRAPHQL_PATH}`,
    api: `${process.env.INDEXER_V2_URL}${process.env.INDEXER_V2_API_PATH}`,
    chainDB: process.env.INDEXER_V2_DB,
    secret: process.env.INDEXER_V2_SECRET,
    chainId: process.env.INDEXER_CHAIN_ID,
  },

  crawlBlock: {
    startBlock: Number(process.env.START_BLOCK) || 0,
    numberOfBlockPerCall: Number(process.env.NUMBER_OF_BLOCK_PER_CALL) || 10,
  },

  optionsQueue: {
    keepJobCount: Number(process.env.KEEP_JOB_COUNT) || 10,
    attempts: Number(process.env.ATTEMPTS) || 3,
    repeat: Number(process.env.REPEAT) || 5000,
  },
});

export const HandleConfigMap = {
  [HoroscopeHandlerKind.Block]: false,
  [HoroscopeHandlerKind.Transaction]: false,
  [HoroscopeHandlerKind.Message]: false,
  [HoroscopeHandlerKind.Event]: false,
};

export async function getHandlersConfig(pathFile: string): Promise<IHandler[]> {
  const existingManifest = await service.getManifestData(pathFile);
  const handers: IHandler[] =
    existingManifest?.dataSources[0].mapping?.handlers;

  handers.map((item: any) => {
    HandleConfigMap[item.handler as HoroscopeHandlerKind] = true;
  });

  return handers;
}
