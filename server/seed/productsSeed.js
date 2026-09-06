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

    console.log('Seeding enriched quick-commerce product catalog...');
    const inserted = await Product.insertMany(sampleProducts);
    console.log(`Successfully seeded ${inserted.length} products!`);

    // 1. Ensure REAL admin user exists (Store Owner - full access)
    const adminEmail = 'admin@quickkart.com';
    let existingAdmin = await User.findOne({ email: adminEmail });
    if (!existingAdmin) {
      await User.create({
        name: 'QuickKart Owner (Admin)',
        email: adminEmail,
        phone: '9876543210',
        passwordHash: 'admin123',
        role: 'admin',
        isDemo: false,
        addresses: [
          {
            label: 'Hub Dark Store #1',
            line1: 'Sector 62, Indiranagar, Bengaluru',
            lat: 12.9716,
            lng: 77.5946
          }
        ]
      });
      console.log('Created Real Admin: admin@quickkart.com / admin123 (Full Privileges)');
    } else {
      existingAdmin.isDemo = false;
      await existingAdmin.save();
      console.log('Verified Real Admin: admin@quickkart.com (Full Privileges, isDemo: false)');
    }

    // 2. Ensure DEMO admin user exists (Public guest - Read-Only access)
    const demoAdminEmail = 'demo.admin@quickkart.com';
    let existingDemoAdmin = await User.findOne({ email: demoAdminEmail });
    if (!existingDemoAdmin) {
      await User.create({
        name: 'QuickKart Guest Admin',
        email: demoAdminEmail,
        phone: '9876543211',
        passwordHash: 'demo123',
        role: 'admin',
        isDemo: true,
        addresses: [
          {
            label: 'Hub Dark Store #1',
            line1: 'Sector 62, Indiranagar, Bengaluru',
            lat: 12.9716,
            lng: 77.5946
          }
        ]
      });
      console.log('Created Demo Admin: demo.admin@quickkart.com / demo123 (Read-Only Demo Mode)');
    } else {
      existingDemoAdmin.isDemo = true;
      await existingDemoAdmin.save();
      console.log('Verified Demo Admin: demo.admin@quickkart.com (Read-Only Demo Mode, isDemo: true)');
    }

    // 3. Ensure Demo Customer exists
    const customerEmail = 'customer@quickkart.com';
    const existingCustomer = await User.findOne({ email: customerEmail });
    if (!existingCustomer) {
      await User.create({
        name: 'Rahul Sharma',
        email: customerEmail,
        phone: '9876543212',
        passwordHash: 'customer123',
        role: 'customer',
        addresses: [
          {
            label: 'Home',
            line1: 'Flat 402, Green Glen Layout, Bellandur, Bengaluru',
            lat: 12.926,
            lng: 77.6762
          }
        ]
      });
      console.log('Created Demo Customer: customer@quickkart.com / customer123');
    }

    console.log('Seed completed successfully!');
    process.exit(0);
  } catch (error) {
    console.error('Error seeding data:', error);
    process.exit(1);
  }
};

seedData();
