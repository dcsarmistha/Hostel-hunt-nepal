const express = require('express');
const router = express.Router();
const Hostel = require('../models/Hostel');
const User = require('../models/User');
const { protect } = require('../middleware/auth');

/**
 * GET /api/recommendations
 * Returns recommended hostels for the logged-in user using content-based + collaborative filtering
 */
router.get('/', protect, async (req, res) => {
    try {
        const user = await User.findById(req.user._id).populate('viewedHostels');
        
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        // --- 1. Content-based filtering ---
        let contentFilter = { isActive: true };
        
        // Use preferences from user model
        if (user.preferences && user.preferences.locations && user.preferences.locations.length > 0) {
            contentFilter.location = { 
                $in: user.preferences.locations.map(loc => new RegExp(loc, 'i'))
            };
        }
        
        if (user.preferences && user.preferences.priceRange) {
            contentFilter.price = { 
                $gte: user.preferences.priceRange.min || 0,
                $lte: user.preferences.priceRange.max || 10000
            };
        }

        const contentFiltered = await Hostel.find(contentFilter);

        // --- 2. Collaborative filtering ---
        let collaborativeHostels = [];
        
        // Find users with similar preferences
        const similarUsers = await User.find({
            _id: { $ne: user._id },
            'preferences.locations': { $in: user.preferences?.locations || [] }
        }).populate('viewedHostels');

        // Get hostels viewed by similar users
        similarUsers.forEach(similarUser => {
            if (similarUser.viewedHostels && similarUser.viewedHostels.length > 0) {
                similarUser.viewedHostels.forEach(hostel => {
                    // Only add if user hasn't viewed this hostel
                    if (!user.viewedHostels.some(vh => vh._id.toString() === hostel._id.toString())) {
                        collaborativeHostels.push(hostel);
                    }
                });
            }
        });

        // Remove duplicates from collaborative results
        collaborativeHostels = collaborativeHostels.filter((hostel, index, self) => 
            index === self.findIndex(h => h._id.toString() === hostel._id.toString())
        );

        // --- 3. Merge results ---
        const allRecommendations = [...contentFiltered, ...collaborativeHostels];
        
        // Remove duplicates and hostels user has already viewed
        const uniqueHostels = allRecommendations.filter((hostel, index, self) => {
            const isDuplicate = index !== self.findIndex(h => h._id.toString() === hostel._id.toString());
            const alreadyViewed = user.viewedHostels.some(vh => vh._id.toString() === hostel._id.toString());
            return !isDuplicate && !alreadyViewed;
        });

        // Limit to 6 recommendations
        const finalRecommendations = uniqueHostels.slice(0, 6);

        res.json(finalRecommendations);
    } catch (error) {
        console.error('Recommendation error:', error);
        res.status(500).json({ message: 'Server error', error: error.message });
    }
});

module.exports = router;