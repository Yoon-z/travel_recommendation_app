/**
 * Routes for handling recommendations requests.
 * 
 * This module provides APIs for get recommendations for users using attraction clusters
 * and user groups.
 */

const express = require('express');
const router = express.Router();
const attraClusterModel = require("./models/attractionCluster.js");
const attractionModel = require("./models/attractions.js");
const groupModel = require('./models/userGroup.js');
const prefModel = require("./models/userPref.js");
const userModel = require('./models/user.js');

/**
 * GET /recommendation/attracluster
 * Fetches recommendations for attractions based on the user's saved attractions and similarity clusters.
 * 
 * Query Parameters:
 * - userId (string): The ID of the user requesting recommendations.
 * 
 * Returns:
 * - A JSON array of recommended attractions or `null` if no recommendations are found.
 */
router.get("/attracluster", async (req, res) => {
    const { userId } = req.query;
    try {
        const user = await userModel.findById(userId);
        if (!user) {
            console.error("Can't find user.");
            return res.json(null);
        }
        const saved = user.saved;
        if (!saved) {
            console.log("No preferences found or empty.");
            return res.json(null);
        }
        const savedKeys = Array.from(saved.keys());
        if (savedKeys.length === 0) {
            console.log("No preferences found or empty.");
            return res.json(null);
        }
        const attractKeys = savedKeys.slice(-3);
        const similarIds = [];
        for (const key of attractKeys) {
            const matchingItems = await attraClusterModel.find({ ids_list: { $in: [key] } });
            const matchedIds = matchingItems.map(item => item.ids_list);
            similarIds.push(...matchedIds.flat());
        }
        const recommendIds = similarIds.length <= 5
            ? similarIds
            : similarIds.sort(() => Math.random() - 0.5).slice(0, 5);
        const recommends = [];
        for (const id of recommendIds) {
            recommends.push(await attractionModel.findById(id).select({
                imageUrl: 1,
                title: 1,
                city: 1,
                _id: 1
            }))
        }
        console.log("Successfully get recommends by attractions cluster.");
        console.log(recommends);
        res.json(recommends);
    } catch (error) {
        console.error("Error fetching recommendations by attraction similarity:", error);
        res.status(500).json({ error: "Error fetching user preferences." });
    }
});

/**
 * GET /recommendation/usergroup
 * Fetches recommendations for attractions based on the user's group preferences.
 * 
 * Query Parameters:
 * - userId (string): The ID of the user requesting recommendations.
 * 
 * Returns:
 * - A JSON array of recommended attractions or `null` if no recommendations are found.
 */
router.get("/usergroup", async (req, res) => {
    const { userId } = req.query;
    try {
        const p = await prefModel.findOne({ userId: userId });
        const pref = p?.preference;
        if (pref && Array.isArray(pref) && pref.length > 0) {
            const index = getIndex(pref);
            try {
                const user = await groupModel.findOne({ userIndex: index });
                if (!user) {
                    console.error("User not in user group.")
                    return res.json(null);
                }
                const attractions = getRandomAttractions(user.savedAttractions);
                const shuffledAttractions = attractions.sort(() => Math.random() - 0.5);
                const selectedAttractions = shuffledAttractions.slice(0, 5);
                const recommends = [];
                for (const id of selectedAttractions) {
                    recommends.push(await attractionModel.findById(id).select({
                        imageUrl: 1,
                        title: 1,
                        city: 1,
                        _id: 1
                    }))
                }
                console.log("Successfully get recommends by user group.");
                res.json(recommends);
            } catch (error) {
                console.error("Error fetching user group:", error);
                res.status(500).json({ error: "Error fetching user group." });
            }
        } else {
            console.log("No preferences found or empty.");
            return res.json(null);
        }
    } catch (error) {
        console.error("Error fetching user preferences:", error);
        res.status(500).json({ error: "Error fetching user preferences." });
    }
})

const getRandomAttractions = (savedAttractions) => {
    const shuffled = savedAttractions.sort(() => Math.random() - 0.5);
    return shuffled.slice(0, 5);
};

/**
 * Utility function to calculate a user's preference index.
 * 
 * @param {Array<string>} pref - Array of user preferences.
 * @returns {string} A binary string representing the user's preference categories.
 */
function getIndex(pref) {
    const categories = [
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
    const index = categories.map(category => (pref.includes(category) ? '1' : '0')).join('');
    return index;
}

module.exports = router;