console.clear();
const {
  Client,
  PrivateKey,
  TransferTransaction,
  AccountBalanceQuery,
  TokenAssociateTransaction,
  TokenWipeTransaction,
} = require("@hashgraph/sdk");
require("dotenv").config();

//Grab your Hedera testnet account ID and private key from your .env file
const myAccountId = process.env.MY_ACCOUNT_ID;
const myPrivateKey = PrivateKey.fromStringDer(process.env.MY_PRIVATE_KEY);
const secondAccountId = process.env.SECOND_ACCOUNT_ID;
const secondPrivateKey = PrivateKey.fromStringDer(
  process.env.SECOND_PRIVATE_KEY
);

// If we weren't able to grab it, we should throw a new error
if (!myAccountId || !myPrivateKey) {
  throw new Error(
    "Environment variables MY_ACCOUNT_ID and MY_PRIVATE_KEY must be present"
  );
}

//Create your Hedera Testnet client
const client = Client.forTestnet();

//Set your account as the client's operator
client.setOperator(myAccountId, myPrivateKey);

async function transferToken(tokenId, senderId, receiverId, amount) {
  console.log("TransferToken-------------------");
  const sendToken = await new TransferTransaction()
    .addTokenTransfer(tokenId, senderId, -amount)
    .addTokenTransfer(tokenId, receiverId, amount)
    .execute(client);

  let receipt = await sendToken.getReceipt(client);
  console.log("Transfer Token: ", receipt.status.toString());
  console.log("-----------------------------------");
}

async function associateToken(tokenId, accountId) {
  console.log("AssociateToken----------------");
  let associateTokenTx = await new TokenAssociateTransaction()
    .setAccountId(accountId)
    .setTokenIds([tokenId])
    .freezeWith(client);

  let associationSign = await associateTokenTx.sign(secondPrivateKey);
  let associationSubmit = await associationSign.execute(client);
  let receipt = await associationSubmit.getReceipt(client);
  console.log("Associate Token: ", receipt.status.toString());
  console.log("-----------------------------------");
}

async function queryAccountBalance(accountId) {
  console.log("QueryAccountBalance----------------");
  const balanceQuery = new AccountBalanceQuery().setAccountId(accountId);
  const accountBalance = await balanceQuery.execute(client);
  console.log(JSON.stringify(accountBalance, null, 4));
  console.log("-----------------------------------");
}

async function wipeToken(accountId, tokenId, amount) {
  console.log("WipeToken-----------------");
  const transaction = await new TokenWipeTransaction()
    .setAccountId(accountId)
    .setTokenId(tokenId)
    .setAmount(amount)
    .execute(client);

  const receipt = await transaction.getReceipt(client);
  console.log(
    "The transaction consensus status is " + receipt.status.toString()
  );
  console.log("-----------------------------------");
}

async function main() {
  const tokenId = "0.0.5028995";
  //   await associateToken(tokenId, secondAccountId);
  await queryAccountBalance(secondAccountId);
  await transferToken(tokenId, myAccountId, secondAccountId, 1000);
  await queryAccountBalance(secondAccountId);
  await wipeToken(secondAccountId, tokenId, 200);
  await queryAccountBalance(secondAccountId);
}
main();
