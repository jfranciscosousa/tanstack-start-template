/* eslint-disable */
import { Pool } from "pg";

// This only works for postgres!
export async function truncateAll() {
  const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
  });

  const tables = ["User", "Session"]; // Explicitly list table names from our schema

  try {
    for (const table of tables) {
      await pool.query(`TRUNCATE TABLE "${table}" RESTART IDENTITY CASCADE`);
    }
  } finally {
    await pool.end();
  }
}
