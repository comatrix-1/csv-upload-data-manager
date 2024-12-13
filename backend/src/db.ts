import sqlite3 from "sqlite3";
import { open } from "sqlite";

let dbInstance: any;

export const initDb = async () => {
  if (!dbInstance) {
    const isTestEnv = process.env.NODE_ENV === "test";
    dbInstance = await open({
      filename: isTestEnv ? ":memory:" : "./database.sqlite",
      driver: sqlite3.Database,
    });
   
    await dbInstance.exec(`
        CREATE TABLE IF NOT EXISTS data (
        post_id INTEGER NOT NULL,
        id INTEGER PRIMARY KEY,
        name TEXT NOT NULL,
        email TEXT NOT NULL,
        body TEXT NOT NULL
        );
    `);
  }
  return dbInstance;
};
