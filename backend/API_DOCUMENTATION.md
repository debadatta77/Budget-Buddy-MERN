# BudgetBuddy API Documentation

Complete REST API documentation for BudgetBuddy - Personal Finance Tracker

## Base URL
```
http://localhost:5000/api
```

## Authentication
Most endpoints require authentication. Include the JWT token in the Authorization header:
```
Authorization: Bearer <your_jwt_token>
```

---

## 📝 Table of Contents
1. [Authentication](#authentication-endpoints)
2. [Expenses](#expenses-endpoints)
3. [Budget](#budget-endpoints)
4. [Savings Goals](#savings-goals-endpoints)
5. [Profile](#profile-endpoints)
6. [Dashboard](#dashboard-endpoints)

---

## Authentication Endpoints

### Register New User
**POST** `/auth/register`

**Request Body:**
```json
{
  "name": "John Doe",
  "email": "john@example.com",
  "password": "password123"
}
```

**Response (201):**
```json
{
  "success": true,
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": "507f1f77bcf86cd799439011",
    "name": "John Doe",
    "email": "john@example.com",
    "createdAt": "2026-01-20T10:00:00.000Z"
  }
}
```

---

### Login
**POST** `/auth/login`

**Request Body:**
```json
{
  "email": "john@example.com",
  "password": "password123"
}
```

**Response (200):**
```json
{
  "success": true,
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": "507f1f77bcf86cd799439011",
    "name": "John Doe",
    "email": "john@example.com"
  }
}
```

---

### Get Current User
**GET** `/auth/me`  
🔒 **Protected**

**Response (200):**
```json
{
  "success": true,
  "data": {
    "id": "507f1f77bcf86cd799439011",
    "name": "John Doe",
    "email": "john@example.com",
    "phone": "+91 9876543210",
    "dateOfBirth": "1990-01-15",
    "gender": "Male",
    "currency": "INR",
    "monthlyIncome": 50000
  }
}
```

---

### Update Password
**PUT** `/auth/updatepassword`  
🔒 **Protected**

**Request Body:**
```json
{
  "currentPassword": "oldpassword123",
  "newPassword": "newpassword123"
}
```

**Response (200):**
```json
{
  "success": true,
  "token": "new_jwt_token...",
  "user": { ... }
}
```

---

## Expenses Endpoints

### Add New Expense
**POST** `/expenses`  
🔒 **Protected**

**Request Body:**
```json
{
  "amount": 250.50,
  "category": "Food & Dining",
  "description": "Lunch at restaurant",
  "date": "2026-01-20"
}
```

**Response (201):**
```json
{
  "success": true,
  "message": "Expense added successfully",
  "data": {
    "_id": "507f1f77bcf86cd799439011",
    "user": "507f1f77bcf86cd799439012",
    "amount": 250.50,
    "category": "Food & Dining",
    "description": "Lunch at restaurant",
    "date": "2026-01-20T00:00:00.000Z",
    "createdAt": "2026-01-20T10:00:00.000Z"
  }
}
```

---

### Get All Expenses
**GET** `/expenses`  
🔒 **Protected**

**Query Parameters:**
- `startDate` (optional): Filter by start date (YYYY-MM-DD)
- `endDate` (optional): Filter by end date (YYYY-MM-DD)
- `category` (optional): Filter by category
- `search` (optional): Search in description

**Example:**
```
GET /expenses?startDate=2026-01-01&category=Food & Dining
```

**Response (200):**
```json
{
  "success": true,
  "count": 15,
  "data": [
    {
      "_id": "507f1f77bcf86cd799439011",
      "amount": 250.50,
      "category": "Food & Dining",
      "description": "Lunch at restaurant",
      "date": "2026-01-20T00:00:00.000Z"
    }
  ]
}
```

---

### Get Expense by ID
**GET** `/expenses/:id`  
🔒 **Protected**

**Response (200):**
```json
{
  "success": true,
  "data": {
    "_id": "507f1f77bcf86cd799439011",
    "amount": 250.50,
    "category": "Food & Dining",
    "description": "Lunch at restaurant",
    "date": "2026-01-20T00:00:00.000Z"
  }
}
```

---

### Update Expense
**PUT** `/expenses/:id`  
🔒 **Protected**

**Request Body:**
```json
{
  "amount": 300.00,
  "description": "Dinner at restaurant"
}
```

**Response (200):**
```json
{
  "success": true,
  "message": "Expense updated successfully",
  "data": { ... }
}
```

---

### Delete Expense
**DELETE** `/expenses/:id`  
🔒 **Protected**

**Response (200):**
```json
{
  "success": true,
  "message": "Expense deleted successfully",
  "data": {}
}
```

---

### Get Expenses Summary
**GET** `/expenses/summary`  
🔒 **Protected**

**Query Parameters:**
- `month` (optional): Month number (1-12)
- `year` (optional): Year (e.g., 2026)

**Response (200):**
```json
{
  "success": true,
  "data": {
    "total": 8500,
    "count": 15,
    "byCategory": [
      {
        "category": "Food & Dining",
        "amount": 2500,
        "count": 8,
        "percentage": 29
      }
    ],
    "byDate": [
      {
        "date": "2026-01-20",
        "expenses": [...],
        "total": 850
      }
    ],
    "period": {
      "startDate": "2026-01-01T00:00:00.000Z",
      "endDate": "2026-01-31T23:59:59.999Z"
    }
  }
}
```

---

## Budget Endpoints

### Set/Update Budget
**POST** `/budget`  
🔒 **Protected**

**Request Body:**
```json
{
  "monthlyBudget": 25000,
  "month": 1,
  "year": 2026,
  "categoryBudgets": [
    {
      "category": "Food & Dining",
      "allocated": 5000
    },
    {
      "category": "Transportation",
      "allocated": 3000
    }
  ]
}
```

**Response (200):**
```json
{
  "success": true,
  "message": "Budget set successfully",
  "data": {
    "_id": "507f1f77bcf86cd799439011",
    "user": "507f1f77bcf86cd799439012",
    "monthlyBudget": 25000,
    "spent": 8500,
    "remaining": 16500,
    "month": 1,
    "year": 2026,
    "categoryBudgets": [...]
  }
}
```

---

### Get Budget
**GET** `/budget`  
🔒 **Protected**

**Query Parameters:**
- `month` (optional): Month number (1-12)
- `year` (optional): Year (e.g., 2026)

**Response (200):**
```json
{
  "success": true,
  "data": {
    "monthlyBudget": 25000,
    "spent": 8500,
    "remaining": 16500,
    "percentage": 34,
    "status": "safe",
    "month": 1,
    "year": 2026
  }
}
```

**Budget Status:**
- `safe`: < 70% spent
- `warning`: 70-89% spent
- `danger`: >= 90% spent

---

### Delete Budget
**DELETE** `/budget/:id`  
🔒 **Protected**

**Response (200):**
```json
{
  "success": true,
  "message": "Budget deleted successfully",
  "data": {}
}
```

---

## Savings Goals Endpoints

### Create Savings Goal
**POST** `/savings`  
🔒 **Protected**

**Request Body:**
```json
{
  "name": "Emergency Fund",
  "targetAmount": 100000,
  "deadline": "2026-12-31",
  "category": "Emergency",
  "icon": "🚨",
  "description": "Build emergency fund for 6 months"
}
```

**Response (201):**
```json
{
  "success": true,
  "message": "Savings goal created successfully",
  "data": {
    "_id": "507f1f77bcf86cd799439011",
    "name": "Emergency Fund",
    "targetAmount": 100000,
    "savedAmount": 0,
    "deadline": "2026-12-31T00:00:00.000Z",
    "status": "in-progress",
    "progress": 0,
    "remaining": 100000
  }
}
```

---

### Get All Savings Goals
**GET** `/savings`  
🔒 **Protected**

**Query Parameters:**
- `status` (optional): Filter by status (in-progress, completed, cancelled)

**Response (200):**
```json
{
  "success": true,
  "count": 3,
  "data": [
    {
      "_id": "507f1f77bcf86cd799439011",
      "name": "Emergency Fund",
      "targetAmount": 100000,
      "savedAmount": 35000,
      "progress": 35,
      "remaining": 65000,
      "deadline": "2026-12-31T00:00:00.000Z",
      "status": "in-progress"
    }
  ]
}
```

---

### Get Savings Goal by ID
**GET** `/savings/:id`  
🔒 **Protected**

**Response (200):**
```json
{
  "success": true,
  "data": {
    "_id": "507f1f77bcf86cd799439011",
    "name": "Emergency Fund",
    "targetAmount": 100000,
    "savedAmount": 35000,
    "transactions": [
      {
        "amount": 5000,
        "date": "2026-01-20T00:00:00.000Z",
        "note": "Monthly saving"
      }
    ]
  }
}
```

---

### Update Savings Goal
**PUT** `/savings/:id`  
🔒 **Protected**

**Request Body:**
```json
{
  "name": "Updated Emergency Fund",
  "targetAmount": 150000
}
```

**Response (200):**
```json
{
  "success": true,
  "message": "Savings goal updated successfully",
  "data": { ... }
}
```

---

### Add Savings to Goal
**POST** `/savings/:id/add`  
🔒 **Protected**

**Request Body:**
```json
{
  "amount": 5000,
  "note": "Monthly contribution"
}
```

**Response (200):**
```json
{
  "success": true,
  "message": "Savings added successfully",
  "data": {
    "savedAmount": 40000,
    "progress": 40,
    "status": "in-progress"
  }
}
```

---

### Delete Savings Goal
**DELETE** `/savings/:id`  
🔒 **Protected**

**Response (200):**
```json
{
  "success": true,
  "message": "Savings goal deleted successfully",
  "data": {}
}
```

---

## Profile Endpoints

### Get User Profile
**GET** `/profile`  
🔒 **Protected**

**Response (200):**
```json
{
  "success": true,
  "data": {
    "_id": "507f1f77bcf86cd799439011",
    "name": "John Doe",
    "email": "john@example.com",
    "phone": "+91 9876543210",
    "dateOfBirth": "1990-01-15",
    "gender": "Male",
    "currency": "INR",
    "monthlyIncome": 50000,
    "createdAt": "2026-01-01T00:00:00.000Z"
  }
}
```

---

### Update Profile
**PUT** `/profile`  
🔒 **Protected**

**Request Body:**
```json
{
  "name": "John Updated",
  "phone": "+91 9876543210",
  "dateOfBirth": "1990-01-15",
  "gender": "Male",
  "currency": "INR",
  "monthlyIncome": 60000
}
```

**Response (200):**
```json
{
  "success": true,
  "message": "Profile updated successfully",
  "data": { ... }
}
```

---

### Delete Account
**DELETE** `/profile`  
🔒 **Protected**

**Response (200):**
```json
{
  "success": true,
  "message": "Account deleted successfully",
  "data": {}
}
```

---

## Dashboard Endpoints

### Get Dashboard Data
**GET** `/dashboard`  
🔒 **Protected**

**Response (200):**
```json
{
  "success": true,
  "data": {
    "summary": {
      "totalExpenses": 8500,
      "totalBudget": 25000,
      "remaining": 16500,
      "budgetPercentage": 34,
      "totalSavings": 40000,
      "activeSavingsGoals": 2,
      "expenseChange": -12
    },
    "todayExpenses": {
      "transactions": [...],
      "total": 350,
      "count": 3
    },
    "categoryBreakdown": [
      {
        "category": "Food & Dining",
        "amount": 2500,
        "count": 8,
        "percentage": 29
      }
    ],
    "recentExpenses": [...],
    "period": {
      "startDate": "2026-01-01T00:00:00.000Z",
      "endDate": "2026-01-31T23:59:59.999Z"
    }
  }
}
```

---

### Get Statistics
**GET** `/dashboard/stats`  
🔒 **Protected**

**Query Parameters:**
- `period` (optional): week, month, or year (default: month)

**Response (200):**
```json
{
  "success": true,
  "data": {
    "dailyExpenses": {
      "2026-01-01": 450,
      "2026-01-02": 320,
      "2026-01-03": 780
    },
    "categoryExpenses": [
      {
        "category": "Food & Dining",
        "amount": 2500,
        "percentage": 29
      }
    ],
    "total": 8500,
    "period": {
      "startDate": "2026-01-01T00:00:00.000Z",
      "endDate": "2026-01-31T23:59:59.999Z",
      "type": "month"
    }
  }
}
```

---

## Error Responses

All endpoints return consistent error responses:

**400 Bad Request:**
```json
{
  "success": false,
  "message": "Please provide all required fields"
}
```

**401 Unauthorized:**
```json
{
  "success": false,
  "message": "Not authorized to access this route"
}
```

**404 Not Found:**
```json
{
  "success": false,
  "message": "Resource not found"
}
```

**500 Server Error:**
```json
{
  "success": false,
  "message": "Server error",
  "error": "Error details..."
}
```

---

## Expense Categories

Valid expense categories:
- `Food & Dining`
- `Transportation`
- `Shopping`
- `Utilities`
- `Healthcare`
- `Entertainment`
- `Education`
- `Rent`
- `Other`

---

## Notes

1. **Date Format**: All dates should be in ISO 8601 format (YYYY-MM-DD)
2. **Authentication**: Store the JWT token securely and include it in all protected requests
3. **Amount**: All amounts should be positive numbers with up to 2 decimal places
4. **Token Expiry**: Tokens expire after 7 days by default

---

## Testing with Postman/Thunder Client

1. Register a new user at `/api/auth/register`
2. Copy the returned JWT token
3. Set the token in Authorization header for all protected routes
4. Test all endpoints as documented above

---

**API Version:** 1.0.0  
**Last Updated:** January 20, 2026
