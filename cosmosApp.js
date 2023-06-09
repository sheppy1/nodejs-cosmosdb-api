const { TableClient, generateAccountSASQueryParameters } = require("@azure/data-tables");
const { AzureCliCredential } = require("@azure/identity");

async function main() {
  const endpoint = "<your-cosmosdb-endpoint>";
  const credential = new AzureCliCredential();

  const sasToken = await generateSasToken(endpoint, credential);
  const tableClient = new TableClient(`${endpoint}?${sasToken}`);

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

async function generateSasToken(endpoint, credential) {
  const accountSAS = generateAccountSASQueryParameters(
    {
      startsOn: new Date(),
      expiresOn: new Date(new Date().valueOf() + 86400),
      permissions: {
        read: true,
        write: true,
        delete: true,
        list: true,
      },
      services: "t",
      resourceTypes: "s",
    },
    credential
  );

  const sasToken = accountSAS.toString();
  return sasToken;
}

main().catch((error) => {
  console.error("Error running the application:", error);
});
