console.clear();
const {
  Client,
  AccountBalanceQuery,
  TransferTransaction,
  PrivateKey,
  ScheduleCreateTransaction,
  ScheduleSignTransaction,
  Hbar,
} = require("@hashgraph/sdk");
require("dotenv").config();

const myAccountId = process.env.MY_ACCOUNT_ID;
const myPrivateKey = PrivateKey.fromStringDer(process.env.MY_PRIVATE_KEY);
const secondAccountId = process.env.SECOND_ACCOUNT_ID;
const secondPrivateKey = PrivateKey.fromStringDer(
  process.env.SECOND_PRIVATE_KEY
);

const client = Client.forTestnet();
client.setOperator(myAccountId, myPrivateKey);

async function scheduleTransaction(amount) {
  const tx = new TransferTransaction()
    .addHbarTransfer(myAccountId, -amount)
    .addHbarTransfer(secondAccountId, -amount)
    .addHbarTransfer("0.0.5028174", amount * 2);

  //Create a schedule transaction
  const transaction = new ScheduleCreateTransaction()
    .setExpirationTime()
    .setScheduleMemo(new Date().toString())
    .setScheduledTransaction(tx);

  //Sign with the client operator key and submit the transaction to a Hedera network
  const txResponse = await transaction.execute(client);

  //Request the receipt of the transaction
  const receipt = await txResponse.getReceipt(client);

  //Get the schedule ID
  const scheduleId = receipt.scheduleId;
  console.log("The schedule ID of the schedule transaction is " + scheduleId);
  return scheduleId;
}

async function signScheduleTransaction(scheduleTxId) {
  //Create the transaction
  const transaction = await new ScheduleSignTransaction()
    .setScheduleId(scheduleTxId)
    .freezeWith(client);

  const signedTx = await (
    await transaction.sign(myPrivateKey)
  ).sign(secondPrivateKey);

  //Sign with the client operator key to pay for the transaction and submit to a Hedera network
  const txResponse = await signedTx.execute(client);

  //Get the receipt of the transaction
  const receipt = await txResponse.getReceipt(client);

  //Get the transaction status
  const transactionStatus = receipt.status.toString();
  console.log("The transaction consensus status is " + transactionStatus);
}

async function queryBalance(accountId) {
  //Query account balance
  const accountBalanace = await new AccountBalanceQuery().setAccountId(
    accountId
  );

  const result = await accountBalanace.execute(client);
  console.log(accountId + " current hbar :", result.hbars.toString());
}

async function main() {
  await queryBalance(myAccountId);
  await queryBalance(secondAccountId);
  await queryBalance("0.0.5028174");
  const scheduleTxId = await scheduleTransaction(new Hbar(3).toBigNumber());
  await signScheduleTransaction(scheduleTxId);
  await queryBalance(myAccountId);
  await queryBalance(secondAccountId);
  await queryBalance("0.0.5028174");
}
main();
