const path = require('path');
require('dotenv').config({ path: path.resolve(__dirname, '../.env') });
require('dotenv').config();
const mongoose = require('mongoose');
const Product = require('../models/Product');
const User = require('../models/User');
const connectDB = require('../config/db');
const sampleProducts = require('./catalog');

const seedData = async () => {
  try {
    await connectDB();

    console.log('Clearing existing product catalog...');
    await Product.deleteMany({});

    console.log('Seeding enriched Blinkit/Zepto quick-commerce catalog...');
    const inserted = await Product.insertMany(sampleProducts);
    console.log(`Successfully seeded ${inserted.length} products!`);

    // Ensure sample admin user exists
    const adminEmail = 'admin@quickkart.com';
    const existingAdmin = await User.findOne({ email: adminEmail });
    if (!existingAdmin) {
      await User.create({
        name: 'QuickKart Admin',
        email: adminEmail,
        phone: '9876543210',
        passwordHash: 'admin123',
        role: 'admin',
        addresses: [
          {
            label: 'Hub Dark Store #1',
            line1: 'Sector 62, Indiranagar, Bengaluru',
            lat: 12.9716,
            lng: 77.5946
          }
        ]
      });
      console.log('Created admin: admin@quickkart.com / admin123');
    }

    console.log('Seed completed successfully!');
    process.exit(0);
  } catch (error) {
    console.error('Error seeding data:', error);
    process.exit(1);
  }
};

seedData();
