import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();
// use `prisma` in your application to read and write data in your DB

export class BlockCheckpointService {
  async getCheckpoint(jobName: string, startBlock: number): Promise<number> {
    const entity = await prisma.blockCheckpoint.findFirst({
      where: { job_name: jobName },
    });

    let startHeight = 0;
    if (entity) {
      startHeight = entity.height;
    } else {
      startHeight = startBlock;
      await prisma.blockCheckpoint.create({
        data: {
          job_name: jobName,
          height: startHeight,
        },
      });
    }

    return startHeight;
  }

  async setCheckpoint(jobName: string, blockHeight: number) {
    const entity = await prisma.blockCheckpoint.findFirst({
      where: { job_name: jobName },
    });

    if (entity) {
      const update = await prisma.blockCheckpoint.update({
        data: { height: blockHeight },
        where: { id: entity.id, job_name: jobName },
      });
      return update;
    }

    return null;
  }
}
