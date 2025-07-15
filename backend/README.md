# FormForge Backend API

A Node.js/Express backend API for the FormForge application with MongoDB integration.

## Features

- ✅ Form CRUD operations
- ✅ Form response submission and storage
- ✅ Response analytics and statistics
- ✅ User agent and device detection
- ✅ Pagination for responses
- ✅ Input validation and error handling
- ✅ CORS support for frontend integration

## Setup

### 1. Install Dependencies

```bash
cd backend
npm install
```

### 2. Environment Configuration

Create a `.env` file in the backend directory:

```env
# Server Configuration
PORT=3000
NODE_ENV=development

# MongoDB Configuration
MONGODB_URI=mongodb://localhost:27017/formforge

# CORS Configuration
CORS_ORIGIN=http://localhost:5173

# Security
JWT_SECRET=your-super-secret-jwt-key-change-this-in-production
```

### 3. MongoDB Setup

Make sure MongoDB is running locally or update the `MONGODB_URI` to point to your MongoDB instance.

### 4. Start the Server

```bash
# Development mode (with auto-restart)
npm run dev

# Production mode
npm start
```

The server will start on `http://localhost:3000`

## API Endpoints

### Forms

- `GET /api/forms` - Get all forms
- `GET /api/forms/:id` - Get single form
- `POST /api/forms` - Create new form
- `PUT /api/forms/:id` - Update form
- `DELETE /api/forms/:id` - Delete form (soft delete)
- `GET /api/forms/:id/stats` - Get form statistics

### Responses

- `POST /api/responses` - Submit form response
- `GET /api/responses/form/:formId` - Get all responses for a form
- `GET /api/responses/:id` - Get single response
- `GET /api/responses/analytics/:formId` - Get response analytics

### Health Check

- `GET /api/health` - Server health status

## Data Models

### Form Schema
```javascript
{
  title: String (required),
  description: String,
  fields: [FieldSchema],
  theme: String,
  settings: Object,
  isActive: Boolean,
  createdAt: Date,
  updatedAt: Date
}
```

### Response Schema
```javascript
{
  formId: ObjectId (ref: Form),
  responses: [FieldResponseSchema],
  submittedAt: Date,
  ipAddress: String,
  userAgent: String,
  userId: String,
  email: String,
  timeSpent: Number,
  deviceType: String,
  browser: String,
  os: String
}
```

## Frontend Integration

Update your frontend API service to point to the backend:

```javascript
// In FormForgue/src/services/api.js
const BASE_URL = 'http://localhost:3000/api'
```

## Development

The server includes:
- **Helmet** for security headers
- **Morgan** for request logging
- **CORS** for cross-origin requests
- **Mongoose** for MongoDB ODM
- **Dotenv** for environment variables

## Production Deployment

1. Set `NODE_ENV=production`
2. Use a production MongoDB instance
3. Set a strong `JWT_SECRET`
4. Configure proper CORS origins
5. Use a process manager like PM2 