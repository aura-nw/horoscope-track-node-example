import 'dotenv/config';
import { BULL_JOB_NAME, YAML_DEFAULT } from './shared/constants/common';
import * as appConfig from './shared/configs/configuration';
import { Job, Worker } from 'bullmq';
import BullableService from './base/bullable.service';
import { DataHandleService } from './services/data_handle.service';
import { IHandler } from './types/handler/handler';
import { findFilters } from './services/filter.service';
import { IFilter } from './types/filter/filters';

const config = appConfig.default();
const dataHanlde = new DataHandleService();
const bullableService = new BullableService();

bullableService.createJob(BULL_JOB_NAME.DATA, BULL_JOB_NAME.DATA, {
  removeOnFail: config.optionsQueue.keepJobCount,
  removeOnComplete: config.optionsQueue.keepJobCount,
  attempts: config.optionsQueue.attempts,
  repeat: {
    every: config.optionsQueue.repeat,
  },
});

const main = async () => {
  const handlers: IHandler[] = await appConfig.getHandlersConfig(YAML_DEFAULT);

  const filters: IFilter = findFilters(handlers);

  console.log(filters);
  const worker = new Worker(BULL_JOB_NAME.DATA, async (job: Job) => {
    const startTime = new Date();
    await dataHanlde.handleData(job, filters);
    const endTime = new Date();

    console.log(`Time run: ${endTime.getTime() - startTime.getTime()}`);
  });

  console.log('Worker started!');

  worker.on('progress', (job: Job, progress: number | object) => {
    // Do something with the return value.
    console.log(`Job ID: ${job.id} - Progress: ${progress}`);
  });

  worker.on('failed', (_job: any, err: any) => {
    console.log(`Job ID: ${_job.id} - err: ${err}`);
    // Do something with the return value.
    return;
  });
  worker.on('error', (err) => {
    // log the error
    console.error(err);
  });
};

main().catch((err) => {
  console.log(err);
});
