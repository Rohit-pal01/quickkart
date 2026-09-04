const mongoose = require('mongoose');

const autoSeedIfEmpty = async () => {
  try {
    const Product = require('../models/Product');
    const User = require('../models/User');

    const count = await Product.countDocuments();
    if (count === 0) {
      console.log('⚡ Initializing catalog with sample quick-commerce products...');
      // Sample products seed
      const sampleProducts = [
        {
          name: 'Amul Taaza Homogenised Toned Milk',
          description: 'Fresh and pure toned milk, fortified with Vitamin A and D.',
          category: 'Dairy & Breakfast',
          price: 54,
          unit: '1 L',
          stock: 120,
          imageUrl: 'https://images.unsplash.com/photo-1550583724-b2692b85b150?auto=format&fit=crop&w=600&q=80',
          isActive: true
        },
        {
          name: 'Amul Salted Butter',
          description: 'Delicious creamy salted butter made from pure cow milk.',
          category: 'Dairy & Breakfast',
          price: 58,
          unit: '100 g',
          stock: 90,
          imageUrl: 'https://images.unsplash.com/photo-1589985270826-4b7bb135bc9d?auto=format&fit=crop&w=600&q=80',
          isActive: true
        },
        {
          name: 'Farm Fresh Brown Eggs',
          description: 'Nutrient-rich antibiotic-free farm fresh brown eggs packed with protein.',
          category: 'Dairy & Breakfast',
          price: 95,
          unit: '6 pcs',
          stock: 80,
          imageUrl: 'https://images.unsplash.com/photo-1516467508483-a7212febe31a?auto=format&fit=crop&w=600&q=80',
          isActive: true
        },
        {
          name: 'Fresh Shimla Apples',
          description: 'Crisp, sweet and juicy premium quality red apples.',
          category: 'Fruits & Vegetables',
          price: 140,
          unit: '500 g',
          stock: 65,
          imageUrl: 'https://images.unsplash.com/photo-1560806887-1e4cd0b6cbd6?auto=format&fit=crop&w=600&q=80',
          isActive: true
        },
        {
          name: 'Robusta Golden Bananas',
          description: 'Naturally ripened sweet bananas, high in potassium and fiber.',
          category: 'Fruits & Vegetables',
          price: 45,
          unit: '1 kg',
          stock: 150,
          imageUrl: 'https://images.unsplash.com/photo-1571771894821-ce9b6c11b08e?auto=format&fit=crop&w=600&q=80',
          isActive: true
        },
        {
          name: 'Lay\'s India\'s Magic Masala Chips',
          description: 'Spicy, crunchy potato chips seasoned with Indian spices.',
          category: 'Snacks & Munchies',
          price: 20,
          unit: '50 g',
          stock: 200,
          imageUrl: 'https://images.unsplash.com/photo-1566478989037-eec170784d0b?auto=format&fit=crop&w=600&q=80',
          isActive: true
        },
        {
          name: 'Coca-Cola Zero Sugar Can',
          description: 'Crisp, refreshing taste of Coca-Cola with zero sugar.',
          category: 'Beverages',
          price: 40,
          unit: '300 ml',
          stock: 160,
          imageUrl: 'https://images.unsplash.com/photo-1622483767028-3f66f32aef97?auto=format&fit=crop&w=600&q=80',
          isActive: true
        },
        {
          name: 'Maggi 2-Minute Masala Noodles',
          description: 'Favorite Indian instant noodles with authentic tastemaker.',
          category: 'Instant Food',
          price: 56,
          unit: 'Pack of 4',
          stock: 180,
          imageUrl: 'https://images.unsplash.com/photo-1612927601601-6638404737ce?auto=format&fit=crop&w=600&q=80',
          isActive: true
        },
        {
          name: 'Whole Wheat Fresh Bread',
          description: '100% whole wheat bread loaf baked fresh daily.',
          category: 'Bakery',
          price: 55,
          unit: '350 g',
          stock: 70,
          imageUrl: 'https://images.unsplash.com/photo-1509440159596-0249088772ff?auto=format&fit=crop&w=600&q=80',
          isActive: true
        }
      ];

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
    // Attempt standard connection with 3-second timeout
    const conn = await mongoose.connect(targetUri, {
      serverSelectionTimeoutMS: 3000
    });
    console.log(`✅ MongoDB Connected: ${conn.connection.host}`);
    await autoSeedIfEmpty();
  } catch (error) {
    console.warn(`⚠️  Local MongoDB at ${targetUri} was unreachable (${error.message}).`);
    console.log('🚀 Activating embedded in-memory MongoDB for instant zero-config development...');

    try {
      const { MongoMemoryServer } = require('mongodb-memory-server');
      const mongod = await MongoMemoryServer.create();
      const memUri = mongod.getUri();

      const conn = await mongoose.connect(memUri);
      console.log(`✅ In-Memory MongoDB Connected at: ${memUri}`);
      console.log('💡 Note: Data is saved in memory while the server runs.');
      console.log('   To connect to a persistent database, add your MongoDB Atlas URI in server/.env (MONGO_URI=mongodb+srv://...)');

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
