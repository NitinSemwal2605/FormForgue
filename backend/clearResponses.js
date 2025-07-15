const mongoose = require('mongoose');
const Response = require('./models/Response');
require('dotenv').config();

async function clearAllResponses() {
  try {
    // Connect to MongoDB
    console.log('Connecting to MongoDB...');
    await mongoose.connect(process.env.MONGODB_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    console.log('Connected to MongoDB successfully');

    // Count responses before deletion
    const responseCount = await Response.countDocuments();
    console.log(`Found ${responseCount} responses in the database`);

    if (responseCount === 0) {
      console.log('No responses found to delete');
      return;
    }

    // Clear all responses
    console.log('Deleting all responses...');
    const result = await Response.deleteMany({});
    
    console.log(`Successfully deleted ${result.deletedCount} responses`);
    console.log('All user responses have been cleared!');

  } catch (error) {
    console.error('Error clearing responses:', error);
  } finally {
    // Close the connection
    await mongoose.connection.close();
    console.log('Database connection closed');
  }
}

// Run the script
clearAllResponses(); 