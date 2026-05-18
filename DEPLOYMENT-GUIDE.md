# BudgetBuddy Deployment Guide

## Local Development

Backend:

```bash
cd backend
npm install
npm run dev
```

Frontend:

```bash
cd client
npm install
npm run dev
```

Set `client/.env` with:

```env
VITE_API_BASE_URL=http://localhost:8000/api
```

## Production Checklist

1. Move MongoDB to Atlas.
2. Set `backend/.env`:
   - `NODE_ENV=production`
   - `MONGODB_URI=<your Atlas connection string>`
   - `FRONTEND_URL=<your deployed frontend URL>`
   - `JWT_SECRET=<strong random secret>`
3. Set `client/.env`:
   - `VITE_API_BASE_URL=<your deployed backend URL>/api`
4. Deploy backend first, then frontend.
5. Verify login, add expense, dashboard, budget, profile, and admin analytics.

## Hosting Notes

- The backend accepts requests from localhost Vite ports and your deployed frontend URL.
- Keep the admin access key in the backend `.env` and enter it in the admin page when needed.
- Do not commit real `.env` values.