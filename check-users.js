// Script to check users in the database
import mysql from 'mysql2/promise';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

// Database connection details
const host = process.env.MYSQL_HOST || 'localhost';
const user = process.env.MYSQL_USER || 'root';
const password = process.env.MYSQL_PASSWORD || '';
const dbName = process.env.MYSQL_DATABASE || 'modern_pet_memorial';

async function checkUsers() {
  try {
    console.log(`Connecting to MySQL database at ${host}...`);
    
    // Create a connection to the database
    const connection = await mysql.createConnection({
      host,
      user,
      password,
      database: dbName,
    });

    console.log('Connected to MySQL database');
    
    // Get all users
    const [users] = await connection.execute('SELECT * FROM users');
    
    console.log(`Found ${users.length} users in the database:`);
    
    // Display user information
    users.forEach((user, index) => {
      console.log(`\nUser ${index + 1}:`);
      console.log(`ID: ${user.id}`);
      console.log(`Username: ${user.username}`);
      console.log(`Role: ${user.role}`);
      console.log(`Email: ${user.email}`);
      console.log(`Full Name: ${user.full_name}`);
      console.log(`Password Hash: ${user.password}`);
      console.log(`Is Verified: ${user.is_verified ? 'Yes' : 'No'}`);
    });
    
    // Close the connection
    await connection.end();
    console.log('\nConnection closed');
    
    return true;
  } catch (error) {
    console.error('Error checking users:', error);
    return false;
  }
}

// Run the function
checkUsers()
  .then(success => {
    if (success) {
      console.log('User check completed successfully');
      process.exit(0);
    } else {
      console.error('User check failed');
      process.exit(1);
    }
  })
  .catch(error => {
    console.error('Unexpected error:', error);
    process.exit(1);
  });
