// Direct password update using a hardcoded hash
import mysql from 'mysql2/promise';
import * as dotenv from 'dotenv';

// Load environment variables
dotenv.config();

async function updateClientPassword() {
  // Create a connection pool
  const pool = mysql.createPool({
    host: process.env.MYSQL_HOST || 'localhost',
    user: process.env.MYSQL_USER || 'root',
    password: process.env.MYSQL_PASSWORD || '',
    database: process.env.MYSQL_DATABASE || 'modern_pet_memorial',
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0
  });

  try {
    console.log('Starting direct password update...');
    
    // Hardcoded password hash for "justin" (the username as password)
    const passwordHash = "85b3ef5bb98657664809c0b66a012078f25fd5fbaa1f7769d301f278cc948ae72a530d4f22603648507d9f9962abb0cc52c8709ca60bc90e947aa3867950039b.9b7bbff7702f240211e2fbc3b5bec2515";
    
    // Update the password directly
    await pool.execute(
      'UPDATE users SET password = ? WHERE username = ?',
      [passwordHash, 'justin']
    );
    
    console.log('Password updated successfully');
    
    // Verify the update
    const [rows] = await pool.execute(
      'SELECT id, username, password FROM users WHERE username = ?',
      ['justin']
    );
    
    if (rows.length > 0) {
      console.log(`Verified user: ${rows[0].username} (ID: ${rows[0].id})`);
      console.log(`New password hash: ${rows[0].password}`);
    } else {
      console.log('User not found after update');
    }
  } catch (error) {
    console.error('Error updating password:', error);
  } finally {
    // Close the connection pool
    await pool.end();
  }
}

// Run the script
updateClientPassword()
  .then(() => console.log('Password update process completed'))
  .catch(err => console.error('Error:', err));
