# Database Setup Instructions

This guide will help you set up the MySQL database and populate it with real user data.

## Prerequisites

- MySQL 8.0+ installed and running
- Node.js and npm installed
- Access to MySQL command line or a GUI tool like phpMyAdmin

## Step 1: Create Database

Connect to MySQL and create the database:

```sql
CREATE DATABASE saas_dashboard CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
```

## Step 2: Create Tables

Run the schema file to create all necessary tables:

```bash
mysql -u root -p saas_dashboard < schema_mysql.sql
```

Or execute the SQL commands from `schema_mysql.sql` in your MySQL GUI tool.

## Step 3: Insert User Data

Run the insert script to populate the database with users:

```bash
mysql -u root -p saas_dashboard < insert_users.sql
```

This will create:
- **10 active users** with emails `gamesme0000@gmail.com` to `gamesme0009@gmail.com`
- **5 inactive users** with emails `dummy0001@gmail.com` to `dummy0005@gmail.com`
- All users have password: `12345678`
- Sample plans, support tickets, activity logs, settings, and addons

## Step 4: Configure Environment

Create a `.env` file in the backend directory:

```env
# Database Configuration
DB_HOST=localhost
DB_PORT=3306
DB_USER=root
DB_PASSWORD=your_mysql_password
DB_NAME=saas_dashboard

# Server Configuration
PORT=3001
NODE_ENV=development
```

## Step 5: Start the Backend Server

```bash
cd packages/backend
npm install
npm run dev
```

The server will start on `http://localhost:3001`

## Step 6: Start the Frontend

```bash
cd packages/frontend
npm install
npm run dev
```

The frontend will start on `http://localhost:5173`

## Login Credentials

Use these credentials to test the application:

### Active Users (can login):
- **Email**: `gamesme0000@gmail.com` - **Password**: `12345678` (Super Admin)
- **Email**: `gamesme0001@gmail.com` - **Password**: `12345678` (Admin)
- **Email**: `gamesme0002@gmail.com` - **Password**: `12345678` (User)
- **Email**: `gamesme0003@gmail.com` - **Password**: `12345678` (User)
- **Email**: `gamesme0004@gmail.com` - **Password**: `12345678` (User)
- **Email**: `gamesme0005@gmail.com` - **Password**: `12345678` (User)
- **Email**: `gamesme0006@gmail.com` - **Password**: `12345678` (User)
- **Email**: `gamesme0007@gmail.com` - **Password**: `12345678` (User)
- **Email**: `gamesme0008@gmail.com` - **Password**: `12345678` (User)
- **Email**: `gamesme0009@gmail.com` - **Password**: `12345678` (User)

### Inactive Users (cannot login):
- **Email**: `dummy0001@gmail.com` - **Password**: `12345678`
- **Email**: `dummy0002@gmail.com` - **Password**: `12345678`
- **Email**: `dummy0003@gmail.com` - **Password**: `12345678`
- **Email**: `dummy0004@gmail.com` - **Password**: `12345678`
- **Email**: `dummy0005@gmail.com` - **Password**: `12345678`

## Features Available

1. **User Management**: View, edit, and delete users
2. **Confirmation Dialogs**: All delete actions require confirmation
3. **Global Notifications**: Success/error messages for all actions
4. **Real Database Data**: All data comes from MySQL database
5. **User Profiles**: Detailed user profile pages
6. **Dashboard Stats**: Real statistics from database
7. **Support Tickets**: Sample support ticket data
8. **Plans & Addons**: Sample plan and addon data

## Testing the Application

1. Login with any active user account
2. Navigate to the Users page to see all users
3. Try deleting a user - you'll see a confirmation dialog
4. Check notifications for successful actions
5. View user profiles by clicking the eye icon
6. Test the delete account feature in the Profile page

## Troubleshooting

### Database Connection Issues
- Ensure MySQL is running
- Check your `.env` file credentials
- Verify the database name and user permissions

### Login Issues
- Make sure you're using active user accounts (gamesme0000-0009)
- Check that the password is exactly `12345678`
- Verify the users table was populated correctly

### Server Issues
- Check the backend console for error messages
- Ensure all npm packages are installed
- Verify the database connection is working

## Database Schema

The application uses the following main tables:
- `users` - User accounts and authentication
- `plans` - Subscription plans
- `support_tickets` - Customer support tickets
- `activity_logs` - User activity tracking
- `settings` - Application settings
- `addons` - Plugin/addon management

## Security Notes

- All passwords are hashed with bcrypt
- The database uses prepared statements to prevent SQL injection
- User roles determine access levels (superadmin, admin, user)
- Inactive users cannot login to the system
