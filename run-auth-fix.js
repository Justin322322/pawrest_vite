// Script to run the auth fix
import { exec } from 'child_process';
import * as dotenv from 'dotenv';

// Load environment variables
dotenv.config();

console.log('Starting authentication fix process...');

// Run the fix-auth-issues.js script
exec('node fix-auth-issues.js', (error, stdout, stderr) => {
  if (error) {
    console.error(`Error executing fix-auth-issues.js: ${error.message}`);
    return;
  }
  
  if (stderr) {
    console.error(`stderr: ${stderr}`);
    return;
  }
  
  console.log(`fix-auth-issues.js output: ${stdout}`);
  console.log('Authentication fix completed successfully');
  
  // Restart the server
  console.log('Restarting the server...');
  console.log('Please manually restart your development server after this script completes');
});
