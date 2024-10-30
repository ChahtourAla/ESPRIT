console.clear();
const {
  Client,
  AccountId,
  PrivateKey,
  FileCreateTransaction,
  ContractCreateTransaction,
  ContractFunctionParameters,
  ContractCallQuery,
  ContractExecuteTransaction,
  ContractInfoQuery,
} = require("@hashgraph/sdk");
require("dotenv").config();

// Grab the OPERATOR_ID and OPERATOR_KEY from the .env file
const myAccountId = AccountId.fromString(process.env.MY_ACCOUNT_ID);
const myPrivateKey = PrivateKey.fromStringDer(process.env.MY_PRIVATE_KEY);

// Build Hedera testnet and mirror node client
const client = Client.forTestnet();

// Set the operator account ID and operator private key
client.setOperator(myAccountId, myPrivateKey);

async function deploySmartContract() {
  //Import the compiled contract from the HelloHedera.json file
  let helloHedera = require("./contract/hello_hedera.json");
  const bytecode = helloHedera.data.bytecode.object;

  //Create a file on Hedera and store the hex-encoded bytecode
  const fileCreateTx = new FileCreateTransaction()
    //Set the bytecode of the contract
    .setContents(bytecode);

  //Submit the file to the Hedera test network signing with the transaction fee payer key specified with the client
  const submitTx = await fileCreateTx.execute(client);

  //Get the receipt of the file create transaction
  const fileReceipt = await submitTx.getReceipt(client);

  //Get the file ID from the receipt
  const bytecodeFileId = fileReceipt.fileId;

  //Log the file ID
  console.log("The smart contract byte code file ID is " + bytecodeFileId);

  // Instantiate the contract instance
  const contractTx = await new ContractCreateTransaction()
    //Set the file ID of the Hedera file storing the bytecode
    .setBytecodeFileId(bytecodeFileId)
    //Set the gas to instantiate the contract
    .setGas(400000)
    //Provide the constructor parameters for the contract
    .setConstructorParameters(
      new ContractFunctionParameters().addString("Hello from Hedera!")
    );

  //Submit the transaction to the Hedera test network
  const contractResponse = await contractTx.execute(client);

  //Get the receipt of the file create transaction
  const contractReceipt = await contractResponse.getReceipt(client);

  //Get the smart contract ID
  const newContractId = contractReceipt.contractId;

  //Log the smart contract ID
  console.log("The smart contract ID is " + newContractId);
  return newContractId;
}

async function queryMessage(contractId) {
  const contractQuery = await new ContractCallQuery()
    //Set the gas for the query
    .setGas(100000)
    //Set the contract ID to return the request for
    .setContractId(contractId)
    //Set the contract function to call
    .setFunction("get_message");

  //Submit to a Hedera network
  const getMessage = await contractQuery.execute(client);

  // Get a string from the result at index 0
  const message = getMessage.getString(0);

  //Log the message
  console.log("The contract message: " + message);
}

async function setMessage(contractId, message) {
  //Create the transaction to update the contract message
  const contractExecTx = await new ContractExecuteTransaction()
    //Set the ID of the contract
    .setContractId(contractId)
    //Set the gas for the contract call
    .setGas(100000)
    //Set the contract function to call
    .setFunction(
      "set_message",
      new ContractFunctionParameters().addString(message)
    );

  //Submit the transaction to a Hedera network and store the response
  const submitExecTx = await contractExecTx.execute(client);

  //Get the receipt of the transaction
  const receipt = await submitExecTx.getReceipt(client);
  console.log(
    "Updated message successfully",
    message,
    submitExecTx.transactionId.toString()
  );
}

async function getSmartContractInfo(contractId) {
  //Create the query
  const query = new ContractInfoQuery().setContractId(contractId);

  //Sign the query with the client operator private key and submit to a Hedera network
  const info = await query.execute(client);

  console.log(info);
}

async function main() {
  const contractId = await deploySmartContract();
  await getSmartContractInfo(contractId);
  await queryMessage(contractId);
  await setMessage(contractId, "Hello it's Ala");
  await queryMessage(contractId);
}
main();
