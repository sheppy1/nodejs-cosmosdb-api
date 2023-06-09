const { CosmosClient } = require("@azure/cosmos");

async function main() {
  const endpoint = "<your-cosmosdb-endpoint>";
  const key = "<your-cosmosdb-key>";
  const databaseId = "<your-database-id>";
  const containerId = "<your-container-id>";

  const client = new CosmosClient({ endpoint, key });
  const database = client.database(databaseId);
  const container = database.container(containerId);

  // Create a sample entity
  const sampleEntity = {
    partitionKey: "partitionKey",
    rowKey: "rowKey",
    data: "sampleData",
  };
  await container.items.create(sampleEntity);

  console.log("Created sample entity.");

  // Query all entities in the container
  const query = "SELECT * FROM c";
  const { resources: entities } = await container.items.query(query).fetchAll();

  console.log("Entities:");
  entities.forEach((entity) => {
    console.log(entity);
  });
}

main().catch((error) => {
  console.error("Error running the application:", error);
});
