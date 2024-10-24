const {
  Client,
  PrivateKey,
  AccountCreateTransaction,
  AccountBalanceQuery,
  Hbar,
  TransferTransaction,
} = require("@hashgraph/sdk");
require("dotenv").config();

async function helloHedera() {
  //Grab your Hedera testnet account ID and private key from your .env file
  const myAccountId = process.env.MY_ACCOUNT_ID;
  const myPrivateKey = process.env.MY_PRIVATE_KEY;

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

  //Create new keys
  const newAccountPrivateKey = PrivateKey.generateED25519();
  const newAccountPublicKey = newAccountPrivateKey.publicKey;

  //Create a new account with 1,000 tinybar starting balance
  const newAccount = await new AccountCreateTransaction()
    .setKey(newAccountPublicKey)
    .setInitialBalance(new Hbar(2))
    .execute(client);

  // Get the new account ID
  const getReceipt = await newAccount.getReceipt(client);
  const newAccountId = getReceipt.accountId;

  //Log the account ID
  console.log("The new account ID is: " + newAccountId);

  // //Verify the account balance
  // const accountBalance = await new AccountBalanceQuery()
  //   .setAccountId(newAccountId)
  //   .execute(client);

  // console.log(
  //   "The new account balance is: " +
  //     accountBalance.hbars.toTinybars() +
  //     " tinybar."
  // );

  // //Create the transfer transaction
  // const sendHbar = await new TransferTransaction()
  //   .addHbarTransfer(myAccountId, Hbar.fromTinybars(-10000)) //Sending account
  //   .addHbarTransfer(newAccountId, Hbar.fromTinybars(10000)) //Receiving account
  //   .execute(client);

  // //Verify the transaction reached consensus
  // const transactionReceipt = await sendHbar.getReceipt(client);
  // console.log(
  //   "The transfer transaction from my account to the new account was: " +
  //     transactionReceipt.status.toString()
  // );

  // //Verify the account balance
  // const newAccountBalance = await new AccountBalanceQuery()
  //   .setAccountId(newAccountId)
  //   .execute(client);

  // console.log(
  //   "The new account balance is: " +
  //     newAccountBalance.hbars.toTinybars() +
  //     " tinybar."
  // );
}
helloHedera();
