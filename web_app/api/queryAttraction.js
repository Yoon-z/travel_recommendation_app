/**
 * Routes for handling attraction-related requests.
 * 
 * This module provides APIs for retrieving attraction images, details, cities, 
 * and most-saved attractions.
 */

const express = require('express');
const router = express.Router();
const attractionModel = require('./models/attractions.js');
const prefModel = require('./models/userPref.js');

/**
 * Helper function to retrieve images for a given category.
 * @param {string} category - The category name to filter attractions.
 * @returns {Array} - Array of images and related details for the category.
 */
async function getImagesByCategory(category) {
    try {
        const filter = { [category]: 1 };

        const images = await attractionModel.aggregate([
            { $match: filter },
            { $sort: { savedCount: -1 } },
            { $limit: 5 },
            { $project: { imageUrl: 1, title: 1, city: 1, _id: 1 } },
        ]);

        return images;
    } catch (error) {
        console.error(`Error fetching images for category ${category}:`, error);
        return [];
    }
}

/**
 * API to fetch attraction images based on user preferences or default categories.
 * - If `userId` is provided, fetch categories from user preferences.
 * - If no `userId`, fetch images from all default categories.
 */
router.get("/attractions", async (req, res) => {
    const { userId } = req.query;
    let categories;
    const categorydict = {
        'Nature': "nature",
        'Animal': "animal",
        'Architecture': "architect",
        'History': "history",
        'Culture': "culture",
        'Hiking': "hiking",
        'Park': "park",
        'Museum': "museum",
        'Religion': "religion",
        'Amusement': "amusement",
        'Senic Spot': "senic",
        'Botanical': "botanical",
        'Sport': "sport",
    }
    if (!userId || userId.trim() === "") {
        categories = [
            'Nature',
            'Animal',
            'Architecture',
            'History',
            'Culture',
            'Hiking',
            'Park',
            'Museum',
            'Religion',
            'Amusement',
            'Senic Spot',
            'Botanical',
            'Sport',
        ];
    } else {
        try {
            const userPref = await prefModel.findOne({ userId });
            if (!userPref) {
                res.status(404).json({ error: "User not found in userPref Model." });
                return;
            }
            categories = userPref.preference;
            if (!categories) {
                categories = [
                    'Nature',
                    'Animal',
                    'Architecture',
                    'History',
                    'Culture',
                    'Hiking',
                    'Park',
                    'Museum',
                    'Religion',
                    'Amusement',
                    'Senic Spot',
                    'Botanical',
                    'Sport',
                ];
            }
        } catch (error) {
            console.error("Error fetching user's preference by ID:", error);
            res.status(500).json({ error: "Error fetching user's preference by ID." });
        }
    }
    try {
        const imagesByCategory = {};
        if (categories.length > 5) {
            for (const category of categories) {
                imagesByCategory[category] = await getImagesByCategory(categorydict[category]);
            }
        } else {
            for (const category of categories) {
                imagesByCategory[category] = await getImagesByCategory(categorydict[category]);
            }
        }
        res.json({ imagesByCategory });
        console.log("get images successfully.");
    } catch (e) {
        res.status(400).json(e);
    }
});

/**
 * API to fetch attraction details by ID.
 */
router.get("/attraction/:id", async (req, res) => {
    try {
        const attraction = await attractionModel.findById(
            req.params.id,
            "imageUrl title city address saveCount"
        );

        if (attraction) {
            res.json(attraction);
        } else {
            res.status(404).json({ error: "Attraction not found" });
        }
    } catch (error) {
        console.error("Error fetching attraction by ID:", error);
        res.status(500).json({ error: "Error fetching attraction by ID" });
    }
});

/**
 * API to fetch all distinct city names from the database.
 */
router.get("/city", async (req, res) => {
    try {
        const cities = await attractionModel.distinct("city");
        res.json(cities);
    } catch (error) {
        console.error("Error fetching all city names:", error);
        res.status(500).json({ error: "Error fetching all city names." });
    }
});

/**
 * API to fetch all attractions in a city grouped by categories.
 */
router.get("/city/attractions", async (req, res) => {
    const { keyword } = req.query;
    const categories = [
        "nature",
        "animal",
        "architect",
        "history",
        "culture",
        "hiking",
        "park",
        "museum",
        "religion",
        "amusement",
        "senic",
        "botanical",
        "sport",
    ];
    const attractions = {};
    try {
        for (const category of categories) {
            const images = await attractionModel.aggregate([
                {
                    $match: {
                      $or: [
                        { city: { $regex: keyword, $options: "i" } }, 
                        { street: { $regex: keyword, $options: "i" } },
                        { title: { $regex: keyword, $options: "i" } },
                        { postalCode: { $regex: keyword, $options: "i" } },
                        { address: { $regex: keyword, $options: "i" } }
                      ],
                      [category]: 1
                    }
                },
                { $project: { imageUrl: 1, title: 1, city: 1, _id: 1 } },
            ]);
            if (images && images.length > 0) {
                attractions[category] = images;
            }
        }
        res.json({ attractions });
    } catch (error) {
        console.error("Error fetching all city attractions:", error);
        res.status(500).json({ error: "Error fetching all city attractions." });
    }
});

/**
 * API to fetch the top 5 most-saved attractions.
 * - If fewer than 5 saved attractions exist, fills remaining spots with random attractions.
 */
router.get("/mostsaved", async (req, res) => {
    try {
        const topAttractions = await attractionModel.find()
            .sort({ saveCount: -1 })
            .limit(5)
            .select({
                imageUrl: 1,
                title: 1,
                city: 1,
                _id: 1
            });
        const topAttractionsCount = topAttractions.length;
        if (topAttractionsCount < 5) {
            const randomAttraction = await attractionModel.aggregate([
                {
                    $match: {
                        _id: { $nin: topAttractions.length ? topAttractions.map(attraction => attraction._id) : [] }
                    }
                },
                { $sample: { size: 5 - topAttractionsCount } },
                { $project: { imageUrl: 1, title: 1, city: 1, _id: 1 } }
            ]);
            const result = [...topAttractions, ...randomAttraction];
            return res.json(result);
        }
        return res.json(topAttractions);
    } catch (error) {
        console.error("Error fetching attraction by ID:", error);
        res.status(500).json({ error: "Error fetching attraction by ID" });
    }
});

module.exports = router;