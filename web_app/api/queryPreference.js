/**
 * Routes for handling user preferences.
 * 
 * This module provides APIs to save, update, and retrieve user preferences.
 * Preferences are stored in the `prefModel` collection.
 */

const express = require('express');
const router = express.Router();
const prefModel = require("./models/userPref.js");

/**
 * POST /userPreference
 * 
 * Saves or updates user preferences.
 * - If a preference record already exists for the `userId`, it updates the record with `selectedPreferences`.
 * - If no record exists, it creates a new preference record.
 * 
 * Request Body:
 * - userId: ID of the user.
 * - selectedPreferences: Array of selected preferences/categories.
 * 
 * Response:
 * - Success: A message indicating that preferences were saved or updated, along with the saved data.
 * - Error: Returns a 500 status code with an error message if something goes wrong.
 */
router.post("/userPreference", async (req, res) => {
    try {
        const { userId, selectedPreferences } = req.body;

        const userPref = await prefModel.findOne({ userId: userId });
        if (userPref) {
            userPref.preference = selectedPreferences;
            userPref.save();
            return res.json({
                message: "Updated Preferences!",
            });
        }

        const pref = new prefModel({
            userId,
            preference: selectedPreferences,
        });

        const savedPref = await pref.save();
        res.json({
            message: "Preference saved successfully!",
            savedPref,
        });

    } catch (error) {
        console.error(error);
        res.status(500).json({ error: "Internal server error" });
    }
});

/**
 * GET /getpreference
 * 
 * Retrieves the preferences for a specific user by `userId`.
 * 
 * Query Parameters:
 * - userId: The ID of the user whose preferences are to be fetched.
 * 
 * Response:
 * - Success: Returns the user's preference array.
 * - Error:
 *   - 404: If no user is found with the given `userId`.
 *   - 500: If an internal server error occurs.
 */
router.get('/getpreference', async (req, res) => {
    const { userId } = req.query;
    console.log(userId, 'get preference');
    try {
        const user = await prefModel.findOne({ userId: userId });
        if (!user) {
            res.status(404).json({ error: 'user not found.' })
        }
        console.log(user.preference)
        res.json(user.preference);
    } catch (error) {
        console.error("Error fetching user by ID:", error);
        res.status(500).json({ error: "Error fetching user by ID." });
    }
});

module.exports = router;