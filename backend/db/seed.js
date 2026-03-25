import dotenv from 'dotenv';
import bcrypt from 'bcrypt';
import { v4 as uuidv4 } from 'uuid';
import pool from '../config/db.js';

dotenv.config();

const seedSuperAdmin = async () => {
  try {
    const { SUPERADMIN_NAME, SUPERADMIN_EMAIL, SUPERADMIN_PASSWORD } = process.env;

    if (!SUPERADMIN_NAME || !SUPERADMIN_EMAIL || !SUPERADMIN_PASSWORD) {
      console.error('Superadmin credentials missing in .env');
      process.exit(1);
    }

    // Check if any superadmin exists
    const checkResult = await pool.query("SELECT * FROM users WHERE role = 'superadmin'");
    if (checkResult.rows.length > 0) {
      console.log('Superadmin already exists');
      pool.end();
      process.exit(0);
    }

    const hashedPassword = await bcrypt.hash(SUPERADMIN_PASSWORD, 10);
    const id = uuidv4();

    await pool.query(
      'INSERT INTO users (id, name, email, password, role) VALUES ($1, $2, $3, $4, $5)',
      [id, SUPERADMIN_NAME, SUPERADMIN_EMAIL, hashedPassword, 'superadmin']
    );

    console.log('Superadmin created successfully');
    pool.end();
  } catch (err) {
    if (err.code === '23505') {
      console.error('Superadmin already exists');
    } else {
      console.error('Seeding error:', err.message);
    }
    process.exit(1);
  }
};

seedSuperAdmin();
