# StoreRater Platform

A full-stack role-based Store Rating dashboard application built with the PERN/MERN-style stack (MySQL, Express, React, Node.js) and Prisma ORM.

## Architecture

This project is organized as a monorepo:
- `/frontend`: React SPA built with Vite, TailwindCSS, React Router, and Axios.
- `/backend`: Node.js API built with Express, Prisma ORM, and MySQL.

## Features

- **Role-Based Access Control (RBAC):** Strict roles for `ADMIN`, `STORE_OWNER`, and `NORMAL` users.
- **System Administrator:** Manage all users, create new stores, view platform-wide stats.
- **Store Owner:** View their specific store, average rating, and user directory of those who rated their store.
- **Normal User:** Browse the global store directory, search by name/address, and rate stores (1-5 stars).
- **Security:** Secure HTTP-only JWT cookie authentication, password hashing with bcrypt, and express-rate-limit.

## Getting Started

### Prerequisites
- Node.js (v18+)
- MySQL Database

### Backend Setup
1. Navigate to the backend directory: `cd backend`
2. Install dependencies: `npm install`
3. Create a `.env` file (see `.env.example` if available) and add your `DATABASE_URL` and `JWT_SECRET`.
4. Sync the database schema: `npx prisma db push`
5. Start the backend development server: `npm run dev` (Runs on http://localhost:4000)

### Frontend Setup
1. Navigate to the frontend directory: `cd frontend`
2. Install dependencies: `npm install`
3. Start the Vite development server: `npm run dev` (Runs on http://localhost:5173)

## Default Admin Credentials
If a seed script was run, you can log in as an admin using:
- **Email:** `admin@platform.com`
- **Password:** `AdminPassword123!`
