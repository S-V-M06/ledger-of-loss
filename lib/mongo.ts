import { MongoClient, Db } from 'mongodb';
import dotenv from 'dotenv';

dotenv.config();

const uri = process.env.MONGODB_URI || 'mongodb://admin:adminpassword@localhost:27017/ledger_of_loss?authSource=admin';
const dbName = process.env.MONGODB_DB || 'ledger_of_loss';

const globalForMongo = globalThis as unknown as {
  mongoClient?: MongoClient;
};

let client: MongoClient;

if (process.env.NODE_ENV === 'development' || !process.env.NODE_ENV) {
  if (!globalForMongo.mongoClient) {
    globalForMongo.mongoClient = new MongoClient(uri);
  }
  client = globalForMongo.mongoClient;
} else {
  client = new MongoClient(uri);
}

export async function getMongoClient(): Promise<MongoClient> {
  return client;
}

export async function getDb(): Promise<Db> {
  await client.connect();
  return client.db(dbName);
}
