const { BlobServiceClient } = require("@azure/storage-blob");
const { DefaultAzureCredential } = require("@azure/identity");

const storageAccountName = "<storage_account_name>";
const containerName = "<container_name>";

async function listBlobs() {
  const credential = new DefaultAzureCredential();
  const blobServiceClient = new BlobServiceClient(
    `https://${storageAccountName}.blob.core.windows.net`,
    credential
  );

  const containerClient = blobServiceClient.getContainerClient(containerName);
  const iter = containerClient.listBlobsFlat();

  for await (const blob of iter) {
    console.log(blob.name);
  }
}

listBlobs().catch((error) => {
  console.error("Error listing blobs:", error);
});
