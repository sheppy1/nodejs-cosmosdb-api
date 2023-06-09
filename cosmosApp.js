const { TableClient } = require("@azure/data-tables");
const { AzureCliCredential } = require("@azure/identity");
const base64 = require("base64-js");

async function main() {
  const endpoint = "<your-cosmosdb-endpoint>";
  const credential = new AzureCliCredential();
  const client = new TableClient(endpoint, "<your-table-name>", credential);

  const tableName = "sampleTable";
  await createTableIfNotExists(client, tableName);

  console.log("Created table:", tableName);

  // List all tables
  const tables = await client.listTables();
  console.log("Tables:");
  tables.forEach((table) => {
    console.log(table.tableName);
  });
}

async function createTableIfNotExists(client, tableName) {
  const response = await client.createTable(tableName);
  return response._response.status === 201;
}

function encodeAuthString(authString) {
  const encodedBytes = base64.fromByteArray(new TextEncoder().encode(authString));
  return encodedBytes;
}

(async () => {
  try {
    const credential = new AzureCliCredential();
    const token = await credential.getToken("https://management.azure.com/.default");
    const authString = `Bearer ${token.token}`;
    const encodedAuthString = encodeAuthString(authString);
    process.env.AZURE_TABLES_SAS_TOKEN = encodedAuthString;
    await main();
  } catch (error) {
    console.error("Error running the application:", error);
  }
})();
