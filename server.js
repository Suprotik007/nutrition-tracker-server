// server.js
const dotenv =require('dotenv')
dotenv.config()
const express = require('express');
const cors=require('cors')
const app = express();

app.use(express.json());
app.use(cors())

// Example route
app.get('/', (req, res) => {
  res.send('Hello from Nutrition-tracker server!');
});


// Start the server
app.listen(3000, () => {
  console.log('Server is running on http://localhost:3000');
});

// routesPath
const addedFoodsRouter = require('./routes/addedFoods');

// routesCall
app.use('/addedFoods',addedFoodsRouter)

// mongodb setup

const { MongoClient, ServerApiVersion } = require('mongodb');
const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.8n6fjbk.mongodb.net/?retryWrites=true&w=majority&appName=cluster0`;

const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  }
});

async function run() {
  try {
    // Connect the client to the server	(optional starting in v4.7)
    await client.connect();
    // Send a ping to confirm a successful connection
    await client.db("admin").command({ ping: 1 });
    console.log("Pinged your deployment. You successfully connected to MongoDB!");
  } finally {
    // Ensures that the client will close when you finish/error
    // await client.close();
  }
}
run().catch(console.dir);
