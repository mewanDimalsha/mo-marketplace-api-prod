# MO Marketplace API - Render Deployment Guide

## 🚀 Deploy to Render

### Step 1: Create Render Account

Go to [render.com](https://render.com) and sign up/login.

### Step 2: Create PostgreSQL Database

1. Click "New" → "PostgreSQL"
2. Name: `mo-marketplace-db`
3. Plan: Free tier
4. Region: Choose closest to your users
5. Click "Create Database"

### Step 3: Create Web Service

1. Click "New" → "Web Service"
2. Connect your GitHub repository
3. Configure:
   - **Name**: `mo-marketplace-api`
   - **Runtime**: `Docker`
   - **Build Command**: `docker build -t mo-marketplace-api .`
   - **Start Command**: `docker run -p $PORT:3000 mo-marketplace-api`

### Step 4: Set Environment Variables

In your Render web service settings, add these environment variables:

```
NODE_ENV=production
PORT=3000
DB_HOST=[Your Render PostgreSQL host]
DB_PORT=5432
DB_USERNAME=[Your Render PostgreSQL username]
DB_PASSWORD=[Your Render PostgreSQL password]
DB_NAME=[Your Render PostgreSQL database name]
JWT_SECRET=[Generate a secure random string]
JWT_ACCESS_EXPIRES=15m
JWT_REFRESH_EXPIRES=7d
CLOUDINARY_NAME=dekwbmj3r
CLOUDINARY_KEY=856644535352219
CLOUDINARY_SECRET=7xwiIkwWcP8PBfPTBXz8q1ABT1M
FRONTEND_URL=https://mo-marketplace-mewan.vercel.app
```

### Step 5: Deploy

Click "Create Web Service" - Render will build and deploy automatically.

### Step 6: Update Frontend

Once deployed, update your Vercel frontend with the new API URL:

- Environment variable: `VITE_API_URL=https://your-render-service.onrender.com`

## 🔍 Testing Your Deployment

After deployment, test these endpoints:

- API: `https://your-service.onrender.com/api`
- Health check: `https://your-service.onrender.com`

## 🐛 Troubleshooting

- **Build fails**: Check Render build logs
- **Database connection**: Verify PostgreSQL credentials
- **CORS issues**: Ensure FRONTEND_URL is set correctly
- **JWT errors**: Make sure JWT_SECRET is set

## 📊 Monitoring

- View logs in Render dashboard
- Monitor database usage
- Check response times

Happy deploying! 🎉
