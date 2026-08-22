# QueryCraft

QueryCraft is a powerful AI-driven web application that allows users to seamlessly translate natural language into optimized SQL queries, execute them against live databases (PostgreSQL/MySQL), and instantly visualize the results using dynamic charts.

## Features

- **Natural Language to SQL**: Simply type what you want (e.g., "Show me the top 5 customers by revenue"), and the AI (powered by Groq and Qwen) will generate the secure SQL query.
- **Multi-Database Support**: Connect and manage multiple databases securely. Supported types: PostgreSQL and MySQL.
- **Dynamic Visualization**: Automatically generates beautiful Bar, Line, or Pie charts using Recharts based on the AI's intelligent recommendation of the data structure.
- **Secure Execution**: A built-in SQL AST validator ensures that only read-only `SELECT` queries are executed, protecting your databases from accidental destructive operations (DROP, DELETE, UPDATE).
- **Query History**: Automatically tracks all your past prompts, generated SQL, execution times, and success/error rates so you can easily reference them later.
- **Export Data**: Download your query execution results in CSV or JSON formats with a single click.

## Tech Stack

### Frontend
- React (Vite)
- Tailwind CSS
- React Router DOM
- Recharts (for data visualization)
- Axios & Context API
- React Hot Toast (Notifications)

### Backend
- Node.js & Express
- MongoDB & Mongoose (for user data, connections, and query history)
- Groq SDK (LLM Engine)
- Node SQL Parser (for AST security validation)
- pg & mysql2 (Database drivers)
- JSON Web Tokens (JWT) & bcryptjs (for authentication)
- Jest & Supertest (Testing)

## Setup Instructions

### Prerequisites
- Node.js (v16 or higher)
- MongoDB running locally or a MongoDB Atlas URI
- A Groq API Key (Get one free at https://console.groq.com)
- Target Databases (PostgreSQL or MySQL) to query against

### 1. Clone the repository
```bash
git clone https://github.com/your-username/QueryCraft.git
cd QueryCraft
```

### 2. Backend Setup
First, install the backend dependencies:
```bash
cd backend
npm install
```

Next, configure your environment variables. Create a `.env` file in the `backend` directory:
```bash
# Create the file (Mac/Linux)
touch .env

# Or on Windows PowerShell:
# New-Item .env
```

Open `backend/.env` and add the following configuration:
```env
# Server
PORT=5000
NODE_ENV=development

# MongoDB Connection (Replace with your Atlas URI if not running locally)
MONGO_URI=mongodb://localhost:27017/querycraft

# Authentication and Security (Make these long, random strings)
JWT_SECRET=your_super_secret_jwt_key_here
# ENCRYPTION_KEY MUST be exactly 32 characters long for AES-256!
ENCRYPTION_KEY=12345678901234567890123456789012

# AI Engine
GROQ_API_KEY=gsk_your_groq_api_key_here
```

Start the backend server:
```bash
npm run dev
```
The backend API will run at `http://localhost:5000`.

### 3. Frontend Setup
In a new terminal window, navigate to the frontend directory:
```bash
cd frontend
npm install
```

The frontend uses Vite and is configured (via `vite.config.js`) to automatically proxy any requests starting with `/api` to your backend at `http://localhost:5000`. No `.env` is strictly required for the frontend if running locally!

Start the React development server:
```bash
npm run dev
```

### 4. Running the Application
1. Visit [http://localhost:5173](http://localhost:5173) in your browser.
2. Create an account via the Registration toggle on the login page.
3. Navigate to **Connections**. Add your PostgreSQL or MySQL database connection string.
   - *Example Postgres:* `postgresql://username:password@localhost:5432/my_database`
   - *Example MySQL:* `mysql://username:password@localhost:3306/my_database`
   - Click "Test Connection" to ensure QueryCraft can reach it.
4. Go to **Query**, select your database, and type a question in plain English.
5. Generate the SQL, execute it, and view your dynamic charts!

## Running Tests
To run the backend unit and integration test suites:
```bash
cd backend
npm test
```

## Architecture Workflow

1. **User Input**: Natural language prompt + Selected Database Connection.
2. **Schema Introspection**: The backend securely fetches the active database schema (tables, columns, types) to provide precise context to the LLM.
3. **LLM Engine**: Groq processes the prompt + schema context to generate a SQL string and a chart recommendation (bar, line, pie, table).
4. **Security Check**: The AST Validator parses the SQL and blocks any destructive commands, ensuring 100% read-only operations.
5. **Execution Engine**: Executes the sanitized SQL against the target database and records the history.
6. **Frontend Display**: Renders raw data in a data table and constructs dynamic Recharts visualizations.

## License
MIT License
