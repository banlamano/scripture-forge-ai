import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import * as schema from "./schema";

// Check if DATABASE_URL is configured
const connectionString = process.env.DATABASE_URL;

let db: ReturnType<typeof drizzle<typeof schema>>;

if (connectionString) {
  // Production/configured mode - use real database
  const client = postgres(connectionString, {
    max: 10,
    idle_timeout: 20,
    connect_timeout: 10,
  });
  db = drizzle(client, { schema });
} else {
  // Development mode without database - create mock
  console.warn("⚠️ DATABASE_URL not configured. Running in demo mode.");
  
  // Create a mock that won't crash the app
  db = new Proxy({} as ReturnType<typeof drizzle<typeof schema>>, {
    get: () => {
      return () => Promise.resolve([]);
    },
  });
}

export { db };
export type Database = typeof db;
export * from "./schema";
