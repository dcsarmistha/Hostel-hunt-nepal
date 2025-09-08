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
      password: 'admin123',
      role: 'admin'
    });
    
    // Create regular user
    const regularUser = await User.create({
      name: 'John Doe',
      email: 'john@example.com',
      password: 'password123',
      preferences: {
        locations: ['New York', 'California'],
        priceRange: { min: 20, max: 50 },
        amenities: ['WiFi', 'Breakfast']
      }
    });
    
    // Create sample hostels
    const hostels = [
      {
        name: 'Urban Hub Hostel',
        description: 'A modern hostel in the heart of the city with all amenities',
        location: 'New York, USA',
        address: {
          street: '123 Main St',
          city: 'New York',
          state: 'NY',
          zipCode: '10001'
        },
        price: 25,
        ratings: 4.7,
        amenities: ['WiFi', 'Breakfast', 'Laundry', 'Common Room'],
        images: ['https://images.unsplash.com/photo-1520250497591-112f2f40a3f4?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&q=80'],
        contactEmail: 'info@urbanhub.com',
        contactPhone: '+1-123-456-7890',
        createdBy: adminUser._id
      },
      {
        name: 'Mountain View Hostel',
        description: 'A cozy hostel with stunning mountain views',
        location: 'Denver, USA',
        address: {
          street: '456 Mountain Rd',
          city: 'Denver',
          state: 'CO',
          zipCode: '80202'
        },
        price: 18,
        ratings: 4.3,
        amenities: ['Parking', 'Common Room', 'Kitchen', 'Garden'],
        images: ['https://images.unsplash.com/photo-1567767292278-a4f21aa2d36e?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&q=80'],
        contactEmail: 'stay@mountainview.com',
        contactPhone: '+1-234-567-8901',
        createdBy: adminUser._id
      },
      {
        name: 'Beachside Hostel',
        description: 'Relaxing hostel just steps from the beach',
        location: 'Miami, USA',
        address: {
          street: '789 Beach Ave',
          city: 'Miami',
          state: 'FL',
          zipCode: '33101'
        },
        price: 30,
        ratings: 4.9,
        amenities: ['WiFi', 'Breakfast', 'Swimming Pool', 'Beach Access'],
        images: ['https://images.unsplash.com/photo-1596394516093-501ba68a0ba6?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&q=80'],
        contactEmail: 'hello@beachside.com',
        contactPhone: '+1-345-678-9012',
        createdBy: adminUser._id
      }
    ];
    
    await Hostel.insertMany(hostels);
    
    console.log('Data imported successfully');
    process.exit();
  } catch (error) {
    console.error('Error importing data:', error);
    process.exit(1);
  }
};

importData();