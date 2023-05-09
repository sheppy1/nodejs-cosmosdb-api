// Import the CosmosClient class from the @azure/cosmos package
const { CosmosClient } = require("@azure/cosmos");

// Import the AAD Auth class from the @azure/identity package
const { ManagedIdentityCredential, DefaultAzureCredential } = require('@azure/identity');

// Import the Express class from the express package
const express = require('express');

// Create a new instance of ManagedIdentityCredential, to be used for MI, AAD Auth with a CosmosClient Instance
const aadCredentials = new ManagedIdentityCredential();

// Replace with your Cosmos DB endpoint and key
const endpoint = 'https://ds-cosmosdb.documents.azure.com:443/';
// const key = 'Kjn8SbJaUGRJSsjyy78f2j11CJX947dP9IitXBAs68aGX0Is85BlDI8CXTsE5rjeoP42zW0IXJHKACDb5zB9TQ==';

// Create a new instance of DefaultAzureCredential for authentication
// const credential = new DefaultAzureCredential();

// Replace with your database and container names
const databaseId = 'dstestdb';
const containerId = 'dstestcont';

// Create a new instance of CosmosClient with managed identity authentication
const client = new CosmosClient({endpoint, aadCredentials});

// Create a new Express instance
const app = express();
app.use(express.json());

app.listen(3000, () => {
  console.log('App listening on port 3000');
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
    res.status(500).send(`Error getting items from container with ${error}`);
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