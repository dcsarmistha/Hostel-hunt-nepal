const express = require('express');
const router = express.Router();
const Hostel = require('../models/Hostel');
const User = require('../models/User');
const { protect } = require('../middleware/auth');

/**
 * GET /api/recommendations
 * Returns recommended hostels for the logged-in user
 */
router.get('/', protect, async (req, res) => {
    try {
        const user = req.user;

        // --- 1. Content-based filtering ---
        let contentFiltered = await Hostel.find({
            location: { $regex: user.locationPreference || '', $options: 'i' },
            price: { 
                $gte: user.priceRange?.min || 0,
                $lte: user.priceRange?.max || 10000
            },
            $or: [
                { gender: user.gender },
                { gender: 'co-ed' }
            ],
            isActive: true
        });

        // --- 2. Collaborative filtering ---
        // Find similar users by location and gender
        const similarUsers = await User.find({
            _id: { $ne: user._id },
            locationPreference: user.locationPreference,
            gender: user.gender
        });

        // Collect hostels viewed by similar users
        let collabHostels = [];
        similarUsers.forEach(simUser => {
            if (simUser.viewedHostels && simUser.viewedHostels.length) {
                collabHostels.push(...simUser.viewedHostels);
            }
        });

        // Remove hostels the current user already viewed
        collabHostels = collabHostels.filter(
            h => !user.viewedHostels.includes(h.toString())
        );

        // Fetch full hostel data for collaborative filtering
        const collabFiltered = await Hostel.find({ _id: { $in: collabHostels }, isActive: true });

        // --- 3. Merge and remove duplicates ---
        const merged = [...contentFiltered, ...collabFiltered];
        const uniqueHostels = Array.from(new Set(merged.map(h => h._id.toString())))
            .map(id => merged.find(h => h._id.toString() === id));

        res.json(uniqueHostels);
    } catch (error) {
        console.error('Recommendation error:', error);
        res.status(500).json({ message: 'Server error', error: error.message });
    }
});

module.exports = router;
