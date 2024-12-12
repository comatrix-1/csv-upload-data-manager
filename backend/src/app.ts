import sqlite3 from "sqlite3";
import { open } from "sqlite";

export const initDb = async () => {
  const db = await open({
    filename: "./data.db",
    driver: sqlite3.Database,
  });

  await db.exec(`
    CREATE TABLE IF NOT EXISTS data (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      field1 TEXT,
      field2 TEXT,
      field3 TEXT
    );
  `);

  return db;
};
