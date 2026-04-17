require('dotenv').config();
const express = require('express');
const cors = require('cors');
const { CosmosClient } = require('@azure/cosmos');

const app = express();
app.use(cors());
app.use(express.static('public'));

const client = new CosmosClient({
  endpoint: process.env.COSMOS_ENDPOINT,
  key: process.env.COSMOS_KEY
});

const container = client
  .database(process.env.COSMOS_DB)
  .container(process.env.COSMOS_CONTAINER);

app.get('/api/data', async (req, res) => {
  try {
    const querySpec = {
      query: `
        SELECT * FROM c
        ORDER BY c.windowEndTime DESC
      `
    };

    const { resources } = await container.items.query(querySpec).fetchAll();

    const latestByLocation = {};
    for (const item of resources) {
      if (!latestByLocation[item.location]) {
        latestByLocation[item.location] = item;
      }
    }

    res.json(Object.values(latestByLocation));
  } catch (error) {
    console.error('Error reading Cosmos DB:', error.message);
    res.status(500).json({ error: 'Failed to fetch data' });
  }
});
app.get('/api/trends/last-hour', async (req, res) => {
  try {
    const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000).toISOString();

    const querySpec = {
      query: `
        SELECT c.location, c.windowEndTime, c.avgIceThickness
        FROM c
        WHERE c.windowEndTime >= @oneHourAgo
        ORDER BY c.windowEndTime ASC
      `,
      parameters: [
        { name: '@oneHourAgo', value: oneHourAgo }
      ]
    };

    const { resources } = await container.items.query(querySpec).fetchAll();
    res.json(resources);
  } catch (error) {
    console.error('Error reading trend data from Cosmos DB:', error.message);
    res.status(500).json({ error: 'Failed to fetch trend data' });
  }
});
app.listen(process.env.PORT, () => {
  console.log(`Server running at http://localhost:${process.env.PORT}`);
});