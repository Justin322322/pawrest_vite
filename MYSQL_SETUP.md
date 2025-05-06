# MySQL Setup for Modern Pet Memorial

This guide explains how to set up and use MySQL for authentication and data storage in the Modern Pet Memorial application.

## Prerequisites

1. MySQL Server installed and running
2. Node.js and npm installed

## Setup Steps

### 1. Create MySQL Database

```sql
CREATE DATABASE modern_pet_memorial;
```

### 2. Configure Environment Variables

Create or update the `.env` file in the project root with the following variables:

```
# Database Configuration
USE_MYSQL=true
MYSQL_HOST=localhost
MYSQL_USER=your_mysql_username
MYSQL_PASSWORD=your_mysql_password
MYSQL_DATABASE=modern_pet_memorial

# Session Configuration
SESSION_SECRET=your-secret-key-here

# Environment
NODE_ENV=development
```

Replace `your_mysql_username` and `your_mysql_password` with your actual MySQL credentials.

### 3. Initialize Database Tables

The application will automatically create the necessary tables when started with MySQL enabled. You can also manually push the schema using:

```bash
npm run db:mysql:push
```

### 4. Run the Application with MySQL

```bash
npm run dev:mysql
```

This will start the application with MySQL storage enabled.

## Database Structure

The MySQL database includes the following tables:

1. **users** - Stores user account information
2. **services** - Stores service provider offerings
3. **bookings** - Stores booking information
4. **reviews** - Stores user reviews
5. **sessions** - Stores user session data

## Switching Between Storage Implementations

The application supports two storage implementations:

1. **Memory Storage** - For development and testing (default)
2. **MySQL Storage** - For production use

To switch between them:

- For Memory Storage: Set `USE_MYSQL=false` in `.env` or run `npm run dev`
- For MySQL Storage: Set `USE_MYSQL=true` in `.env` or run `npm run dev:mysql`

## Troubleshooting

### Connection Issues

If you encounter connection issues:

1. Verify MySQL server is running
2. Check your MySQL credentials in `.env`
3. Ensure the database exists
4. Check MySQL user permissions

### Schema Issues

If you encounter schema-related issues:

1. Run `npm run db:mysql:push` to update the schema
2. Check the console for specific error messages

## Additional Tools

- **Database Studio**: Run `npm run db:mysql:studio` to open Drizzle Studio for database visualization and management
