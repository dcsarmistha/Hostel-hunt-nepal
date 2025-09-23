require('dotenv').config();
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const User = require('./models/User');
const Hostel = require('./models/Hostel');

const connectDB = require('./config/database');

connectDB();

const importData = async () => {
  try {
    // Clear existing data
    await User.deleteMany();
    await Hostel.deleteMany();
    
    // Create admin user
    const adminUser = await User.create({
      name: 'Admin User',
      email: 'admin@hostel.com',
      password: 'admin@123',
      role: 'admin'
    });
    
    // Create regular user
// Create regular user with proper preferences
const regularUser = await User.create({
  name: 'Ram Sharma',
  email: 'ram@example.com',
  password: 'password123',
  preferences: {
    locations: ['Kathmandu', 'Lalitpur'],
    priceRange: { min: 5000, max: 15000 },
    amenities: ['WiFi', 'Hot Water']
  },
  viewedHostels: [] // Initialize empty array
});
    
    // Create Nepali hostels
    const hostels = [
      {
        name: 'Kathmandu Boys Hostel',
        description: 'Affordable boys hostel with WiFi and 24/7 water supply.',
        location: 'Kathmandu, Nepal',
        address: {
          street: 'Thamel Marg',
          city: 'Kathmandu',
          state: 'Bagmati',
          zipCode: '44600'
        },
        price: 8000,
        ratings: 4.5,
        amenities: ['WiFi', 'Hot Water', 'Laundry'],
        images: ['https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=600&q=80'],
        contactEmail: 'kathmanduboys@hostel.com',
        contactPhone: '+977-9801234567',
        createdBy: adminUser._id
      },
      {
        name: 'Lalitpur Girls Hostel',
        description: 'Secure and friendly environment for girls with mess facilities.',
        location: 'Lalitpur, Nepal',
        address: {
          street: 'Jawalakhel Chowk',
          city: 'Lalitpur',
          state: 'Bagmati',
          zipCode: '44700'
        },
        price: 10000,
        ratings: 4.7,
        amenities: ['WiFi', 'Mess', 'CCTV Security'],
        images: ['https://images.unsplash.com/photo-1626221088423-07d43697c05e?auto=format&fit=crop&w=600&q=80'],
        contactEmail: 'lalitpurgirls@hostel.com',
        contactPhone: '+977-9812345678',
        createdBy: adminUser._id
      },
      {
        name: 'Baneshwor Student Hostel',
        description: 'Co-ed hostel in New Baneshwor with study-friendly environment.',
        location: 'Kathmandu, Nepal',
        address: {
          street: 'New Baneshwor',
          city: 'Kathmandu',
          state: 'Bagmati',
          zipCode: '44616'
        },
        price: 12000,
        ratings: 4.8,
        amenities: ['WiFi', 'Study Room', 'Cafeteria'],
        images: ['https://images.unsplash.com/photo-1613977257363-707ba9348227?auto=format&fit=crop&w=600&q=80'],
        contactEmail: 'baneshworhostel@hostel.com',
        contactPhone: '+977-9823456789',
        createdBy: adminUser._id
      }
    ];
    
    await Hostel.insertMany(hostels);
    
    console.log('Nepali data imported successfully ✅');
    process.exit();
  } catch (error) {
    console.error('Error importing data:', error);
    process.exit(1);
  }
};

importData();
