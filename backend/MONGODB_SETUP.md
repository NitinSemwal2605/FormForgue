# MongoDB Connection Setup Guide

## 🚨 Current Issue
Your MongoDB Atlas connection is failing due to SSL/TLS configuration conflicts. The server is falling back to local MongoDB.

## ✅ Permanent Solutions

### Option 1: Use Local MongoDB (Recommended for Development)

1. **Install Local MongoDB:**

   **Windows:**
   - Download MongoDB Community Server from [mongodb.com](https://www.mongodb.com/try/download/community)
   - Install and start the MongoDB service

   **Mac:**
   ```bash
   brew install mongodb-community
   brew services start mongodb-community
   ```

   **Linux:**
   ```bash
   sudo apt update
   sudo apt install mongodb
   sudo systemctl start mongodb
   sudo systemctl enable mongodb
   ```

2. **Update your .env file:**
   ```env
   MONGODB_URI=mongodb://localhost:27017/formforge
   ```

### Option 2: Fix MongoDB Atlas Connection

1. **Get the correct connection string from Atlas:**
   - Go to your MongoDB Atlas dashboard
   - Click "Connect" on your cluster
   - Choose "Connect your application"
   - Copy the connection string

2. **Update your .env file with the correct format:**
   ```env
   MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/formforge?retryWrites=true&w=majority
   ```

3. **Whitelist your IP in Atlas:**
   - Go to Network Access in Atlas
   - Add your current IP address
   - Or add `0.0.0.0/0` for all IPs (not recommended for production)

### Option 3: Force Local MongoDB

If you want to force local MongoDB regardless of your MONGODB_URI:

```env
FORCE_LOCAL_MONGODB=true
MONGODB_URI=mongodb://localhost:27017/formforge
```

## 🔧 Connection Strategies

The server now tries these connection methods in order:

1. **Standard Atlas Connection** - Basic connection without SSL
2. **Atlas with SSL** - Standard SSL connection
3. **Atlas with Permissive SSL** - SSL with relaxed security
4. **Local MongoDB Fallback** - Automatic fallback if Atlas fails

## 🧪 Testing Your Connection

1. **Check Database Health:**
   ```bash
   curl http://localhost:3000/api/health
   ```

2. **Check Forms API Health:**
   ```bash
   curl http://localhost:3000/api/forms/health/db
   ```

3. **Monitor Server Logs:**
   Look for these messages:
   - ✅ "Connected to MongoDB Atlas successfully"
   - ✅ "Connected to local MongoDB successfully"
   - ❌ "Max connection attempts reached"

## 🚀 Quick Fix

For immediate resolution, use local MongoDB:

1. Install MongoDB locally (see instructions above)
2. Update your `.env` file:
   ```env
   MONGODB_URI=mongodb://localhost:27017/formforge
   ```
3. Restart your server

## 📝 Environment Variables

```env
# Server Configuration
PORT=3000
NODE_ENV=development

# MongoDB Configuration (choose one)
MONGODB_URI=mongodb://localhost:27017/formforge
# OR
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/formforge?retryWrites=true&w=majority

# Force Local MongoDB (optional)
FORCE_LOCAL_MONGODB=true

# CORS Configuration
CORS_ORIGIN=http://localhost:5173

# Security
JWT_SECRET=your-super-secret-jwt-key-change-this-in-production
```

## 🎯 Recommended Setup

For development: Use local MongoDB
For production: Use MongoDB Atlas with proper SSL configuration 