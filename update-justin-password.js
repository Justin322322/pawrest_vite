// Script to update justin's password directly
import mysql from 'mysql2/promise';
import * as dotenv from 'dotenv';

// Load environment variables
dotenv.config();

async function updateJustinPassword() {
  try {
    console.log('Starting justin password update...');
    
    // Database connection details from .env
    const host = process.env.MYSQL_HOST || 'localhost';
    const user = process.env.MYSQL_USER || 'root';
    const password = process.env.MYSQL_PASSWORD || '';
    const dbName = process.env.MYSQL_DATABASE || 'modern_pet_memorial';
    
    // Connect to the database
    console.log('Connecting to database...');
    const connection = await mysql.createConnection({
      host,
      user,
      password,
      database: dbName
    });
    
    console.log('Connected to database');
    
    // Set a simple password for justin
    const simplePassword = '123456';
    
    // Update justin's password directly
    console.log(`Updating justin's password to '${simplePassword}'...`);
    await connection.execute(
      'UPDATE users SET password = ? WHERE username = ?',
      [simplePassword, 'justin']
    );
    
    console.log('Password updated successfully');
    
    // Verify the update
    const [users] = await connection.execute(
      'SELECT id, username, password FROM users WHERE username = ?',
      ['justin']
    );
    
    if (users.length > 0) {
      console.log(`Verified user: ${users[0].username} (ID: ${users[0].id})`);
      console.log(`New password: ${users[0].password}`);
    } else {
      console.log('User not found after update');
    }
    
    // Close the connection
    await connection.end();
    console.log('Database connection closed');
    
    return true;
  } catch (error) {
    console.error('Error updating justin password:', error);
    return false;
  }
}

// Run the function
updateJustinPassword()
  .then(success => {
    if (success) {
      console.log('Justin password update completed successfully');
      process.exit(0);
    } else {
      console.error('Justin password update failed');
      process.exit(1);
    }
  })
  .catch(error => {
    console.error('Unexpected error:', error);
    process.exit(1);
  });
