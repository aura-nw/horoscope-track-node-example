import { PrismaClient } from '@prisma/client';
import { IBlockResponse } from '../types/horoscope-response/block_response';
import { ITransactionResponse } from '../types/horoscope-response/transaction_response';
import { IMessageResponse } from '../types/horoscope-response/message_response';
import { IEventResponse } from '../types/horoscope-response/event_response';

const prisma = new PrismaClient();

export async function handleBlocks(
  blockData: IBlockResponse,
  trx: any,
): Promise<void> {}

export async function handleTransactions(
  txDatas: ITransactionResponse,
  trx: any,
): Promise<void> {}

export async function handleMessages(
  msg: IMessageResponse,
  trx: any,
): Promise<void> {
  console.log('catched message:');
  console.log(JSON.stringify(msg));

  const sender = msg.sender;
  const funds: any[] = msg.content.funds;
  const amountAura = funds.find((x: any) => x.denom === 'uaura').amount;
  const accountInDB = await prisma.account.findFirst({
    where: {
      address: sender,
    },
  });
  if (!accountInDB) {
    const resultInsert = await prisma.account.create({
      data: { address: sender, amount: amountAura },
    });
    console.log('result insert: ', resultInsert.id);
  } else {
    accountInDB.amount = BigInt(accountInDB.amount) + BigInt(amountAura);
    const resultUpdate = await prisma.account.update({
      where: {
        id: accountInDB.id,
      },
      data: {
        amount: accountInDB.amount,
      },
    });
    console.log('result update: ', resultUpdate.id);
  }
}

export async function handleEvents(
  event: IEventResponse,
  trx: any,
): Promise<void> {}
