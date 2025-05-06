// Script to check database connection and users
import mysql from 'mysql2/promise';
import * as dotenv from 'dotenv';

// Load environment variables
dotenv.config();

async function checkDatabaseConnection() {
  try {
    console.log('Checking database connection...');
    
    // Database connection details from .env
    const host = process.env.MYSQL_HOST || 'localhost';
    const user = process.env.MYSQL_USER || 'root';
    const password = process.env.MYSQL_PASSWORD || '';
    const dbName = process.env.MYSQL_DATABASE || 'modern_pet_memorial';
    
    console.log(`Connection details:
    Host: ${host}
    User: ${user}
    Password: ${password ? '[REDACTED]' : '[EMPTY]'}
    Database: ${dbName}
    `);
    
    // Try to connect to the database
    console.log('Attempting to connect to MySQL server...');
    const connection = await mysql.createConnection({
      host,
      user,
      password
    });
    
    console.log('Successfully connected to MySQL server');
    
    // Check if database exists
    console.log(`Checking if database '${dbName}' exists...`);
    const [databases] = await connection.execute('SHOW DATABASES');
    const dbExists = databases.some(db => db.Database === dbName);
    
    if (!dbExists) {
      console.log(`Database '${dbName}' does not exist. Creating it...`);
      await connection.execute(`CREATE DATABASE IF NOT EXISTS \`${dbName}\``);
      console.log(`Database '${dbName}' created successfully`);
    } else {
      console.log(`Database '${dbName}' exists`);
    }
    
    // Connect to the specific database
    console.log(`Connecting to database '${dbName}'...`);
    await connection.changeUser({ database: dbName });
    console.log(`Connected to database '${dbName}'`);
    
    // Check if users table exists
    console.log('Checking if users table exists...');
    const [tables] = await connection.execute('SHOW TABLES');
    const usersTableExists = tables.some(table => table[`Tables_in_${dbName}`] === 'users');
    
    if (!usersTableExists) {
      console.log('Users table does not exist. Database setup may be incomplete.');
    } else {
      console.log('Users table exists. Checking users...');
      
      // Get all users
      const [users] = await connection.execute('SELECT id, username, email, role, password FROM users');
      
      console.log(`Found ${users.length} users in the database:`);
      users.forEach(user => {
        console.log(`ID: ${user.id}, Username: ${user.username}, Email: ${user.email}, Role: ${user.role}`);
        console.log(`Password hash: ${user.password ? user.password.substring(0, 20) + '...' : '[EMPTY]'}`);
        console.log('---');
      });
      
      // Check for the specific user
      console.log('Checking for user "justin"...');
      const [justinUser] = await connection.execute('SELECT * FROM users WHERE username = ?', ['justin']);
      
      if (justinUser.length === 0) {
        console.log('User "justin" not found in the database');
      } else {
        console.log('User "justin" found:');
        console.log(justinUser[0]);
      }
    }
    
    // Close the connection
    await connection.end();
    console.log('Database connection closed');
    
    return true;
  } catch (error) {
    console.error('Error checking database connection:', error);
    return false;
  }
}

// Run the function
checkDatabaseConnection()
  .then(success => {
    if (success) {
      console.log('Database check completed successfully');
      process.exit(0);
    } else {
      console.error('Database check failed');
      process.exit(1);
    }
  })
  .catch(error => {
    console.error('Unexpected error:', error);
    process.exit(1);
  });
