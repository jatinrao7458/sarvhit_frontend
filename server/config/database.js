const mongoose = require('mongoose');
require('dotenv').config();
const connectDB = async () => {
  try {
    const conn = await mongoose.connect(process.env.MONGODB_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });

    console.log('MongoDB Connected:', conn.connection.host);

    // Clean up old indexes that no longer exist in schema
    try {
      const User = mongoose.model('User');
      const collection = mongoose.connection.collection('users');
      
      // Drop old username index if it exists
      const indexes = await collection.getIndexes();
      if (indexes.username_1) {
        console.log('Dropping old username index...');
        await collection.dropIndex('username_1');
        console.log('Old username index dropped successfully');
      }
    } catch (indexError) {
      // Index might not exist, that's fine
      if (!indexError.message.includes('index not found')) {
        console.warn('Index cleanup warning:', indexError.message);
      }
    }

    return conn;
  } catch (error) {
    console.error('MongoDB Connection Error:', error.message);
    process.exit(1);
  }
};

module.exports = connectDB;
