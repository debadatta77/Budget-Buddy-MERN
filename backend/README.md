# BudgetBuddy Backend - Setup & Installation Guide

## 📋 Prerequisites

Before you begin, ensure you have the following installed:
- **Node.js** (v14 or higher) - [Download](https://nodejs.org/)
- **MongoDB** (v4.4 or higher) - [Download](https://www.mongodb.com/try/download/community)
- **npm** or **yarn** package manager

---

## 🚀 Quick Start

### 1. Install Dependencies

Navigate to the backend folder and install all required packages:

```bash
cd backend
npm install
```

This will install:
- express
- mongoose
- bcryptjs
- jsonwebtoken
- dotenv
- cors
- express-validator
- helmet
- express-rate-limit
- morgan

---

### 2. Set Up Environment Variables

Create a `.env` file in the backend folder:

```bash
# Copy the example file
copy .env.example .env
```

Edit `.env` and update with your configuration:

```env
# Server Configuration
PORT=5000
NODE_ENV=development

# Database Configuration (Choose one option)

# Option 1: Local MongoDB
MONGODB_URI=mongodb://localhost:27017/budgetbuddy

# Option 2: MongoDB Atlas (Cloud) - Recommended
# MONGODB_URI=mongodb+srv://your_username:your_password@cluster.mongodb.net/budgetbuddy?retryWrites=true&w=majority

# JWT Configuration
JWT_SECRET=your_super_secret_jwt_key_CHANGE_THIS_IN_PRODUCTION
JWT_EXPIRE=7d

# Frontend URL
FRONTEND_URL=http://localhost:5500
```

**Important Security Note:** 
- Generate a strong `JWT_SECRET` for production
- Never commit `.env` file to version control

---

### 3. Start MongoDB

**Option A: Local MongoDB**
```bash
# Windows
mongod

# macOS/Linux
sudo systemctl start mongod
```

**Option B: MongoDB Atlas (Cloud)**
1. Create free account at [MongoDB Atlas](https://www.mongodb.com/cloud/atlas)
2. Create a new cluster
3. Get connection string
4. Update `MONGODB_URI` in `.env`

---

### 4. Run the Server

**Development mode (with auto-restart):**
```bash
npm run dev
```

**Production mode:**
```bash
npm start
```

The server will start at: `http://localhost:5000`

---

## 📁 Project Structure

```
backend/
├── controllers/          # Route handlers
│   ├── auth.controller.js
│   ├── expense.controller.js
│   ├── budget.controller.js
│   ├── savings.controller.js
│   ├── profile.controller.js
│   └── dashboard.controller.js
├── models/              # Database schemas
│   ├── User.model.js
│   ├── Expense.model.js
│   ├── Budget.model.js
│   └── SavingsGoal.model.js
├── routes/              # API routes
│   ├── auth.routes.js
│   ├── expense.routes.js
│   ├── budget.routes.js
│   ├── savings.routes.js
│   ├── profile.routes.js
│   └── dashboard.routes.js
├── middleware/          # Custom middleware
│   └── auth.middleware.js
├── utils/               # Helper functions
│   └── helpers.js
├── .env                 # Environment variables (create this)
├── .env.example         # Environment template
├── .gitignore          # Git ignore rules
├── package.json        # Dependencies
├── server.js           # Main application file
├── API_DOCUMENTATION.md # API docs
└── README.md           # This file
```

---

## 🔑 API Endpoints

Base URL: `http://localhost:5000/api`

### Authentication
- `POST /auth/register` - Register new user
- `POST /auth/login` - Login user
- `GET /auth/me` - Get current user (protected)
- `PUT /auth/updatepassword` - Update password (protected)

### Expenses
- `POST /expenses` - Add expense (protected)
- `GET /expenses` - Get all expenses (protected)
- `GET /expenses/:id` - Get single expense (protected)
- `PUT /expenses/:id` - Update expense (protected)
- `DELETE /expenses/:id` - Delete expense (protected)
- `GET /expenses/summary` - Get expenses summary (protected)

### Budget
- `POST /budget` - Set/update budget (protected)
- `GET /budget` - Get budget (protected)
- `DELETE /budget/:id` - Delete budget (protected)

### Savings Goals
- `POST /savings` - Create savings goal (protected)
- `GET /savings` - Get all goals (protected)
- `GET /savings/:id` - Get single goal (protected)
- `PUT /savings/:id` - Update goal (protected)
- `POST /savings/:id/add` - Add savings (protected)
- `DELETE /savings/:id` - Delete goal (protected)

### Profile
- `GET /profile` - Get user profile (protected)
- `PUT /profile` - Update profile (protected)
- `DELETE /profile` - Delete account (protected)

### Dashboard
- `GET /dashboard` - Get dashboard data (protected)
- `GET /dashboard/stats` - Get statistics (protected)

📖 **Full API Documentation:** See [API_DOCUMENTATION.md](./API_DOCUMENTATION.md)

---

## 🧪 Testing the API

### Using Thunder Client (VS Code Extension)

1. Install Thunder Client extension
2. Create new request
3. Set method (GET, POST, PUT, DELETE)
4. Set URL (e.g., `http://localhost:5000/api/auth/register`)
5. Add request body (for POST/PUT)
6. Send request

### Example: Register a User

**Request:**
```http
POST http://localhost:5000/api/auth/register
Content-Type: application/json

{
  "name": "Test User",
  "email": "test@example.com",
  "password": "password123"
}
```

**Response:**
```json
{
  "success": true,
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": "507f1f77bcf86cd799439011",
    "name": "Test User",
    "email": "test@example.com"
  }
}
```

**For Protected Routes:** Add Authorization header:
```
Authorization: Bearer YOUR_JWT_TOKEN
```

---

## 🔒 Security Features

- **JWT Authentication** - Secure token-based authentication
- **Password Hashing** - bcrypt encryption for passwords
- **Helmet** - Security headers
- **CORS** - Cross-Origin Resource Sharing configuration
- **Rate Limiting** - Prevent brute force attacks
- **Input Validation** - Express-validator for data validation

---

## 🛠️ Development Tips

### View Database (MongoDB Compass)
1. Download [MongoDB Compass](https://www.mongodb.com/products/compass)
2. Connect to `mongodb://localhost:27017`
3. Browse `budgetbuddy` database

### Common Commands
```bash
# Install dependencies
npm install

# Run in development (auto-restart)
npm run dev

# Run in production
npm start

# View logs
# Logs appear in terminal
```

---

## 🐛 Troubleshooting

### MongoDB Connection Error
```
Error: connect ECONNREFUSED 127.0.0.1:27017
```
**Solution:** Make sure MongoDB is running
```bash
# Windows
mongod

# Or check if service is running
net start MongoDB
```

### Port Already in Use
```
Error: listen EADDRINUSE: address already in use :::5000
```
**Solution:** Change PORT in `.env` or kill the process using port 5000

### JWT Token Errors
```
Error: Token is invalid or expired
```
**Solution:** 
- Make sure JWT_SECRET is set in `.env`
- Get a new token by logging in again

---

## 📦 Deployment

### Deploy to Heroku

1. Install Heroku CLI
2. Login: `heroku login`
3. Create app: `heroku create budgetbuddy-api`
4. Set environment variables:
```bash
heroku config:set NODE_ENV=production
heroku config:set MONGODB_URI=your_mongodb_atlas_url
heroku config:set JWT_SECRET=your_secret
```
5. Deploy: `git push heroku main`

### Deploy to Railway/Render

1. Create account on [Railway](https://railway.app/) or [Render](https://render.com/)
2. Connect GitHub repository
3. Set environment variables in dashboard
4. Deploy automatically on push

---

## 📝 Environment Variables Reference

| Variable | Description | Example |
|----------|-------------|---------|
| PORT | Server port | 5000 |
| NODE_ENV | Environment | development/production |
| MONGODB_URI | MongoDB connection string | mongodb://localhost:27017/budgetbuddy |
| JWT_SECRET | Secret key for JWT | your_secret_key |
| JWT_EXPIRE | Token expiration time | 7d |
| FRONTEND_URL | Frontend URL for CORS | http://localhost:5500 |

---

## 🤝 Contributing

1. Fork the repository
2. Create feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit changes (`git commit -m 'Add AmazingFeature'`)
4. Push to branch (`git push origin feature/AmazingFeature`)
5. Open Pull Request

---

## 📄 License

This project is licensed under the ISC License.

---

## 💡 Support

If you encounter any issues:
1. Check this README
2. Review API_DOCUMENTATION.md
3. Check console logs for errors
4. Verify MongoDB is running
5. Ensure all environment variables are set

---

**Happy Coding! 💰💻**
