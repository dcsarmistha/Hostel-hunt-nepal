const mongoose = require('mongoose');

const hostelSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true
  },
  description: {
    type: String,
    required: true
  },
  location: {
    type: String,
    required: true
  },
  address: {
    street: String,
    city: String,
    state: String,
    zipCode: String
  },
  coordinates: {
    lat: Number,
    lng: Number
  },
  price: {
    type: Number,
    required: true
  },
  ratings: {
    type: Number,
    default: 0,
    min: 0,
    max: 5
  },
  amenities: [String],
  images: [String],
  contactEmail: String,
  contactPhone: String,
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  isActive: {
    type: Boolean,
    default: true
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('Hostel', hostelSchema);