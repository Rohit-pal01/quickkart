require('dotenv').config();
const mongoose = require('mongoose');
const Product = require('../models/Product');
const User = require('../models/User');
const connectDB = require('../config/db');

const sampleProducts = [
  // Dairy & Breakfast
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
    name: 'Epigamia Greek Yogurt - Blueberry',
    description: 'Thick, creamy Greek yogurt blended with real antioxidant blueberries.',
    category: 'Dairy & Breakfast',
    price: 60,
    unit: '90 g',
    stock: 45,
    imageUrl: 'https://images.unsplash.com/photo-1488477181946-6428a0291777?auto=format&fit=crop&w=600&q=80',
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

  // Fruits & Vegetables
  {
    name: 'Fresh Shimla Apples',
    description: 'Crisp, sweet and juicy premium quality red apples freshly harvested from Himachal orchards.',
    category: 'Fruits & Vegetables',
    price: 140,
    unit: '500 g (3-4 pcs)',
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
    name: 'Fresh Hydroponic Spinach (Palak)',
    description: 'Tender, washed and pesticide-free green spinach leaves ready to cook.',
    category: 'Fruits & Vegetables',
    price: 32,
    unit: '250 g',
    stock: 50,
    imageUrl: 'https://images.unsplash.com/photo-1576045057995-568f588f82fb?auto=format&fit=crop&w=600&q=80',
    isActive: true
  },
  {
    name: 'Hybrid Juicy Red Tomatoes',
    description: 'Firm, glossy and ripe red tomatoes ideal for curries and fresh salads.',
    category: 'Fruits & Vegetables',
    price: 38,
    unit: '1 kg',
    stock: 110,
    imageUrl: 'https://images.unsplash.com/photo-1592924357228-91a4daadcfea?auto=format&fit=crop&w=600&q=80',
    isActive: true
  },
  {
    name: 'Fresh Baby Potatoes',
    description: 'Earthy, farm-fresh small potatoes perfect for dum aloo and roasting.',
    category: 'Fruits & Vegetables',
    price: 28,
    unit: '1 kg',
    stock: 95,
    imageUrl: 'https://images.unsplash.com/photo-1518977676601-b53f82aba655?auto=format&fit=crop&w=600&q=80',
    isActive: true
  },

  // Snacks & Munchies
  {
    name: 'Lay\'s India\'s Magic Masala Chips',
    description: 'Spicy, crunchy potato chips seasoned with a fusion of traditional Indian spices.',
    category: 'Snacks & Munchies',
    price: 20,
    unit: '50 g',
    stock: 200,
    imageUrl: 'https://images.unsplash.com/photo-1566478989037-eec170784d0b?auto=format&fit=crop&w=600&q=80',
    isActive: true
  },
  {
    name: 'Doritos Cheese Supreme Nachos',
    description: 'Crunchy triangular corn tortilla chips loaded with rich cheesy flavor.',
    category: 'Snacks & Munchies',
    price: 50,
    unit: '75 g',
    stock: 140,
    imageUrl: 'https://images.unsplash.com/photo-1513104890138-7c749659a591?auto=format&fit=crop&w=600&q=80',
    isActive: true
  },
  {
    name: 'Haldiram\'s Aloo Bhujia',
    description: 'Crispy and spiced mint potato strands for tea time snacking.',
    category: 'Snacks & Munchies',
    price: 48,
    unit: '200 g',
    stock: 90,
    imageUrl: 'https://images.unsplash.com/photo-1621996346565-e3d5d62811b7?auto=format&fit=crop&w=600&q=80',
    isActive: true
  },

  // Beverages & Cold Drinks
  {
    name: 'Coca-Cola Zero Sugar Can',
    description: 'Crisp, refreshing taste of Coca-Cola with zero calories and zero sugar.',
    category: 'Beverages',
    price: 40,
    unit: '300 ml',
    stock: 160,
    imageUrl: 'https://images.unsplash.com/photo-1622483767028-3f66f32aef97?auto=format&fit=crop&w=600&q=80',
    isActive: true
  },
  {
    name: 'Raw Pressery Tender Coconut Water',
    description: '100% natural, refreshing coconut water packed with electrolytes.',
    category: 'Beverages',
    price: 65,
    unit: '200 ml',
    stock: 75,
    imageUrl: 'https://images.unsplash.com/photo-1550258987-190a2d41a8ba?auto=format&fit=crop&w=600&q=80',
    isActive: true
  },
  {
    name: 'Nescafe Classic Instant Coffee',
    description: 'Rich and aromatic 100% pure coffee granules made from finest Robusta beans.',
    category: 'Beverages',
    price: 185,
    unit: '100 g jar',
    stock: 60,
    imageUrl: 'https://images.unsplash.com/photo-1514432324607-a09d9b4aefdd?auto=format&fit=crop&w=600&q=80',
    isActive: true
  },

  // Instant & Frozen Food
  {
    name: 'Maggi 2-Minute Masala Noodles',
    description: 'Favorite Indian instant noodles with the authentic masala tastemaker.',
    category: 'Instant Food',
    price: 56,
    unit: 'Pack of 4 (280g)',
    stock: 180,
    imageUrl: 'https://images.unsplash.com/photo-1612927601601-6638404737ce?auto=format&fit=crop&w=600&q=80',
    isActive: true
  },
  {
    name: 'McCain French Fries Crispy',
    description: 'Golden, crispy restaurant-style potato fries, easy to air-fry or shallow fry.',
    category: 'Instant Food',
    price: 125,
    unit: '420 g',
    stock: 40,
    imageUrl: 'https://images.unsplash.com/photo-1576107232684-1279f3908594?auto=format&fit=crop&w=600&q=80',
    isActive: true
  },

  // Bakery & Bread
  {
    name: 'The Health Factory Zero Maida Whole Wheat Bread',
    description: '100% whole wheat bread loaf baked fresh daily, no preservatives or palm oil.',
    category: 'Bakery',
    price: 55,
    unit: '350 g',
    stock: 70,
    imageUrl: 'https://images.unsplash.com/photo-1509440159596-0249088772ff?auto=format&fit=crop&w=600&q=80',
    isActive: true
  },
  {
    name: 'Nutella Hazelnut Cocoa Spread',
    description: 'Irresistible creamy hazelnut and cocoa spread, perfect on toasted bread.',
    category: 'Bakery',
    price: 360,
    unit: '350 g',
    stock: 55,
    imageUrl: 'https://images.unsplash.com/photo-1587899897387-091ebd01a6b2?auto=format&fit=crop&w=600&q=80',
    isActive: true
  }
];

const seedData = async () => {
  try {
    await connectDB();

    console.log('Clearing existing product catalog...');
    await Product.deleteMany({});

    console.log('Seeding fresh products...');
    const inserted = await Product.insertMany(sampleProducts);
    console.log(`Successfully seeded ${inserted.length} products!`);

    // Ensure sample admin user exists for development
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
            line1: 'Sector 62, Electronic City, Bengaluru',
            lat: 12.9716,
            lng: 77.5946
          }
        ]
      });
      console.log('Created default admin user: admin@quickkart.com / admin123');
    }

    // Ensure sample customer user exists
    const customerEmail = 'customer@quickkart.com';
    const existingCustomer = await User.findOne({ email: customerEmail });
    if (!existingCustomer) {
      await User.create({
        name: 'Rahul Sharma',
        email: customerEmail,
        phone: '9898989898',
        passwordHash: 'customer123',
        role: 'customer',
        addresses: [
          {
            label: 'Home',
            line1: 'Flat 402, Green Glen Layout, Bellandur, Bengaluru',
            lat: 12.9279,
            lng: 77.6827
          }
        ]
      });
      console.log('Created default customer: customer@quickkart.com / customer123');
    }

    console.log('Seed completed successfully!');
    process.exit(0);
  } catch (error) {
    console.error('Error seeding data:', error);
    process.exit(1);
  }
};

seedData();
