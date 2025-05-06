import { pool } from './db';
import { hashPassword } from './auth';
import { UserRole } from '@shared/schema';

/**
 * Script to reset client passwords to match their usernames
 * This is a temporary fix to allow clients to log in
 */
export async function resetClientPasswords() {
  try {
    console.log('Starting client password reset...');

    // Get all client users
    const [rows] = await pool.execute(
      'SELECT id, username FROM users WHERE role = ?',
      [UserRole.CLIENT]
    );

    const clients = rows as any[];
    console.log(`Found ${clients.length} client accounts to update`);

    // Update each client's password to match their username
    for (const client of clients) {
      const username = client.username;
      const hashedPassword = await hashPassword(username);

      console.log(`Resetting password for client: ${username} (ID: ${client.id})`);

      await pool.execute(
        'UPDATE users SET password = ? WHERE id = ?',
        [hashedPassword, client.id]
      );

      console.log(`Password reset successful for ${username}`);
    }

    console.log('Client password reset completed successfully');
  } catch (error) {
    console.error('Error resetting client passwords:', error);
  } finally {
    // Close the connection pool
    await pool.end();
  }
}

// Execute the reset function when this file is run directly
// This will be called when imported from run-password-reset.ts
