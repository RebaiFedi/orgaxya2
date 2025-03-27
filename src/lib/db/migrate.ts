const { drizzle } = require("drizzle-orm/mysql2");
const { migrate } = require("drizzle-orm/mysql2/migrator");
const mysql = require("mysql2/promise");
const path = require("path");

async function runMigrations() {
  console.log("Creating database connection...");

  const connection = await mysql.createConnection({
    host: process.env.DATABASE_HOST || "localhost",
    user: process.env.DATABASE_USERNAME || "root",
    password: process.env.DATABASE_PASSWORD || "",
    database: process.env.DATABASE_NAME || "journal_transactions",
  });

  console.log("Initializing drizzle...");
  const db = drizzle(connection);

  console.log("Running migrations...");
  await migrate(db, { migrationsFolder: path.resolve("drizzle") });
  
  console.log("Migrations completed!");

  await connection.end();
  process.exit(0);
}

runMigrations().catch((err) => {
  console.error("Error during migration:", err);
  process.exit(1);
});
