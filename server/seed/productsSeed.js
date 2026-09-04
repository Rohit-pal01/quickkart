require('dotenv').config();
const mongoose = require('mongoose');
const Product = require('../models/Product');
const User = require('../models/User');
const connectDB = require('../config/db');

const sampleProducts = [
  // 🥛 DAIRY, BREAD & EGGS
  {
    name: 'Amul Taaza Homogenised Toned Milk',
    description: 'Fresh and pure toned milk, fortified with Vitamin A and D.',
    category: 'Dairy & Breakfast',
    price: 54,
    unit: '1 L',
    stock: 150,
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
    name: 'Amul Malai Fresh Paneer',
    description: 'Soft, rich and creamy cottage cheese cubes, ideal for shahi paneer and tikka.',
    category: 'Dairy & Breakfast',
    price: 90,
    unit: '200 g',
    stock: 60,
    imageUrl: 'https://images.unsplash.com/photo-1631452180519-c014fe946bc7?auto=format&fit=crop&w=600&q=80',
    isActive: true
  },
  {
    name: 'Amul Cheese Slices',
    description: 'Individually wrapped processed cheese slices, melts wonderfully on burgers and toast.',
    category: 'Dairy & Breakfast',
    price: 135,
    unit: '200 g (10 slices)',
    stock: 75,
    imageUrl: 'https://images.unsplash.com/photo-1618160702438-9b02ab6515c9?auto=format&fit=crop&w=600&q=80',
    isActive: true
  },
  {
    name: 'Farm Fresh Classic Brown Eggs',
    description: 'Antibiotic-free, farm fresh brown eggs packed with high protein.',
    category: 'Dairy & Breakfast',
    price: 95,
    unit: '6 pcs pack',
    stock: 120,
    imageUrl: 'https://images.unsplash.com/photo-1582722872445-44dc5f7e3c8f?auto=format&fit=crop&w=600&q=80',
    isActive: true
  },
  {
    name: 'Mother Dairy Classic Dahi / Curd',
    description: 'Thick, creamy and pasteurized curd with live probiotic cultures.',
    category: 'Dairy & Breakfast',
    price: 35,
    unit: '400 g cup',
    stock: 80,
    imageUrl: 'https://images.unsplash.com/photo-1488477181946-6428a0291777?auto=format&fit=crop&w=600&q=80',
    isActive: true
  },
  {
    name: 'The Health Factory Zero Maida Bread',
    description: '100% whole wheat freshly baked brown bread loaf, zero palm oil or preservatives.',
    category: 'Dairy & Breakfast',
    price: 55,
    unit: '350 g',
    stock: 70,
    imageUrl: 'https://images.unsplash.com/photo-1509440159596-0249088772ff?auto=format&fit=crop&w=600&q=80',
    isActive: true
  },

  // 🍎 FRESH FRUITS & VEGETABLES
  {
    name: 'Fresh Red Onions (Pyaz)',
    description: 'Crisp, pungent and farm-fresh pink-red onions.',
    category: 'Fruits & Vegetables',
    price: 38,
    unit: '1 kg',
    stock: 200,
    imageUrl: 'https://images.unsplash.com/photo-1618512496248-a07fe83aa8cb?auto=format&fit=crop&w=600&q=80',
    isActive: true
  },
  {
    name: 'Fresh Hybrid Tomatoes (Tamatar)',
    description: 'Glossy, firm and ripe red tomatoes ideal for salads, gravies and curries.',
    category: 'Fruits & Vegetables',
    price: 32,
    unit: '1 kg',
    stock: 180,
    imageUrl: 'https://images.unsplash.com/photo-1592924357228-91a4daadcfea?auto=format&fit=crop&w=600&q=80',
    isActive: true
  },
  {
    name: 'Fresh Potatoes (Aloo)',
    description: 'Premium golden skin potatoes, versatile for frying, boiling and curries.',
    category: 'Fruits & Vegetables',
    price: 28,
    unit: '1 kg',
    stock: 220,
    imageUrl: 'https://images.unsplash.com/photo-1518977676601-b53f82aba655?auto=format&fit=crop&w=600&q=80',
    isActive: true
  },
  {
    name: 'Fresh Spinach (Palak)',
    description: 'Fresh, tender green spinach leaves rich in iron and essential vitamins.',
    category: 'Fruits & Vegetables',
    price: 25,
    unit: '250 g bunch',
    stock: 90,
    imageUrl: 'https://images.unsplash.com/photo-1576045057995-568f588f82fb?auto=format&fit=crop&w=600&q=80',
    isActive: true
  },
  {
    name: 'Fresh Spicy Green Chillies',
    description: 'Crisp and hot green chillies, essential for Indian seasoning.',
    category: 'Fruits & Vegetables',
    price: 18,
    unit: '100 g',
    stock: 85,
    imageUrl: 'https://images.unsplash.com/photo-1588252303782-cb80119abd6d?auto=format&fit=crop&w=600&q=80',
    isActive: true
  },
  {
    name: 'Shimla Royal Delicious Apples',
    description: 'Crisp, sweet and juicy premium quality red apples freshly harvested from Himachal.',
    category: 'Fruits & Vegetables',
    price: 140,
    unit: '500 g (3-4 pcs)',
    stock: 65,
    imageUrl: 'https://images.unsplash.com/photo-1560806887-1e4cd0b6cbd6?auto=format&fit=crop&w=600&q=80',
    isActive: true
  },
  {
    name: 'Golden Robusta Bananas',
    description: 'Naturally ripened sweet bananas, high in dietary potassium and energy.',
    category: 'Fruits & Vegetables',
    price: 45,
    unit: '1 kg (5-6 pcs)',
    stock: 140,
    imageUrl: 'https://images.unsplash.com/photo-1571771894821-ce9b6c11b08e?auto=format&fit=crop&w=600&q=80',
    isActive: true
  },
  {
    name: 'Fresh Sweet Pineapple',
    description: 'Juicy, tropical and sweet ripe pineapple rich in Vitamin C.',
    category: 'Fruits & Vegetables',
    price: 65,
    unit: '1 pc (approx 800g)',
    stock: 50,
    imageUrl: 'https://images.unsplash.com/photo-1550258987-190a2d41a8ba?auto=format&fit=crop&w=600&q=80',
    isActive: true
  },

  // 🍟 SNACKS & MUNCHIES
  {
    name: 'Cheetos Cheesy Crunchy Puffs',
    description: 'Irresistibly cheesy, deliciously crunchy corn puff curls.',
    category: 'Snacks & Munchies',
    price: 20,
    unit: '50 g',
    stock: 250,
    imageUrl: 'https://images.unsplash.com/photo-1566478989037-eec170784d0b?auto=format&fit=crop&w=600&q=80',
    isActive: true
  },
  {
    name: 'Crispy Punjabi Samosa',
    description: 'Golden, crispy crust stuffed with spiced potatoes and fragrant peas.',
    category: 'Snacks & Munchies',
    price: 25,
    unit: '2 pcs pack',
    stock: 200,
    imageUrl: 'https://images.unsplash.com/photo-1601050690597-df0568f70950?auto=format&fit=crop&w=600&q=80',
    isActive: true
  },
  {
    name: 'Doritos Cheese Supreme Nachos',
    description: 'Crunchy triangular corn tortilla chips loaded with savory melted cheese flavor.',
    category: 'Snacks & Munchies',
    price: 50,
    unit: '75 g',
    stock: 110,
    imageUrl: 'https://images.unsplash.com/photo-1513104890138-7c749659a591?auto=format&fit=crop&w=600&q=80',
    isActive: true
  },
  {
    name: 'Haldiram\'s Nagpur Potato Chips',
    description: 'Crispy and crunchy salted golden potato chips for instant snacking.',
    category: 'Snacks & Munchies',
    price: 35,
    unit: '100 g pouch',
    stock: 90,
    imageUrl: 'https://images.unsplash.com/photo-1599490659213-e2b9527bd087?auto=format&fit=crop&w=600&q=80',
    isActive: true
  },
  {
    name: 'Pringles Sour Cream & Onion',
    description: 'Stackable, iconic curved potato crisps loaded with creamy onion tang.',
    category: 'Snacks & Munchies',
    price: 115,
    unit: '107 g can',
    stock: 65,
    imageUrl: 'https://images.unsplash.com/photo-1582293041079-7814c2f12063?auto=format&fit=crop&w=600&q=80',
    isActive: true
  },

  // 🥤 COLD DRINKS & BEVERAGES
  {
    name: 'Coca-Cola Zero Sugar Can',
    description: 'Original crisp Coca-Cola taste with zero calories and zero sugar.',
    category: 'Beverages',
    price: 40,
    unit: '300 ml can',
    stock: 180,
    imageUrl: 'https://images.unsplash.com/photo-1622483767028-3f66f32aef97?auto=format&fit=crop&w=600&q=80',
    isActive: true
  },
  {
    name: 'Thums Up Charged Carbonated Drink',
    description: 'India\'s favorite strong and fizzy cola with an intense punch of spice.',
    category: 'Beverages',
    price: 40,
    unit: '750 ml bottle',
    stock: 160,
    imageUrl: '/thums-up.jpg',
    isActive: true
  },
  {
    name: 'Sprite Lemon Lime Fizzy Drink',
    description: 'Crisp, clean and super refreshing clear soda with natural lemon-lime flavor.',
    category: 'Beverages',
    price: 40,
    unit: '750 ml bottle',
    stock: 140,
    imageUrl: 'https://images.unsplash.com/photo-1625772299848-391b6a87d7b3?auto=format&fit=crop&w=600&q=80',
    isActive: true
  },
  {
    name: 'Fresh Melon Juice',
    description: 'Pure, refreshing and hydrating natural melon juice with no artificial flavors.',
    category: 'Beverages',
    price: 65,
    unit: '250 ml bottle',
    stock: 90,
    imageUrl: 'https://images.unsplash.com/photo-1525385133512-2f3bdd039054?auto=format&fit=crop&w=600&q=80',
    isActive: true
  },
  {
    name: 'Red Bull Energy Drink',
    description: 'Vitalizes body and mind with premium taurine, B-vitamins and caffeine.',
    category: 'Beverages',
    price: 125,
    unit: '250 ml can',
    stock: 70,
    imageUrl: 'https://images.unsplash.com/photo-1551024709-8f23befc6f87?auto=format&fit=crop&w=600&q=80',
    isActive: true
  },

  // 🍜 INSTANT & FROZEN FOOD
  {
    name: 'Maggi 2-Minute Masala Noodles',
    description: 'India\'s favorite instant noodles made with authentic roasted spices.',
    category: 'Instant Food',
    price: 56,
    unit: 'Pack of 4 (280g)',
    stock: 220,
    imageUrl: 'https://images.unsplash.com/photo-1612927601601-6638404737ce?auto=format&fit=crop&w=600&q=80',
    isActive: true
  },
  {
    name: 'Nissin Cup Noodles - Spicy Chunky Chicken',
    description: 'Instant ramen bowl with veggies, chicken chunks and fiery seasoning.',
    category: 'Instant Food',
    price: 50,
    unit: '70 g cup',
    stock: 80,
    imageUrl: 'https://images.unsplash.com/photo-1569718212165-3a8278d5f624?auto=format&fit=crop&w=600&q=80',
    isActive: true
  },
  {
    name: 'McCain Crispy French Fries',
    description: 'Golden, restaurant-style crunchy potato fries, ready in 3 minutes.',
    category: 'Instant Food',
    price: 125,
    unit: '420 g pack',
    stock: 65,
    imageUrl: 'https://images.unsplash.com/photo-1573080496219-bb080dd4f877?auto=format&fit=crop&w=600&q=80',
    isActive: true
  },
  {
    name: 'Safal Green Frozen Peas (Matar)',
    description: 'Naturally sweet, tender green peas picked at peak harvest and quick frozen.',
    category: 'Instant Food',
    price: 85,
    unit: '500 g pack',
    stock: 90,
    imageUrl: 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?auto=format&fit=crop&w=600&q=80',
    isActive: true
  },

  // 🍫 CHOCOLATES & SWEETS
  {
    name: 'Cadbury Dairy Milk Silk Chocolate',
    description: 'Unbelievably smooth, melt-in-mouth milk chocolate bar.',
    category: 'Chocolates & Sweets',
    price: 90,
    unit: '60 g bar',
    stock: 140,
    imageUrl: '/dairy-milk.jpg',
    isActive: true
  },
  {
    name: 'Nestle KitKat 4-Finger Wafer Bar',
    description: 'Crisp wafer fingers coated in smooth milk chocolate. Have a break, have a KitKat!',
    category: 'Chocolates & Sweets',
    price: 30,
    unit: '38.5 g',
    stock: 180,
    imageUrl: 'https://images.unsplash.com/photo-1582293041079-7814c2f12063?auto=format&fit=crop&w=600&q=80',
    isActive: true
  },
  {
    name: 'Ferrero Rocher Hazelnut Chocolates',
    description: 'Crisp hazelnut and milk chocolate pralines wrapped in luxurious golden foil.',
    category: 'Chocolates & Sweets',
    price: 495,
    unit: '16 pieces box',
    stock: 40,
    imageUrl: 'https://images.unsplash.com/photo-1549007994-cb92caebd54b?auto=format&fit=crop&w=600&q=80',
    isActive: true
  },

  // 🧼 PERSONAL & HOME ESSENTIALS
  {
    name: 'Dettol Original Germ Protection Liquid Handwash',
    description: '10x better germ defense with trusted pine fragrance and moisturizers.',
    category: 'Personal & Home',
    price: 99,
    unit: '200 ml pump bottle',
    stock: 80,
    imageUrl: 'https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?auto=format&fit=crop&w=600&q=80',
    isActive: true
  },
  {
    name: 'Colgate Strong Teeth Fluoride Toothpaste',
    description: 'Enamel-strengthening calcium boost formula for healthy gums and fresh breath.',
    category: 'Personal & Home',
    price: 85,
    unit: '150 g tube',
    stock: 110,
    imageUrl: '/colgate.jpg',
    isActive: true
  },
  {
    name: 'Surf Excel Quick Wash Detergent Powder',
    description: 'Powerful stain-removal formula that removes tough stains like mud and grease in 1 wash.',
    category: 'Personal & Home',
    price: 145,
    unit: '1 kg pack',
    stock: 75,
    imageUrl: 'https://images.unsplash.com/photo-1610557892470-55d9e80c0bce?auto=format&fit=crop&w=600&q=80',
    isActive: true
  }
];

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
