import sqlite3 from "sqlite3";
import { open } from "sqlite";

let dbInstance: any;

// Function to initialize the database connection
export const initDb = async () => {
  if (!dbInstance) {
    dbInstance = await open({
      filename: "./database.sqlite", // Path to your SQLite database file
      driver: sqlite3.Database,
    });

    // Ensure the table exists
    await dbInstance.exec(`
      CREATE TABLE IF NOT EXISTS data (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT NOT NULL,
        value TEXT NOT NULL
      );
    `);
  }
  return dbInstance;
};
