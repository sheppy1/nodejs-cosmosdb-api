const azure = require('azure-storage');

async function main() {
  const connectionString = '<your-connection-string>';
  const tableService = azure.createTableService(connectionString);

  // Create a sample table
  const tableName = 'sampleTable';
  await createTableIfNotExists(tableService, tableName);

  console.log('Created table:', tableName);

  // List all tables
  tableService.listTablesSegmented(null, (error, result) => {
    if (error) {
      console.error('Error listing tables:', error);
    } else {
      console.log('Tables:');
      result.entries.forEach((table) => {
        console.log(table);
      });
    }
  });
}

async function createTableIfNotExists(tableService, tableName) {
  return new Promise((resolve, reject) => {
    tableService.createTableIfNotExists(tableName, (error, result) => {
      if (error) {
        reject(error);
      } else {
        resolve(result);
      }
    });
  });
}

main().catch((error) => {
  console.error('Error running the application:', error);
});
