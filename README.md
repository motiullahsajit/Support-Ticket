# Support Ticket System

A simple Support Ticket System built with React (Polaris UI) for the frontend and Node.js (Express) with MySQL for the backend. This project allows users to create, manage, and track support tickets.

## Project Structure

```
support-ticket/
├── support-ticket-client/   # React (Polaris) Frontend
├── support-ticket-server/   # Node.js (Express) Backend
├── database_setup.sql       # SQL script for database setup
└── support_ticket_system.sql # MySQL database dump
```

##  Prerequisites

- **Node.js** (v14 or higher)
- **NPM**
- **XAMPP** (for running MySQL locally)

##  Installation & Setup

1. **Clone the Repository**
   ```bash
   git clone https://github.com/motiullahsajit/Support-Ticket.git
   cd support-ticket
   ```

2. **Database Setup**
   - **Option 1:** Run the SQL script:
     1. Open XAMPP and start MySQL.
     2. Import `database_setup.sql` in phpMyAdmin.

   - **Option 2:** Directly import the database:
     1. Import `support_ticket_system.sql` using phpMyAdmin.

3. **Database Configuration**
   - Edit the `db.ts` file in `support-ticket-server` with your MySQL credentials:
     ```typescript
     const pool = mysql.createPool({
       host: 'localhost',
       user: 'root',
       password: '',
       database: 'support_ticket_system',
     });
     ```

4. **Environment Variables**
   - Both `support-ticket-client` and `support-ticket-server` contain `.env` files with pre-configured variables.

5. **Install Dependencies**
   ```bash
   # For the server
   cd support-ticket-server
   npm install

   # For the client
   cd ../support-ticket-client
   npm install
   ```

6. **Run the Application**
   - **Backend (Server):**
     ```bash
     cd support-ticket-server
     npm run watch & npm run dev
     ```
   - **Frontend (Client):**
     ```bash
     cd support-ticket-client
     npm run dev
     ```

7. **Access the Application**
   Open your browser and visit: [http://localhost:5173](http://localhost:5173)

## Pre-Registered User Accounts

You can log in with the following pre-created accounts:

- **Admin:**
  - **Email:** admin@gmail.com
  - **Password:** admin

- **Executive:**
  - **Email:** executive@gmail.com
  - **Password:** executive

- **User:**
  - **Email:** user@gmail.com
  - **Password:** user

## User Roles

- **Admin:** Can manage tickets, assign executives, and manage users.
- **Executive:** Handles assigned tickets and updates ticket statuses.
- **User:** Creates support tickets and tracks their progress.

## Folder Structure

- **support-ticket-client:** React project with Polaris UI components.
- **support-ticket-server:** Express server handling APIs, authentication, and database queries.
- **database_setup.sql:** SQL file to create database tables.
- **support_ticket_system.sql:** SQL dump of the full database.

## Tech Stack

- **Frontend:** React, Polaris UI
- **Backend:** Node.js, Express
- **Database:** MySQL
- **Authentication:** JWT


