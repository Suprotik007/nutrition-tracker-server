
const { MongoClient, ServerApiVersion } = require("mongodb");

const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.8n6fjbk.mongodb.net/?retryWrites=true&w=majority&appName=cluster0`;

const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  }
});

let _db;

async function connectDB() {
  if (!_db) {
    await client.connect();
    _db = client.db("nutrition-tracker");
    console.log("✅ Connected to MongoDB");
  }
}

function getDb() {
  if (!_db) {
    throw new Error("❌ Database not initialized. Call connectDB() first.");
  }
  return _db;
}

module.exports = {getDb,connectDB}
