const Database = require('better-sqlite3');
const db = new Database('./data/database.sqlite');

// Test database connection and check if users table exists
try {
  const result = db.prepare("SELECT name FROM sqlite_master WHERE type='table' AND name='users'").get();
  console.log('Database connection successful!');
  console.log('Users table exists:', result ? 'Yes' : 'No');
  
  // Check table structure
  const tableInfo = db.prepare("PRAGMA table_info(users)").all();
  console.log('Users table structure:');
  tableInfo.forEach(col => console.log(`  ${col.name}: ${col.type}`));
} catch (error) {
  console.error('Database error:', error);
} finally {
  db.close();
}