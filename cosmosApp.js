const { CosmosClient } = require("@azure/cosmos");
const { AzureCliCredential } = require("@azure/identity");

async function main() {
  const endpoint = "<your-cosmosdb-endpoint>";
  const credential = new AzureCliCredential();
  const client = new CosmosClient({ endpoint, credential });

  const databaseId = "<your-database-id>";
  const containerId = "<your-container-id>";

  const database = client.database(databaseId);
  const container = database.container(containerId);

  // Create a sample container
  await createContainerIfNotExists(container);

  console.log("Created container:", containerId);

  // List all containers
  const { resources: containers } = await database.containers.readAll().fetchAll();

  console.log("Containers:");
  containers.forEach((container) => {
    console.log(container.id);
  });
}

async function createContainerIfNotExists(container) {
  const { resource: existingContainer } = await container.read();
  if (!existingContainer) {
    await container.create();
  }
}

main().catch((error) => {
  console.error("Error running the application:", error);
});
