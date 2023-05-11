// Import the CosmosClient class from the @azure/cosmos package
const { CosmosClient } = require("@azure/cosmos");

// Import the @azure/identity package
const { ManagedIdentityCredential } = require('@azure/identity');

const { DefaultAzureCredential } = require('@azure/identity');

// Import the @azure/storage-blob package
const { BlobServiceClient } = require("@azure/storage-blob");

// Import the Express class from the express package
const express = require('express');

// Create a new instance of ManagedIdentityCredential, to be used for MI, AAD Auth with a CosmosClient Instance
const aadCredentialsStorage = new ManagedIdentityCredential();

// Create a new instance of ManagedIdentityCredential, to be used for MI, AAD Auth with a CosmosClient Instance
// Had issues using ManagedIdentityCredential for CosmosDB Auth, hence using this instead
var tokenCredential = new DefaultAzureCredential();

// Replace with your Cosmos DB endpoint (in Dockerfile)
const endpoint = process.env.COSMOS_DB_ENDPOINT;

// Replace with your database and container names (in Dockerfile)
const databaseId = process.env.COSMOS_DB_ID;
const containerId = process.env.COSMOS_CONTAINER_ID;

// Replace with your Blob Storage account endpoint (in Dockerfile)
const blobEndpoint = process.env.STORAGE_ACCOUNT_ENDPOINT;

// Create a new instance of CosmosClient with managed identity authentication
const client = new CosmosClient({ endpoint, aadCredentials: tokenCredential });

const containerName = process.env.STORAGE_CONT_NAME;

// Use the ManagedIdentityCredential object to authenticate with Blob Storage
const blobServiceClient = new BlobServiceClient(blobEndpoint, aadCredentialsStorage);

// Get a reference to the blob client
const blobClient = blobServiceClient.getContainerClient(containerName).getBlobClient("index.html");

// Create a new Express instance
const app = express();
app.use(express.json());

// Start the server
const port = process.env.PORT || 3000;
app.listen(port, () => {
  console.log(`Server listening on port ${port}`);
});

// Middleware function to handle errors
app.use((err, req, res, next) => {
  console.error(err.stack);

  if (err.statusCode === 401) {
    res.status(401).send('Unauthorized');
  } else if (err.statusCode === 403) {
    res.status(403).send('Forbidden');
  } else {
    res.status(500).send(`Internal Server Error ${err}`);
  }
});

async function streamToString(readableStream) {
  return new Promise((resolve, reject) => {
    const chunks = [];
    readableStream.on("data", (data) => {
      chunks.push(data.toString());
    });
    readableStream.on("end", () => {
      resolve(chunks.join(""));
    });
    readableStream.on("error", reject);
  });
}

app.get('/', async (req, res) => {
  try {
    const downloadBlockBlobResponse = await blobClient.download();
    const body = await streamToString(downloadBlockBlobResponse.readableStreamBody);
    res.send(body);
  } catch (error) {
    console.error(error);
    res.status(500).send(`Error getting index.html file from Blob Storage`);
  }
});

// Insert an item
app.post('/items', async (req, res) => {
  try {
    // Create the database if it doesn't exist
    const { database } = await client.databases.createIfNotExists({ id: databaseId });

    // Create the container if it doesn't exist
    const { container } = await database.containers.createIfNotExists({ id: containerId });

    // Insert the item
    const { resource: createdItem } = await container.items.create(req.body);
    res.json(createdItem);
  } catch (error) {
    console.error(error);
    res.status(500).send('Error inserting item into container');
  }
});

// Get all items
app.get('/items', async (req, res) => {
  try {
    // Create the database if it doesn't exist
    const { database } = await client.databases.createIfNotExists({ id: databaseId });

    // Create the container if it doesn't exist
    const { container } = await database.containers.createIfNotExists({ id: containerId });

    // Query for all items in the container
    const querySpec = {
      query: 'SELECT * FROM c'
    };
    const { resources: items } = await container.items.query(querySpec).fetchAll();
    res.json(items);
  } catch (error) {
    console.error(error);
    res.status(500).send('Error getting items from container');
  }
});

// Get a specific item by ID
app.get('/items/:id', async (req, res) => {
  try {
    // Create the database if it doesn't exist
    const { database } = await client.databases.createIfNotExists({ id: databaseId });

    // Create the container if it doesn't exist
    const { container } = await database.containers.createIfNotExists({ id: containerId });

    // Query for the item with the specified ID
    const querySpec = {
      query: 'SELECT * FROM c WHERE c.id = @id',
      parameters: [
        {
          name: '@id',
          value: req.params.id
        }
      ]
    };
    const { resources: items } = await container.items.query(querySpec).fetchAll();

    if (items.length > 0) {
      res.json(items[0]);
    } else {
      res.status(404).send(`Item with ID ${req.params.id} not found`);
    }
  } catch (error) {
    console.error(error);
    res.status(500).send(`Error getting item with ID ${req.params.id}`);
  }
});

// Update an item by ID
app.put('/items/:id', async (req, res) => {
  try {
    // Create the database if it doesn't exist
    const { database } = await client.databases.createIfNotExists({ id: databaseId });

    // Create the container if it doesn't exist
    const { container } = await database.containers.createIfNotExists({ id: containerId });

    // Query for the item with the specified ID
    const querySpec = {
      query: 'SELECT * FROM c WHERE c.id = @id',
      parameters: [
        {
          name: '@id',
          value: req.params.id
        }
      ]
    };
    const { resources: items } = await container.items.query(querySpec).fetchAll();

    if (items.length > 0) {
      // Update the item
      const itemToUpdate = items[0];
      itemToUpdate.name = req.body.name;
      itemToUpdate.age = req.body.age;

      const { resource: updatedItem } = await container.items.upsert(itemToUpdate);
      res.json(updatedItem);
    } else {
      res.status(404).send(`Item with ID ${req.params.id} not found`);
    }
  } catch (error) {
    console.error(error);
    res.status(500).send(`Error updating item with ID ${req.params.id}`);
  }
});

// Delete an item by ID
app.delete('/items/:id', async (req, res) => {
  try {
    // Create the database if it doesn't exist
    const { database } = await client.databases.createIfNotExists({ id: databaseId });

    // Create the container if it doesn't exist
    const { container } = await database.containers.createIfNotExists({ id: containerId });

    // Query for the item with the specified ID
    const querySpec = {
      query: 'SELECT * FROM c WHERE c.id = @id',
      parameters: [
        {
          name: '@id',
          value: req.params.id
        }
      ]
    };
    const { resources: items } = await container.items.query(querySpec).fetchAll();

    if (items.length > 0) {
      // Delete the item
      await container.item(items[0].id).delete();
      res.send(`Item with ID ${req.params.id} deleted`);
    } else {
      res.status(404).send(`Item with ID ${req.params.id} not found`);
    }
  } catch (error) {
    console.error(error);
    res.status(500).send(`Error deleting item with ID ${req.params.id}`);
  }
});
