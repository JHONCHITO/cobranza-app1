import { MongoClient, Db } from "mongodb";

declare global {
  // eslint-disable-next-line no-var
  var _mongoClient: MongoClient | null;
  // eslint-disable-next-line no-var
  var _mongoDb: Db | null;
}

global._mongoClient = global._mongoClient ?? null;
global._mongoDb = global._mongoDb ?? null;

const MONGODB_URI = process.env.MONGODB_URI;
const MONGODB_DB = process.env.MONGODB_DB;

if (!MONGODB_URI) {
  throw new Error("❌ MONGODB_URI no está definida en las variables de entorno");
}

if (!MONGODB_DB) {
  throw new Error("❌ MONGODB_DB no está definida en las variables de entorno");
}

// A partir de aquí ya sabemos que NO son undefined
const uri = MONGODB_URI as string;
const dbName = MONGODB_DB as string;

let cachedClient: MongoClient | null = global._mongoClient;
let cachedDb: Db | null = global._mongoDb;

export async function connectToDatabase(): Promise<{ client: MongoClient; db: Db }> {
  if (cachedClient && cachedDb) {
    return { client: cachedClient, db: cachedDb };
  }

  const client = new MongoClient(uri); // <- ya no da error
  await client.connect();

  const db = client.db(dbName);

  cachedClient = client;
  cachedDb = db;

  global._mongoClient = client;
  global._mongoDb = db;

  console.log("✅ Conectado a MongoDB:", dbName);

  return { client, db };
}

export async function getCollection(collectionName: string) {
  const { db } = await connectToDatabase();
  return db.collection(collectionName);
}
