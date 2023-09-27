# Top swap AURA
On this project, we will create an example to track all address on Aura Network Xstaxy to calculate total aura swapped to usdc coin by each address

Contract address need to track: [aura1fgfnuru6krewgt9zzu7nzercz007928uzrw2t2tl6hl3ec50me2q3ankr2](https://aurascan.io/contracts/aura1fgfnuru6krewgt9zzu7nzercz007928uzrw2t2tl6hl3ec50me2q3ankr2)

### Setup project
```sh
# generate code from template
git clone https://github.com/aura-nw/horoscope-track-node.git  
cd horoscope-track-node
git checkout 4c2ff5398f41e7c0d33c75435c62522170e63cdc

# or use horoscope-cli
npm install @aura-nw/horoscope-cli
horoscope-cli init

# install package node
npm install

# create env
cp .env-sample .env

# run docker compose to run redis, postgres, hasura
docker-compose up
```
### Create model and migration
Create model in [schema.prisma](horoscope-track-node/prisma/schema.prisma):
```
model Account {
  id         Int      @id @default(autoincrement())
  address    String
  amount     BigInt
}
```

Then run db migration
```sh
npm run prisma:migrate
```
### Update business logic 
Update [project.yaml](horoscope-track-node/project.yaml) to filter message by condition
```
- handler: handleMessages
  type: message
  filter:
  - type: "/cosmwasm.wasm.v1.MsgExecuteContract" 
      contract: "aura1fgfnuru6krewgt9zzu7nzercz007928uzrw2t2tl6hl3ec50me2q3ankr2" 
      contractCall: "execute_swap_operations"    
```

Update code to handle message in [src/mappings/mappingHandlers.ts](horoscope-track-node/src/mappings/mappingHandlers.ts)
```js
export async function handleMessages(
  msg: IMessageResponse,
  trx: any,
): Promise<void> {
  console.log('catched message:');
  console.log(JSON.stringify(msg));

  // get sender, amount aura swapped
  const sender = msg.sender;
  const funds: any[] = msg.content.funds;
  const amountAura = funds.find((x: any) => x.denom === 'uaura').amount;

  // find account in db
  const accountInDB = await prisma.account.findFirst({
    where: {
      address: sender,
    },
  });
  // if account is existed, update amount aura, if not then create new 
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
```

To start crawling
```sh
npm run start:dev
```
