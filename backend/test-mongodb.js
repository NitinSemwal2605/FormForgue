const mongoose = require('mongoose');
require('dotenv').config();

async function testMongoDBConnection() {
  console.log('🧪 Testing MongoDB Connection...\n');
  
  const mongoUri = process.env.MONGODB_URI || 'mongodb://localhost:27017/formforge';
  console.log('📡 Connection String:', mongoUri.replace(/\/\/.*@/, '//***:***@'));
  
  const isAtlasConnection = mongoUri.includes('.mongodb.net');
  console.log('🌐 Connection Type:', isAtlasConnection ? 'Atlas (Cloud)' : 'Local');
  
  const connectionStrategies = [
    {
      name: 'Standard Connection',
      options: {
        retryWrites: true,
        w: 'majority',
        maxPoolSize: 1,
        serverSelectionTimeoutMS: 5000,
        socketTimeoutMS: 10000,
        bufferCommands: false,
        maxIdleTimeMS: 5000,
        minPoolSize: 1,
      }
    },
    {
      name: 'With SSL',
      options: {
        retryWrites: true,
        w: 'majority',
        maxPoolSize: 1,
        serverSelectionTimeoutMS: 5000,
        socketTimeoutMS: 10000,
        bufferCommands: false,
        maxIdleTimeMS: 5000,
        minPoolSize: 1,
        ssl: true,
        tls: true,
      }
    },
    {
      name: 'With Permissive SSL',
      options: {
        retryWrites: true,
        w: 'majority',
        maxPoolSize: 1,
        serverSelectionTimeoutMS: 5000,
        socketTimeoutMS: 10000,
        bufferCommands: false,
        maxIdleTimeMS: 5000,
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
    console.log(`\n🔧 Testing ${strategy.name}...`);
    
    try {
      await mongoose.connect(mongoUri, strategy.options);
      console.log(`✅ ${strategy.name} - SUCCESS!`);
      
      // Test a simple operation
      const collections = await mongoose.connection.db.listCollections().toArray();
      console.log(`📊 Database: ${mongoose.connection.name}`);
      console.log(`📁 Collections: ${collections.length}`);
      
      await mongoose.disconnect();
      console.log('🔌 Disconnected successfully');
      return true;
    } catch (error) {
      console.log(`❌ ${strategy.name} - FAILED:`, error.message);
      
      if (i === connectionStrategies.length - 1) {
        console.log('\n💡 All connection strategies failed.');
        console.log('💡 Try using local MongoDB or check your Atlas configuration.');
        return false;
      }
    }
  }
}

// Run the test
testMongoDBConnection()
  .then((success) => {
    if (success) {
      console.log('\n🎉 MongoDB connection test completed successfully!');
    } else {
      console.log('\n❌ MongoDB connection test failed.');
      process.exit(1);
    }
  })
  .catch((error) => {
    console.error('💥 Test error:', error);
    process.exit(1);
  }); 