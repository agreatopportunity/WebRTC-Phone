#!/usr/bin/env node

/**
 * Create or update an owner account
 * Usage: node scripts/create-owner.js
 */

import 'dotenv/config';
import mysql from 'mysql2/promise';
import bcrypt from 'bcrypt';
import readline from 'readline';

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

const question = (prompt) => new Promise((resolve) => rl.question(prompt, resolve));

async function main() {
  console.log(`
╔═══════════════════════════════════════════════════════════════╗
║              Create/Update Owner Account                      ║
╚═══════════════════════════════════════════════════════════════╝
  `);
  
  const config = {
    host: process.env.MYSQL_HOST || 'localhost',
    port: parseInt(process.env.MYSQL_PORT || '3306'),
    user: process.env.MYSQL_USER || 'root',
    password: process.env.MYSQL_PASSWORD || '',
    database: process.env.MYSQL_DATABASE || 'webrtc_phone'
  };
  
  let db;
  
  try {
    db = await mysql.createConnection(config);
    console.log('✓ Connected to database\n');
  } catch (err) {
    console.error('✗ Could not connect to database:', err.message);
    console.log('\nMake sure MySQL is running and your .env file has correct settings.');
    process.exit(1);
  }
  
  const username = await question('Username: ');
  if (!username || username.length < 3) {
    console.log('Username must be at least 3 characters');
    process.exit(1);
  }
  
  const password = await question('Password: ');
  if (!password || password.length < 8) {
    console.log('Password must be at least 8 characters');
    process.exit(1);
  }
  
  const email = await question('Email (optional): ');
  
  try {
    const passwordHash = await bcrypt.hash(password, 10);
    
    // Check if user exists
    const [existing] = await db.query('SELECT id FROM owners WHERE username = ?', [username]);
    
    if (existing.length > 0) {
      // Update existing
      await db.query(
        'UPDATE owners SET password_hash = ?, email = ? WHERE username = ?',
        [passwordHash, email || null, username]
      );
      console.log(`\n✓ Updated existing owner: ${username}`);
    } else {
      // Create new
      await db.query(
        'INSERT INTO owners (username, password_hash, email) VALUES (?, ?, ?)',
        [username, passwordHash, email || null]
      );
      console.log(`\n✓ Created new owner: ${username}`);
    }
    
    console.log('\nYou can now log in at /login with these credentials.');
    
  } catch (err) {
    console.error('Error:', err.message);
  }
  
  await db.end();
  rl.close();
}

main();
