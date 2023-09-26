export const INDEXER_API_V2 = {
  GRAPH_QL: {
    LAST_BLOCK: `query LastBlockQuery { %s { block (order_by: {height: desc}, limit: 1) { height } } }`,
    BLOCK: `query QueryBlock($startBlock: Int = 10, $endBlock: Int = 10) {
        %s {
        block(where: {height: {_gte: $startBlock, _lte: $endBlock}}) {
          proposer_address
          height
          hash
          time
          transactions {
            data
          }
          validator {
            consensus_hex_address
            consensus_address
          }
          data(path: "block.header")
        }
      }
    }`,
    TX: `query QueryTx($startBlock: Int = 10, $endBlock: Int = 10) {
          %s {
          transaction(
            where: {height: {_gte: $startBlock, _lte: $endBlock}}
            order_by: {height: asc, index: asc}
          ) {
            code
            codespace
            height
            hash
            timestamp
          }
        }
      }`,
    MESSAGE: `query QueryMessage($startBlock: Int = 10, $endBlock: Int = 10) {
        %s {
          transaction_message(
            where: {transaction: {height: {_gte: $startBlock, _lte: $endBlock}}}
          ) {
            content
            type
            index
            parent_id
          }
        }
      }`,
    EVENT: `query QueryEvent($startBlock: Int = 10, $endBlock: Int = 10) {
          %s {
            event(
              where: {block_height: {_gte: $startBlock, _lte: $endBlock}, event_attributes: {block_height: {_gte: $startBlock, _lte: $endBlock}}}
            ) {
              type
              event_attributes {
                key
                value
              }
            }
          }
      }`,
  },
  OPERATION_NAME: {
    BLOCK: 'QueryBlock',
    TX: 'QueryTx',
    MESSAGE: 'QueryMessage',
    EVENT: 'QueryEvent',
    LAST_BLOCK: 'LastBlockQuery',
  },
};
