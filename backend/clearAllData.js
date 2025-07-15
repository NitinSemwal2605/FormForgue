const mongoose = require('mongoose');
const User = require('./models/User');
const Form = require('./models/Form');
const Response = require('./models/Response');
require('dotenv').config();

async function clearAllData() {
  try {
    // Connect to MongoDB
    console.log('Connecting to MongoDB...');
    await mongoose.connect(process.env.MONGODB_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    console.log('Connected to MongoDB successfully');

    // Count all data before deletion
    const userCount = await User.countDocuments();
    const formCount = await Form.countDocuments();
    const responseCount = await Response.countDocuments();

    console.log('\n📊 Current database statistics:');
    console.log(`- Users: ${userCount}`);
    console.log(`- Forms: ${formCount}`);
    console.log(`- Responses: ${responseCount}`);
    console.log(`- Total records: ${userCount + formCount + responseCount}`);

    if (userCount === 0 && formCount === 0 && responseCount === 0) {
      console.log('\n✅ Database is already empty!');
      return;
    }

    // Show what will be deleted
    console.log('\n⚠️  WARNING: This will permanently delete ALL data from the database!');
    console.log('This action cannot be undone and will affect:');
    console.log('- All user accounts and authentication');
    console.log('- All forms and their configurations');
    console.log('- All form responses and analytics data');
    console.log('- All user sessions and tokens');

    // Check if confirmation flag is provided
    if (process.argv.includes('--confirm')) {
      console.log('\n🗑️  Starting data deletion...');
      
      // Delete in order to respect foreign key constraints
      let deletedCount = 0;

      // 1. Delete all responses first (they reference forms and users)
      if (responseCount > 0) {
        console.log('Deleting responses...');
        const responseResult = await Response.deleteMany({});
        console.log(`✅ Deleted ${responseResult.deletedCount} responses`);
        deletedCount += responseResult.deletedCount;
      }

      // 2. Delete all forms (they reference users)
      if (formCount > 0) {
        console.log('Deleting forms...');
        const formResult = await Form.deleteMany({});
        console.log(`✅ Deleted ${formResult.deletedCount} forms`);
        deletedCount += formResult.deletedCount;
      }

      // 3. Delete all users
      if (userCount > 0) {
        console.log('Deleting users...');
        const userResult = await User.deleteMany({});
        console.log(`✅ Deleted ${userResult.deletedCount} users`);
        deletedCount += userResult.deletedCount;
      }

      console.log(`\n🎉 Successfully deleted ${deletedCount} total records!`);
      console.log('All data has been cleared from the database!');
      
    } else {
      console.log('\n❌ Operation cancelled. No data was deleted.');
      console.log('To confirm deletion, run: node clearAllData.js --confirm');
    }

  } catch (error) {
    console.error('Error clearing data:', error);
  } finally {
    // Close the connection
    await mongoose.connection.close();
    console.log('Database connection closed');
  }
}

// Run the script
clearAllData(); 