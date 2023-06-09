const { TableClient } = require("@azure/data-tables");
const { AzureCliCredential } = require("@azure/identity");
const axios = require("axios");

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

async function getSasToken() {
  const response = await axios.get("http://localhost:26783/token/AzureCliCredential");
  return response.data.token;
}

(async () => {
  try {
    const token = await getSasToken();
    process.env.AZURE_TABLES_SAS_TOKEN = token;
    await main();
  } catch (error) {
    console.error("Error running the application:", error);
  }
})();
