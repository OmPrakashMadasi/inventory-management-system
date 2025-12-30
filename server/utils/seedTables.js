const mongoose = require('mongoose');
const dotenv = require('dotenv');
const Table = require('../models/Table');
const connectDB = require('../config/db');

dotenv.config();

const tables = [
  { tableNumber: 1, capacity: 2, isActive: true },
  { tableNumber: 2, capacity: 2, isActive: true },
  { tableNumber: 3, capacity: 4, isActive: true },
  { tableNumber: 4, capacity: 4, isActive: true },
  { tableNumber: 5, capacity: 6, isActive: true },
  { tableNumber: 6, capacity: 6, isActive: true },
  { tableNumber: 7, capacity: 8, isActive: true },
  { tableNumber: 8, capacity: 8, isActive: true }
];

const seedTables = async () => {
  try {
    await connectDB();
    
    await Table.deleteMany();
    console.log('Existing tables cleared');
    
    await Table.insertMany(tables);
    console.log('Tables seeded successfully');
    
    console.log(`${tables.length} tables created`);
    process.exit(0);
  } catch (error) {
    console.error('Error seeding tables:', error);
    process.exit(1);
  }
};

seedTables();
