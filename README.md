# QueryCraft

QueryCraft is a full-stack web application that empowers users to connect databases, pose questions in natural language, convert them into secure, optimized SQL via an LLM, execute them safely, and instantly render interactive charts and exportable reports.

## Features
* **Backend Architecture:** Node.js with Express.js
* **Database Integration:** MongoDB for app metadata (users, connections, history)
* **Authentication:** Secure user registration and login utilizing JWT and bcrypt password hashing
* **Connection Management:** Users can add target databases securely, with connection strings encrypted via AES-256

## Getting Started

### Prerequisites
* Node.js (v16+)
* MongoDB (Local instance or MongoDB Atlas)

### Backend Setup

1. **Navigate to the backend directory:**
   ```bash
   cd backend
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Environment Configuration:**
   Copy the example environment file and update the values:
   ```bash
   cp .env.example .env
   ```
   *Make sure to provide secure strings for `JWT_SECRET` and `ENCRYPTION_KEY` (must be 32 bytes for AES-256).*

4. **Run the Development Server:**
   ```bash
   npm run dev
   ```
   The backend will start, usually on `http://localhost:5000`.

## API Endpoints Available
* `POST /api/auth/register` - Register a new user
* `POST /api/auth/login` - Authenticate and receive JWT
* `GET /api/auth/profile` - Fetch authenticated user profile
* `PUT /api/auth/profile` - Update profile (requires JWT)
* `POST /api/connections` - Add a new secure database connection (requires JWT)
* `POST /api/connections/test` - Test a database connection (requires JWT)
