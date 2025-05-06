import { createDatabaseIfNotExists, testConnection, initDatabase } from './db';
import { resetClientPasswords } from './reset-client-passwords';
import * as dotenv from 'dotenv';

// Load environment variables
dotenv.config();

async function main() {
  try {
    console.log('Starting password reset process...');
    
    // Ensure database exists
    await createDatabaseIfNotExists();
    
    // Test connection
    const connected = await testConnection();
    if (!connected) {
      console.error('Failed to connect to database. Aborting password reset.');
      process.exit(1);
    }
    
    // Initialize database tables if needed
    await initDatabase();
    
    // Run the password reset
    await resetClientPasswords();
    
    console.log('Password reset process completed successfully.');
    process.exit(0);
  } catch (error) {
    console.error('Error during password reset process:', error);
    process.exit(1);
  }
}

main();
