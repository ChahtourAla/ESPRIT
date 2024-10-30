console.clear();
require("dotenv").config();
const {
  AccountId,
  PrivateKey,
  Client,
  TopicCreateTransaction,
  TopicMessageQuery,
  TopicMessageSubmitTransaction,
} = require("@hashgraph/sdk");

// Grab the OPERATOR_ID and OPERATOR_KEY from the .env file
const operatorId = AccountId.fromString(process.env.MY_ACCOUNT_ID);
const operatorKey = PrivateKey.fromStringDer(process.env.MY_PRIVATE_KEY);

// Build Hedera testnet and mirror node client
const client = Client.forTestnet();

// Set the operator account ID and operator private key
client.setOperator(operatorId, operatorKey);

async function main() {
  //Create a new topic
  let txResponse = await new TopicCreateTransaction()
    .setAdminKey(operatorKey)
    .setSubmitKey(operatorKey)
    .execute(client);

  //Grab the newly generated topic ID
  let receipt = await txResponse.getReceipt(client);
  let topicId = receipt.topicId;
  console.log(`Your topic ID is: ${topicId}`);

  //Create the query
  await new TopicMessageQuery()
    .setTopicId(topicId)
    .subscribe(client, null, (message) => {
      let messageAsString = Buffer.from(message.contents, "utf8").toString();
      console.log(
        `${message.consensusTimestamp.toDate()} Received: ${messageAsString}`
      );
    });

  while (true) {
    // Send one message
    let sendResponse = await new TopicMessageSubmitTransaction({
      topicId: topicId,
      message: "Hello, World!, " + new Date(),
    }).execute(client);
    const getReceipt = await sendResponse.getReceipt(client);

    // //wait 2 second and submit a new message
    // await new Promise((resolve) => setTimeout(resolve, 2000));

    console.log(
      "The message transaction status: " + getReceipt.status.toString()
    );
  }
}
main();
