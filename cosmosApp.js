const { TableClient } = require("@azure/data-tables");
const { AzureCliCredential } = require("@azure/identity");
const base64 = require("base64-js");

async function main() {
  const endpoint = "<your-cosmosdb-endpoint>";
  const credential = new AzureCliCredential();
  const sasToken = await generateSasToken(credential);

  const encodedSasToken = encodeSasToken(sasToken);
  const connectionString = `AccountKey=${encodedSasToken};TableEndpoint=${endpoint}`;

  const tableClient = new TableClient(connectionString, "<your-table-name>");

  const tableName = "sampleTable";
  await createTableIfNotExists(tableClient, tableName);

  console.log("Created table:", tableName);

  // List all tables
  const tables = await tableClient.listTables();
  console.log("Tables:");
  tables.forEach((table) => {
    console.log(table.tableName);
  });
}

async function createTableIfNotExists(client, tableName) {
  const response = await client.createTable(tableName);
  return response._response.status === 201;
}

function encodeSasToken(sasToken) {
  const encodedBytes = base64.fromByteArray(new TextEncoder().encode(sasToken));
  return encodedBytes;
}

async function generateSasToken(credential) {
  const token = await credential.getToken("https://management.azure.com/.default");
  const authString = `Bearer ${token.token}`;
  return authString;
}

main().catch((error) => {
  console.error("Error running the application:", error);
});
