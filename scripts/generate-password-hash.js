#!/usr/bin/env node

/**
 * Script to generate bcrypt password hash
 * Usage: node scripts/generate-password-hash.js <password>
 */

const bcrypt = require('bcrypt');

const password = process.argv[2];

if (!password) {
  console.error('Error: Password is required');
  console.log('Usage: node scripts/generate-password-hash.js <password>');
  process.exit(1);
}

const hash = bcrypt.hashSync(password, 10);

console.log('\n=== Password Hash Generated ===');
console.log('Password:', password);
console.log('Hash:', hash);
console.log('\nAdd this to your .env.local file:');
console.log(`ADMIN_PASSWORD_HASH=${hash}`);
console.log('');
