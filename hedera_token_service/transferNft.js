console.clear();
require("dotenv").config();
const {
  PrivateKey,
  Client,
  TransferTransaction,
  TokenNftInfoQuery,
  TokenAssociateTransaction,
  TokenId,
  NftId,
} = require("@hashgraph/sdk");

//Grab your Hedera testnet account ID and private key from your .env file
const myAccountId = process.env.MY_ACCOUNT_ID;
const myPrivateKey = PrivateKey.fromStringDer(process.env.MY_PRIVATE_KEY);
const secondAccountId = process.env.SECOND_ACCOUNT_ID;
const secondPrivateKey = PrivateKey.fromStringDer(
  process.env.SECOND_PRIVATE_KEY
);

const client = Client.forTestnet();
client.setOperator(myAccountId, myPrivateKey);

async function transferNFT(nftId, senderId, receiverId) {
  let tokenTransferTx = await new TransferTransaction()
    .addNftTransfer(nftId.tokenId, nftId.serial, senderId, receiverId)
    .execute(client);

  let tokenTransferRx = await tokenTransferTx.getReceipt(client);

  console.log(`\n- NFT transfer : ${tokenTransferRx.status.toString()} \n`);
}

async function nftInfoQuery(nftId) {
  console.log("NftInfoQuery----------------");
  //Returns the info for the specified NFT ID
  const nftInfo = await new TokenNftInfoQuery().setNftId(nftId).execute(client);
  console.log(JSON.stringify(nftInfo, null, 4));
  console.log("-----------------------------------");
}

async function associateToken(tokenId, accountId, accountPrivateKey) {
  console.log("AssociateToken----------------");
  let associateTokenTx = await new TokenAssociateTransaction()
    .setAccountId(accountId)
    .setTokenIds([tokenId])
    .freezeWith(client);

  let associationSign = await associateTokenTx.sign(accountPrivateKey);
  let associationSubmit = await associationSign.execute(client);
  let receipt = await associationSubmit.getReceipt(client);
  console.log("Associate Token: ", receipt.status.toString());
  console.log("-----------------------------------");
}

async function main() {
  const tokenId = "0.0.5029037";
  //   await associateToken(tokenId, secondAccountId, secondPrivateKey);
  //   const nftId = new NftId(TokenId.fromString(tokenId), 2);
  //   console.log(nftId);
  //   await nftInfoQuery(nftId);
  //   await transferNFT(nftId, myAccountId, secondAccountId);
  //   await nftInfoQuery(nftId);
}
main();
