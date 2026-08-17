# Store Rating Web Application 🏪⭐

A modern, production-style **Full-Stack Store Rating Web Application** built with **React.js**, **Express.js**, **Node.js**, and **MySQL**. Featuring role-based access control for **System Administrators**, **Normal Users**, and **Store Owners**, complete with JWT authentication, validation, search/sort/filter capabilities, database schema scripts, and dynamic React UI.

---

## 🌟 Key Features & Role Breakdown

### 1. 🛡️ System Administrator
* **Dashboard Overview**: Metrics for Total Users, Total Stores, Total Ratings, and System Average Rating.
* **User Management**:
  * View, search, filter, and sort Normal Users, Store Owners, and System Admins.
  * Search by Name, Email, or Address. Filter by Role. Sort by columns ascending/descending.
  * View complete user profile details.
  * **Store Owner Special Feature**: Displays assigned Store Name and store's Average Rating for Store Owner accounts.
  * Add new System Admins, Normal Users, or Store Owners with real-time validation.
* **Store Directory**:
  * Add new stores and assign Store Owner accounts.
  * View, search, and sort stores by Name, Email, Address, or Overall Rating.

### 2. 👤 Normal User
* **Self-Registration**: Register with Name (20–60 chars), Email, Address (max 400 chars), and Password (8–16 chars, 1 uppercase, 1 special char).
* **Browse Stores**: View all stores with Store Name, Address, Overall Rating, and User's submitted rating.
* **Search & Filter**: Real-time search by Store Name or Address/City, plus sort by rating or name.
* **Submit & Modify Ratings**: Submit 1 to 5-star ratings with instant store average updates. Modify previously submitted ratings anytime.
* **Account Security**: Update password and logout.

### 3. 🏪 Store Owner
* **Store Dashboard**: Displays assigned store details, overall average rating score, and rating distribution breakdown (5-star down to 1-star).
* **Rating Analytics**: View complete list of customers who submitted ratings for their store (User Name, Email, Address, Rating score, Date updated).
* **Search & Sort Submissions**: Search rating submitters by Name, Email, or Address, and sort by date or score.

---

## 🛠️ Technology Stack & Validation Rules

* **Frontend**: React.js 18, Vite, Lucide React icons, Custom Glassmorphic CSS design system.
* **Backend**: Express.js, Node.js, JWT (`jsonwebtoken`), Password Hashing (`bcryptjs`).
* **Database**: MySQL 8.0+ via `mysql2/promise` pool with unique constraints, check constraints, and indexing (with zero-config SQLite auto-fallback if local MySQL is unavailable).
* **Strict System Validation Rules**:
  * **Name**: 20–60 characters.
  * **Address**: Maximum 400 characters.
  * **Password**: 8–16 characters, at least 1 uppercase letter (`[A-Z]`) and 1 special character (`[!@#$%^&*(),.?":{}|<>]`).
  * **Email**: Valid email format.
  * **Rating**: Integer from 1 to 5.

---

## 🚀 Quick Setup & Installation Guide

### Prerequisites
* **Node.js**: v18.x or higher installed
* **MySQL Server**: MySQL 8.0+ running on port 3306 (or rely on auto-fallback SQLite for instant evaluation)

### Step 1: Install Dependencies
Run the following root command to automatically install all dependencies for both backend and frontend:

```bash
npm run install:all
```

Or manually:
```bash
cd backend && npm install
cd ../frontend && npm install
```

---

## 🗄️ MySQL Database Setup & Configuration

### Option A: Standard MySQL Database Setup

1. Open your MySQL client or terminal (MySQL Workbench, phpMyAdmin, or `mysql` CLI).
2. Create the database and tables using the provided SQL schema file:

```sql
SOURCE backend/scripts/schema.sql;
```

3. Configure your database connection in `backend/.env`:

```env
PORT=5000
NODE_ENV=development
JWT_SECRET=super_secret_store_rating_jwt_key_2026_x987
JWT_EXPIRES_IN=24h

# MySQL Configuration
DB_HOST=localhost
DB_PORT=3306
DB_USER=root
DB_PASSWORD=your_mysql_password
DB_NAME=store_rating_db
USE_SQLITE=false
```

4. Seed default initial data (Admin, Store Owners, Normal Users, Stores, and Ratings):

```bash
npm run seed
```

### Option B: Automatic SQLite Fallback (Zero-Config Testing)
If MySQL is not installed locally on your machine, set `USE_SQLITE=true` in `backend/.env` or simply run the seed command. The app will automatically spin up an embedded SQLite database (`store_rating.sqlite`) with identical schema enforcement!

---

## 🏃 Running the Application

To start both the Express Backend (Port 5000) and React Vite Frontend (Port 3000) concurrently:

```bash
npm run dev
```

* **Frontend App URL**: `http://localhost:3000`
* **Backend API URL**: `http://localhost:5000/api`

---

## 🔑 Test Credentials for Evaluation

Use the pre-seeded accounts below to test all three roles out of the box:

| Role | Email Address | Password | Details |
| :--- | :--- | :--- | :--- |
| **System Admin** | `admin@storerating.com` | `Admin@1234` | System Administrator Account |
| **Store Owner 1** | `owner.grand@storerating.com` | `Owner@1234` | Owner of *Grand Supermarket Central* |
| **Store Owner 2** | `owner.tech@storerating.com` | `Owner@5678` | Owner of *Tech World Electronics* |
| **Normal User 1** | `johnathan.user@gmail.com` | `User@12345` | Johnathan Edward Resident User |
| **Normal User 2** | `samantha.user@gmail.com` | `User@67890` | Samantha Marie Customer Account |
| **Normal User 3** | `robert.user@gmail.com` | `User@99999` | Robert Alexander Shopping User |

---

## 📡 API Overview

### Authentication (`/api/auth`)
* `POST /api/auth/login`: Single login for all roles.
* `POST /api/auth/register`: Self-registration for Normal Users.
* `PUT /api/auth/update-password`: Update password for logged-in user.
* `GET /api/auth/me`: Get current user profile.

### Admin (`/api/admin`) — Protected (`SYSTEM_ADMIN`)
* `GET /api/admin/dashboard`: Stats summary (Total Users, Stores, Ratings, Avg Rating).
* `GET /api/admin/users`: Search, filter, and sort users (includes store owner rating details).
* `POST /api/admin/users`: Create Admin, User, or Store Owner.
* `GET /api/admin/stores`: Search and sort stores directory.
* `POST /api/admin/stores`: Create store and assign owner.

### Stores & Ratings (`/api/stores` & `/api/ratings`)
* `GET /api/stores`: List stores with search, filter, overall rating, and user's rating.
* `POST /api/ratings`: Submit or update 1–5 star rating for a store (Normal User).

### Store Owner (`/api/owner`) — Protected (`STORE_OWNER`)
* `GET /api/owner/dashboard`: Store details, avg rating score, rating distribution.
* `GET /api/owner/ratings`: View customers who submitted ratings for the store.
