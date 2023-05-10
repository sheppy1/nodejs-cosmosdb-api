FROM node:14

ENV COSMOS_DB_ENDPOINT=https://ds-cosmosdb.documents.azure.com:443/

ENV COSMOS_DB_ID=dstestdb

ENV COSMOS_CONTAINER_ID=dstestcont

ENV COSMOS_ACCESS_KEY=KEY_HERE

WORKDIR /usr/src/app

COPY package*.json ./
RUN npm install

COPY app.js ./

EXPOSE 3000

CMD [ "npm", "start" ]