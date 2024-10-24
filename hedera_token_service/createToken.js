console.clear();
const {
  Client,
  PrivateKey,
  TokenCreateTransaction,
  TokenType,
  TokenSupplyType,
  TokenInfoQuery,
  AccountBalanceQuery,
  TokenMintTransaction,
  TokenBurnTransaction,
} = require("@hashgraph/sdk");
require("dotenv").config();

//Grab your Hedera testnet account ID and private key from your .env file
const myAccountId = process.env.MY_ACCOUNT_ID;
const myPrivateKey = PrivateKey.fromStringDer(process.env.MY_PRIVATE_KEY);

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

async function createToken() {
  console.log("CreateToken---------------------");
  let tokenCreateTx = await new TokenCreateTransaction()
    .setTokenName("MyToken")
    .setTokenSymbol("MYT")
    .setTokenType(TokenType.FungibleCommon)
    .setDecimals(2)
    .setInitialSupply(10000)
    .setTreasuryAccountId(myAccountId)
    .setSupplyType(TokenSupplyType.Infinite)
    .setSupplyKey(myPrivateKey)
    .setFreezeKey(myPrivateKey)
    .setPauseKey(myPrivateKey)
    .setAdminKey(myPrivateKey)
    .setWipeKey(myPrivateKey)
    .freezeWith(client);

  let tokenCreateSign = await tokenCreateTx.sign(myPrivateKey);
  let tokenCreateSubmit = await tokenCreateSign.execute(client);
  let tokenCreateRx = await tokenCreateSubmit.getReceipt(client);
  let tokenId = tokenCreateRx.tokenId;
  console.log(`- Created token with ID: ${tokenId}`);
  console.log("-----------------------------------");
  return tokenId;
}

async function queryTokenInfo(tokenId) {
  console.log("QueryTokenInfo---------------------");
  const query = new TokenInfoQuery().setTokenId(tokenId);
  const tokenInfo = await query.execute(client);
  console.log(JSON.stringify(tokenInfo, null, 4));
  console.log("-----------------------------------");
}

async function queryAccountBalance(accountId) {
  console.log("QueryAccountBalance----------------");
  const balanceQuery = new AccountBalanceQuery().setAccountId(accountId);
  const accountBalance = await balanceQuery.execute(client);
  console.log(JSON.stringify(accountBalance, null, 4));
  console.log("-----------------------------------");
}

async function mintToken(tokenId, amount) {
  console.log("MintToken--------------------------");
  const txResponse = await new TokenMintTransaction()
    .setTokenId(tokenId)
    .setAmount(amount)
    .execute(client);
  const receipt = await txResponse.getReceipt(client);
  console.log("Minted token: ", receipt);
  console.log("-----------------------------------");
}

async function burnToken(tokenId, amount) {
  console.log("BurnToken--------------------------");
  const txResponse = await new TokenBurnTransaction()
    .setTokenId(tokenId)
    .setAmount(amount)
    .execute(client);
  const receipt = await txResponse.getReceipt(client);
  console.log("Burned token: ", receipt);
  console.log("-----------------------------------");
}

async function main() {
  const tokenId = await createToken();
  await queryTokenInfo(tokenId);
  await queryAccountBalance(myAccountId);
  await mintToken(tokenId, 1000);
  await queryAccountBalance(myAccountId);
  await burnToken(tokenId, 500);
  await queryAccountBalance(myAccountId);
}
main();
