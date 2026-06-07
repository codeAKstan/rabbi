import { MongoClient, Db } from "mongodb";
import { hashPassword } from "./auth";

const uri = process.env.MONGODB_URI;

if (!uri) {
  throw new Error("Please define the MONGODB_URI environment variable inside .env");
}

let client: MongoClient;
let clientPromise: Promise<MongoClient>;

if (process.env.NODE_ENV === "development") {
  // In development mode, use a global variable so that the value
  // is preserved across module reloads caused by HMR (Hot Module Replacement).
  const globalWithMongo = global as typeof globalThis & {
    _mongoClientPromise?: Promise<MongoClient>;
  };

  if (!globalWithMongo._mongoClientPromise) {
    client = new MongoClient(uri);
    globalWithMongo._mongoClientPromise = client.connect();
  }
  clientPromise = globalWithMongo._mongoClientPromise;
} else {
  // In production mode, it's best to not use a global variable.
  client = new MongoClient(uri);
  clientPromise = client.connect();
}

/**
 * Connect to MongoDB and return client and db instances.
 * Automatically triggers the admin seeding logic.
 */
export async function connectToDatabase(): Promise<{ client: MongoClient; db: Db }> {
  const connectedClient = await clientPromise;
  const db = connectedClient.db();
  
  // Seed admin user
  await seedAdmin(db);
  
  return { client: connectedClient, db };
}

/**
 * Seeds the default admin credentials if they do not exist
 */
async function seedAdmin(db: Db) {
  try {
    const usersCollection = db.collection("users");
    const adminEmail = "admin@rabbimenachem.com";
    const existingAdmin = await usersCollection.findOne({ email: adminEmail });
    
    if (!existingAdmin) {
      console.log("Seeding admin user into MongoDB...");
      const hashedPassword = hashPassword("rabbi123");
      await usersCollection.insertOne({
        email: adminEmail,
        password: hashedPassword,
        role: "admin",
        createdAt: new Date(),
      });
      console.log("Admin user seeded successfully.");
    }
  } catch (error) {
    console.error("Failed to seed admin user:", error);
  }
}
