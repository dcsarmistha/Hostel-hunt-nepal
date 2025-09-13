// routes/hostels.js
const express = require('express');
const router = express.Router();
const Hostel = require('../models/Hostel');
const { protect } = require('../middleware/auth');

// ✅ Get all hostels (public)
router.get('/', async (req, res) => {
  try {
    const hostels = await Hostel.find();
    res.json(hostels);
  } catch (err) {
    res.status(500).json({ message: 'Error fetching hostels', error: err.message });
  }
});

// ✅ Get single hostel (protected, track viewed)
router.get('/:id', protect, async (req, res) => {
  try {
    const hostel = await Hostel.findById(req.params.id);
    if (!hostel) return res.status(404).json({ message: 'Hostel not found' });

    if (!req.user.viewedHostels.includes(hostel._id)) {
      req.user.viewedHostels.push(hostel._id);
      await req.user.save();
    }

    res.json(hostel);
  } catch (err) {
    res.status(500).json({ message: 'Error fetching hostel', error: err.message });
  }
});

// ✅ Add hostel (admin only)
// ✅ Add hostel (admin only) - UPDATED VERSION
router.post('/', protect, async (req, res) => {
  try {
    if (!req.user || req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Admins only' });
    }

    // Set default values for required fields if not provided
    const hostelData = {
      ...req.body,
      createdBy: req.user._id, // Set the creator from authenticated user
      description: req.body.description || 'No description provided' // Default description
    };

    const hostel = new Hostel(hostelData);
    await hostel.save();
    res.status(201).json(hostel);
  } catch (err) {
    console.error('Error adding hostel:', err);
    res.status(400).json({ message: 'Error adding hostel', error: err.message });
  }
});

// ✅ Update hostel (admin only)
router.put('/:id', protect, async (req, res) => {
  try {
    if (!req.user || req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Admins only' });
    }

    const hostel = await Hostel.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!hostel) return res.status(404).json({ message: 'Hostel not found' });

    res.json(hostel);
  } catch (err) {
    res.status(400).json({ message: 'Error updating hostel', error: err.message });
  }
});

// ✅ Delete hostel (admin only)
router.delete('/:id', protect, async (req, res) => {
  try {
    if (!req.user || req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Admins only' });
    }

    const hostel = await Hostel.findByIdAndDelete(req.params.id);
    if (!hostel) return res.status(404).json({ message: 'Hostel not found' });

    res.json({ message: 'Hostel deleted' });
  } catch (err) {
    res.status(500).json({ message: 'Error deleting hostel', error: err.message });
  }
});

module.exports = router;
