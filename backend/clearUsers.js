const mongoose = require('mongoose');
const User = require('./models/User');
require('dotenv').config();

async function clearAllUsers() {
  try {
    // Connect to MongoDB
    console.log('Connecting to MongoDB...');
    await mongoose.connect(process.env.MONGODB_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    console.log('Connected to MongoDB successfully');

    // Count users before deletion
    const userCount = await User.countDocuments();
    console.log(`Found ${userCount} users in the database`);

    if (userCount === 0) {
      console.log('No users found to delete');
      return;
    }

    // Show user details before deletion
    const users = await User.find({}).select('name email createdAt');
    console.log('\nUsers that will be deleted:');
    users.forEach((user, index) => {
      console.log(`${index + 1}. ${user.name} (${user.email}) - Created: ${user.createdAt.toLocaleDateString()}`);
    });

    // Ask for confirmation
    console.log('\n⚠️  WARNING: This will permanently delete ALL users from the database!');
    console.log('This action cannot be undone and will affect:');
    console.log('- All user accounts and authentication');
    console.log('- All forms created by these users');
    console.log('- All responses submitted by these users');
    console.log('\nType "DELETE ALL USERS" to confirm:');

    // For safety, we'll require manual confirmation
    // In a real scenario, you might want to add a confirmation prompt
    console.log('\nTo proceed, manually run: node clearUsers.js --confirm');
    
    // Check if confirmation flag is provided
    if (process.argv.includes('--confirm')) {
      // Clear all users
      console.log('\nDeleting all users...');
      const result = await User.deleteMany({});
      
      console.log(`✅ Successfully deleted ${result.deletedCount} users`);
      console.log('All users have been cleared from the database!');
    } else {
      console.log('\n❌ Operation cancelled. No users were deleted.');
      console.log('To confirm deletion, run: node clearUsers.js --confirm');
    }

  } catch (error) {
    console.error('Error clearing users:', error);
  } finally {
    // Close the connection
    await mongoose.connection.close();
    console.log('Database connection closed');
  }
}

// Run the script
clearAllUsers(); 