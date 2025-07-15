const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const cookieParser = require('cookie-parser');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(helmet());
app.use(morgan('combined'));
app.use(cors({
  origin: process.env.CORS_ORIGIN || 'http://localhost:5173',
  credentials: true
}));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());



// Connection state tracking
let isConnecting = false;
let connectionAttempts = 0;
const maxConnectionAttempts = 3; // Reduced further to prevent infinite loops
let currentConnection = null;
let connectionEstablished = false;

const connectWithRetry = async () => {
  if (isConnecting || connectionEstablished) {
    console.log('🔄 Connection already in progress or established, skipping...');
    return;
  }
  
  if (connectionAttempts >= maxConnectionAttempts) {
    console.error('❌ Max connection attempts reached. Switching to fallback mode.');
    console.log('💡 Using local MongoDB fallback...');
    
    // Try local MongoDB as fallback
    try {
      const localUri = 'mongodb://localhost:27017/formforge';
      console.log('🔗 Attempting local MongoDB connection...');
      
      await mongoose.connect(localUri, {
        retryWrites: true,
        w: 'majority',
        maxPoolSize: 1,
        serverSelectionTimeoutMS: 5000,
        socketTimeoutMS: 10000,
        bufferCommands: false,
        maxIdleTimeMS: 5000,
        minPoolSize: 1,
      });
      
      console.log('✅ Connected to local MongoDB successfully');
      connectionEstablished = true;
      connectionAttempts = 0;
      return;
    } catch (localError) {
      console.error('❌ Local MongoDB also failed:', localError.message);
      console.log('💡 Please install MongoDB locally or check your connection string');
      console.log('💡 For development: brew install mongodb-community (Mac) or download from mongodb.com');
      return;
    }
  }
  
  isConnecting = true;
  connectionAttempts++;
  
  try {
    // Check if we should force local MongoDB
    if (process.env.FORCE_LOCAL_MONGODB === 'true') {
      console.log('🔧 Forcing local MongoDB connection...');
      mongoUri = 'mongodb://localhost:27017/formforge';
    } else {
      mongoUri = process.env.MONGODB_URI || 'mongodb://localhost:27017/formforge';
    }
    
    // Check if it's a MongoDB Atlas connection (contains .mongodb.net)
    const isAtlasConnection = mongoUri.includes('.mongodb.net');
    
    if (isAtlasConnection) {
      console.log(`🔗 Connecting to MongoDB Atlas... (Attempt ${connectionAttempts}/${maxConnectionAttempts})`);
      
      // For Atlas, we need to try different connection strategies
      const connectionStrategies = [
        {
          name: 'Standard Atlas Connection',
          options: {
            retryWrites: true,
            w: 'majority',
            maxPoolSize: 1,
            serverSelectionTimeoutMS: 10000,
            socketTimeoutMS: 15000,
            bufferCommands: false,
            maxIdleTimeMS: 10000,
            minPoolSize: 1,
          }
        },
        {
          name: 'Atlas with SSL',
          options: {
            retryWrites: true,
            w: 'majority',
            maxPoolSize: 1,
            serverSelectionTimeoutMS: 10000,
            socketTimeoutMS: 15000,
            bufferCommands: false,
            maxIdleTimeMS: 10000,
            minPoolSize: 1,
            ssl: true,
            tls: true,
          }
        },
        {
          name: 'Atlas with Permissive SSL',
          options: {
            retryWrites: true,
            w: 'majority',
            maxPoolSize: 1,
            serverSelectionTimeoutMS: 10000,
            socketTimeoutMS: 15000,
            bufferCommands: false,
            maxIdleTimeMS: 10000,
            minPoolSize: 1,
            ssl: true,
            tls: true,
            tlsAllowInvalidCertificates: true,
            tlsAllowInvalidHostnames: true,
          }
        }
      ];
      
      for (let i = 0; i < connectionStrategies.length; i++) {
        const strategy = connectionStrategies[i];
        try {
          console.log(`🔧 Trying ${strategy.name}...`);
          
          // Close existing connection if any
          if (currentConnection) {
            await mongoose.disconnect();
            currentConnection = null;
          }
          
          currentConnection = await mongoose.connect(mongoUri, strategy.options);
          console.log(`✅ Connected to MongoDB Atlas with ${strategy.name}`);
          connectionEstablished = true;
          connectionAttempts = 0;
          return;
        } catch (strategyError) {
          console.log(`⚠️ ${strategy.name} failed:`, strategyError.message);
          if (i === connectionStrategies.length - 1) {
            throw strategyError; // Throw the last error if all strategies fail
          }
        }
      }
    } else {
      // Local connection
      console.log(`🔗 Connecting to local MongoDB... (Attempt ${connectionAttempts}/${maxConnectionAttempts})`);
      currentConnection = await mongoose.connect(mongoUri, {
        retryWrites: true,
        w: 'majority',
        maxPoolSize: 1,
        serverSelectionTimeoutMS: 5000,
        socketTimeoutMS: 10000,
        bufferCommands: false,
        maxIdleTimeMS: 5000,
        minPoolSize: 1,
      });
      console.log('✅ Connected to local MongoDB successfully');
      connectionEstablished = true;
      connectionAttempts = 0;
    }
  } catch (err) {
    console.error('❌ MongoDB connection error:', err.message);
    console.log(`🔄 Retrying connection in 5 seconds... (Attempt ${connectionAttempts}/${maxConnectionAttempts})`);
    setTimeout(() => {
      isConnecting = false;
      connectWithRetry();
    }, 5000);
  } finally {
    isConnecting = false;
  }
};

connectWithRetry();

// Handle MongoDB connection events
mongoose.connection.on('error', (err) => {
  console.error('❌ MongoDB connection error:', err.message);
  if (err.name === 'MongoNetworkError' || err.name === 'MongoServerSelectionError') {
    console.log('🌐 Network-related error detected');
  }
  // Don't auto-reconnect on error, let the retry logic handle it
  connectionEstablished = false;
});

mongoose.connection.on('disconnected', () => {
  console.log('🔌 MongoDB disconnected');
  connectionEstablished = false;
  // Don't auto-reconnect, let the retry logic handle it
});

mongoose.connection.on('reconnected', () => {
  console.log('✅ MongoDB reconnected successfully');
  connectionEstablished = true;
  connectionAttempts = 0; // Reset counter on successful reconnection
});

mongoose.connection.on('connected', () => {
  console.log('🔗 MongoDB connection established');
  connectionEstablished = true;
  connectionAttempts = 0; // Reset counter on successful connection
});

mongoose.connection.on('connecting', () => {
  console.log('🔄 Connecting to MongoDB...');
});

// Graceful shutdown
process.on('SIGINT', async () => {
  console.log('\n🛑 Shutting down gracefully...');
  if (mongoose.connection.readyState === 1) {
    await mongoose.disconnect();
    console.log('✅ MongoDB disconnected');
  }
  process.exit(0);
});

// Import routes
const authRoutes = require('./routes/auth');
const formRoutes = require('./routes/forms');
const responseRoutes = require('./routes/responses');

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/forms', formRoutes);
app.use('/api/responses', responseRoutes);

// Health check endpoint
app.get('/api/health', (req, res) => {
  const dbStatus = mongoose.connection.readyState === 1 ? 'connected' : 'disconnected';
  res.json({ 
    status: 'OK', 
    message: 'FormForge API is running',
    database: {
      status: dbStatus,
      connectionEstablished: connectionEstablished,
      attempts: connectionAttempts
    },
    timestamp: new Date().toISOString()
  });
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ 
    error: 'Something went wrong!',
    message: process.env.NODE_ENV === 'development' ? err.message : 'Internal server error'
  });
});

// 404 handler
app.use('*', (req, res) => {
  res.status(404).json({ error: 'Route not found' });
});

app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
  console.log(`📊 API available at http://localhost:${PORT}/api`);
  console.log(`🏥 Health check: http://localhost:${PORT}/api/health`);
}); 