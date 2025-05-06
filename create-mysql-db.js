// Script to create MySQL database
import mysql from 'mysql2/promise';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

const host = process.env.MYSQL_HOST || 'localhost';
const user = process.env.MYSQL_USER || 'root';
const password = process.env.MYSQL_PASSWORD || '';
const dbName = process.env.MYSQL_DATABASE || 'modern_pet_memorial';

async function createDatabase() {
  try {
    console.log(`Connecting to MySQL server at ${host} as ${user}...`);
    
    // Create a connection without specifying a database
    const connection = await mysql.createConnection({
      host,
      user,
      password,
    });

    console.log('Connected to MySQL server');
    
    // Create the database if it doesn't exist
    console.log(`Creating database ${dbName} if it doesn't exist...`);
    await connection.execute(`CREATE DATABASE IF NOT EXISTS \`${dbName}\``);
    console.log(`Database ${dbName} created or already exists`);
    
    // Close the connection
    await connection.end();
    console.log('Connection closed');
    
    return true;
  } catch (error) {
    console.error('Error creating database:', error);
    return false;
  }
}

// Run the function
createDatabase()
  .then(success => {
    if (success) {
      console.log('Database creation completed successfully');
      process.exit(0);
    } else {
      console.error('Database creation failed');
      process.exit(1);
    }
  })
  .catch(error => {
    console.error('Unexpected error:', error);
    process.exit(1);
  });
