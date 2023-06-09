const { TableServiceClient } = require("@azure/cosmos");
const { DefaultAzureCredential } = require("@azure/identity");

async function main() {
  const endpoint = "<your-cosmosdb-endpoint>";
  const credential = new DefaultAzureCredential();
  const client = new TableServiceClient(endpoint, credential);

  const tableName = "sampleTable";
  await createTableIfNotExists(client, tableName);

  console.log("Created table:", tableName);

  // List all tables
  const tablesIterator = client.listTables();
  const tables = [];
  for await (const table of tablesIterator) {
    tables.push(table.name);
  }
  console.log("Tables:", tables);
}

async function createTableIfNotExists(client, tableName) {
  const response = await client.createTable(tableName);
  return response._response.status === 201;
}

main().catch((error) => {
  console.error("Error running the application:", error);
});
