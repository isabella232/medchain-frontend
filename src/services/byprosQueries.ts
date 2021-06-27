
export const queries = {
    projects:`SELECT 
    encode(cothority.instruction.contract_iid,'hex') as instanceid
  FROM
    cothority.instruction
  INNER JOIN 
    cothority.transaction 
  ON
    cothority.transaction.transaction_id = cothority.instruction.transaction_id
  WHERE
    cothority.instruction.type_id = 2
  AND 
    cothority.instruction.contract_name = 'project'
  AND 
    cothority.transaction.Accepted = TRUE`,
    pendingTransactions:`SELECT
    encode(cothority.instruction.contract_iid, 'hex') as instanceid,
    encode(cothority.block.hash,'hex') as blockhash
  FROM
    cothority.instruction
INNER JOIN 
        cothority.transaction 
      ON
        cothority.transaction.transaction_id = cothority.instruction.transaction_id
INNER JOIN 
        cothority.block 
      ON
        cothority.transaction.block_id = cothority.block.block_id
  WHERE
    cothority.instruction.contract_name = 'deferred' 
  AND 
    cothority.instruction.type_id = 2
  AND
    cothority.instruction.contract_iid 
    NOT IN (
      SELECT 
        cothority.instruction.contract_iid
      FROM
        cothority.instruction
      INNER JOIN 
        cothority.transaction 
      ON
        cothority.transaction.transaction_id = cothority.instruction.transaction_id
      WHERE
        cothority.instruction.type_id = 3
      AND 
        cothority.instruction.contract_name = 'deferred'
      AND 
        cothority.instruction.Action = 'invoke:deferred.execProposedTx'
      AND 
        cothority.transaction.Accepted = TRUE
    ) `,
    transactionsHistory: `SELECT 
    encode(cothority.instruction.contract_iid,'hex') as instanceid,
    encode(cothority.block.hash,'hex') as blockhash
  FROM
    cothority.instruction
  INNER JOIN 
    cothority.transaction 
  ON
    cothority.transaction.transaction_id = cothority.instruction.transaction_id
  INNER JOIN 
    cothority.block 
  ON
    cothority.transaction.block_id = cothority.block.block_id
  WHERE
    cothority.instruction.type_id = 3
  AND 
    cothority.instruction.contract_name = 'deferred'
  AND 
    cothority.instruction.Action = 'invoke:deferred.execProposedTx'
  AND 
    cothority.transaction.Accepted = TRUE`
}
