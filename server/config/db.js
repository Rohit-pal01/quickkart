const mongoose = require('mongoose');
const path = require('path');
require('dotenv').config({ path: path.resolve(__dirname, '../.env') });
require('dotenv').config();

const autoSeedIfEmpty = async () => {
  try {
    const Product = require('../models/Product');
    const User = require('../models/User');
    const sampleProducts = require('../seed/catalog');

    const count = await Product.countDocuments();
    if (count === 0) {
      console.log('⚡ Initializing catalog with full quick-commerce products catalog...');
      await Product.insertMany(sampleProducts);
      console.log(`✅ Preloaded ${sampleProducts.length} items into catalog.`);

      // Seed default accounts
      await User.create({
        name: 'QuickKart Admin',
        email: 'admin@quickkart.com',
        phone: '9876543210',
        passwordHash: 'admin123',
        role: 'admin',
        addresses: [{ label: 'Dark Store #1', line1: 'Sector 62, Bengaluru' }]
      });

      await User.create({
        name: 'Rahul Sharma',
        email: 'customer@quickkart.com',
        phone: '9898989898',
        passwordHash: 'customer123',
        role: 'customer',
        addresses: [{ label: 'Home', line1: 'Flat 402, Green Glen Layout, Bellandur, Bengaluru' }]
      });

      console.log('✅ Created demo accounts:');
      console.log('   👤 Customer: customer@quickkart.com / customer123');
      console.log('   🛡️ Admin:    admin@quickkart.com / admin123');
    }
  } catch (err) {
    console.warn('Auto-seed notice:', err.message);
  }
};

const connectDB = async () => {
  const targetUri = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/quickkart';

  try {
    // Attempt standard connection with 5-second timeout
    const conn = await mongoose.connect(targetUri, {
      serverSelectionTimeoutMS: 5000
    });
    console.log(`✅ MongoDB Connected: ${conn.connection.host}`);
    await autoSeedIfEmpty();
  } catch (error) {
    console.warn(`⚠️  MongoDB connection at ${targetUri} failed (${error.message}).`);
    console.log('🚀 Activating embedded in-memory MongoDB for instant zero-config development...');

    try {
      const { MongoMemoryServer } = require('mongodb-memory-server');
      const mongod = await MongoMemoryServer.create();
      const memUri = mongod.getUri();

      const conn = await mongoose.connect(memUri);
      console.log(`✅ In-Memory MongoDB Connected at: ${memUri}`);
      console.log('💡 Note: Data is saved in memory while the server runs.');
      console.log('   To connect to a persistent database, verify your MongoDB Atlas URI in server/.env (MONGO_URI=mongodb+srv://...)');

      await autoSeedIfEmpty();
    } catch (memError) {
      console.error('❌ Could not start in-memory MongoDB either:', memError.message);
      console.log('\n👉 To fix this, you can:');
      console.log('   1. Start your local MongoDB service: net start MongoDB');
      console.log('   2. OR set your free MongoDB Atlas connection string in server/.env:');
      console.log('      MONGO_URI=mongodb+srv://<username>:<password>@cluster0.mongodb.net/quickkart\n');
    }
  }
};

module.exports = connectDB;
