FROM node:14

ENV COSMOS_DB_ENDPOINT=https://ds-cosmosdb.documents.azure.com:443/
ENV COSMOS_DB_ID=dstestdb
ENV COSMOS_CONTAINER_ID=dstestcont
ENV STORAGE_ACCOUNT_ENDPOINT=https://cosmosdbappstorage.blob.core.windows.net/
ENV STORAGE_CONT_NAME=web
ENV STORAGE_ACCOUNT_NAME=cosmosdbappstorage
ENV AZURE_TENANT_ID=bd2d1891-3c6d-4b8e-a422-1a242746469f

WORKDIR /usr/src/app

COPY package*.json ./
RUN npm install

COPY app.js ./

EXPOSE 3000

CMD [ "npm", "start" ]
