import dotenv from 'dotenv';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import pool from '../config/db.js';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const schema = fs.readFileSync(path.join(__dirname, 'schema.sql'), 'utf8');

pool.query(schema, (err, res) => {
  if (err) {
    if (err.code === '42710') {
      console.log('Schema already exists, skipping migration');
      pool.end();
      process.exit(0);
    }
    console.error('Migration error:', err.message);
    process.exit(1);
  }
  console.log('Database migrated successfully');
  pool.end();
});
