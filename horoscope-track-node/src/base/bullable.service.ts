import { Job, JobsOptions, Queue, QueueOptions, RedisOptions } from 'bullmq';
import { BULL_JOB_NAME, BULL_MQ } from '../shared/constants/common';
import _ from 'underscore';

export const DEFAULT_PREFIX = process.env.DEFAULT_PREFIX || 'bull';

export default class BullableService {
  private qm?: Queue;

  constructor() {
    this.qm = new Queue(BULL_JOB_NAME.DATA, {
      connection: this.getRedisConnection(),
    });
  }

  // listHandler to save all from decorator
  private listHandler?: {
    opts: QueueOptions;
    fn: (payload: any) => Promise<void>;
  }[];

  public async createJob(
    queueName: string,
    jobType?: string,
    opts?: JobsOptions,
  ): Promise<Job> {
    return await this.getQueueManager().add(queueName, jobType, opts);
  }

  public async setHandler(
    opts: QueueOptions,
    fn: (payload: any) => Promise<void>,
  ): Promise<void> {
    // just put it in a list, and start it in _start life cycle
    if (!this.listHandler) this.listHandler = [];
    this.listHandler?.push({ opts, fn });
  }

  getQueueManager(): Queue {
    if (!this.qm)
      this.qm = new Queue(BULL_JOB_NAME.DATA, {
        connection: this.getRedisConnection(),
      });
    return this.qm;
  }

  getRedisConnection(path?: string): RedisOptions {
    // TODO: it could be better to get the data from other instead of fixed in process environment
    let _path = path ?? process.env.REDIS_URI;
    _path = _path ?? '';

    const res = this.getIORedisInstance(_path);
    return res;
  }

  getIORedisInstance(path: string): RedisOptions {
    try {
      const url = new URL(path);
      const db = url.pathname ? parseInt(url.pathname.substr(1), 10) : 0;

      return {
        host: url.hostname,
        port: parseInt(url.port, 10) || 6379,
        username: url.username,
        password: url.password,
        db,
      };
    } catch (e) {
      return {
        host: 'localhost',
        port: 6379,
      };
    }
  }

  async stopped() {
    try {
      this.getQueueManager().close();
    } catch (e) {
      console.warn('Unable to stop redis queuegracefully.', e);
    }
  }
}
