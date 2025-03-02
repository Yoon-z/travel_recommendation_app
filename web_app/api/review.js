/**
 * Routes for handling reviews-related requests.
 * 
 * This module provides APIs for saving reviews, getting reviews and review images for 
 * the attraction, saving the attraction, getting the save status and get all saved
 * attractions for the user.
 */

const express = require('express');
const reviewModel = require("./models/reviews");
const userModel = require('./models/user.js');
const groupModel = require('./models/userGroup.js');
const attractionModel = require("./models/attractions.js");
const prefModel = require("./models/userPref.js");
const getIndex = require("./")
const router = express.Router();
const multer = require("multer");
const path = require("path");
const fs = require('fs');
require('dotenv').config()

const api_server = process.env.REACT_APP_API_SERVER;

// Configure multer for file uploads
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        const uploadPath = path.join(__dirname, 'uploads');
        cb(null, uploadPath);
    },
    filename: function (req, file, cb) {
        cb(null, Date.now() + path.extname(file.originalname));
    }
});

// Ensure the uploads directory exists
const uploadDir = path.join(__dirname, 'uploads');
if (!fs.existsSync(uploadDir)) {
    fs.mkdirSync(uploadDir, { recursive: true });
    console.log('Uploads folder created.');
}
const upload = multer({ storage: storage });

/**
 * GET /reviews/:id
 * Fetches a random sample of 5 reviews for a specific attraction.
 * 
 * Route Parameters:
 * - id (string): The ID of the attraction.
 * 
 * Returns:
 * - Array of reviews with userName, like_score, green_score, review, and imageUrl fields.
 */
router.get('/getreviews/:id', async (req, res) => {
    const { id } = req.params;
    const filter = { 'attractionId': id };
    try {
        const reviews = await reviewModel.aggregate([
            { $match: filter },
            { $sample: { size: 5 } },
            { $project: { userName: 1, like_score: 1, green_score: 1, review: 1, imageUrl: 1 } },
        ]);
        console.log("get reviews successfully.")
        res.json(reviews);
    } catch (error) {
        res.status(400).json(error);
    }

});

/**
 * GET /reviews/images/:id
 * Fetches a random sample of 5 image URLs for a specific attraction.
 * 
 * Route Parameters:
 * - id (string): The ID of the attraction.
 * 
 * Returns:
 * - Array of image URLs associated with reviews for the attraction.
 */
router.get('/images/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const filter = { 'attractionId': id };
        const images = await reviewModel.aggregate([
            { $match: filter },
            { $sample: { size: 5 } },
            { $project: { imageUrl: 1, _id: 0 } },
        ]);
        if (!images || images.length === 0) {
            console.log('No images in reviews.')
            return res.json(null);
        }
        const imageUrls = images.map((image) => image.imageUrl);
        res.json(imageUrls);
        console.log('get all images in reviews.');
    } catch (error) {
        res.status(400).json(error);
    }
})

/**
 * GET reviews/score/:id
 * Calculates the average green_score and like_score for a specific attraction.
 * 
 * Route Parameters:
 * - id (string): The ID of the attraction.
 * 
 * Returns:
 * - Object with average green_score and like_score.
 * - 404 if no reviews are found for the attraction.
 */
router.get('/score/:id', async (req, res) => {
    try {
        const { id } = req.params;
        // Use aggregation to calculate the average green_score and like_score
        const result = await reviewModel.aggregate([
            {
                $match: {
                    attractionId: id,
                },
            },
            {
                $group: {
                    _id: null,  // No specific grouping, just get the overall averages
                    averageGreenScore: { $avg: "$green_score" },  // Calculate the average of green_score
                    averageLikeScore: { $avg: "$like_score" },    // Calculate the average of like_score
                },
            },
        ]);
        if (result.length === 0) {
            return res.status(404).json({ message: 'No reviews found for this attraction.' });
        }
        res.json({
            green: result[0].averageGreenScore,
            like: result[0].averageLikeScore,
        });
    } catch (error) {
        res.status(400).json(error);
    }
})

/**
 * POST /reviews/submitreview
 * Saves a new review with an optional uploaded image.
 * 
 * Body Parameters:
 * - id (string): Attraction ID.
 * - userId (string): User ID of the reviewer.
 * - username (string): Username of the reviewer.
 * - like_score (number): Like score for the attraction.
 * - green_score (number): Green score for the attraction.
 * - comment (string): Review comment.
 * 
 * File Upload:
 * - image (file): Optional image file to be uploaded.
 * 
 * Returns:
 * - Message indicating success and the saved review data.
 * - 500 Internal Server Error for server-side issues.
 */
router.post("/submitreview", upload.single('image'), async (req, res) => {
    try {
        const imageUrl = req.file ? `${api_server}/uploads/${req.file.filename}` : null;
        const { id, userId, username, like_score, green_score, comment } = req.body;

        const review = new reviewModel({
            attractionId: id,
            userId: userId,
            userName: username,
            like_score,
            green_score,
            review: comment,
            imageUrl
        });

        const savedReview = await review.save();
        res.json({
            message: "Review saved successfully!",
            savedReview,
        });

    } catch (error) {
        console.error(error);
        res.status(500).json({ error: "Internal server error" });
    }
});

/**
 * GET reviews/ifsaved
 * Check if this attraction is saved by currently logged in user.
 * 
 * Route Parameters:
 * - attractionId (string): The ID of the attraction
 * - userId (string): The ID of the user
 * 
 * Returns:
 * - True if user saved, otherwise False.
 * - 404 if user is not found.
 */
router.get('/ifsaved', async (req, res) => {
    const { userId, attractionId } = req.query;

    try {
        const user = await userModel.findOne({
            _id: userId,
            [`saved.${attractionId}`]: { $exists: true }
        });
        if (!user) {
            console.log("not saved.")
            return res.json(false);
        } else {
            return res.json(true);
        }
    } catch (error) {
        console.error("Error fetching user:", error);
        res.status(500).json({ error: "Internal Server Error" });
    }
});

/**
 * GET reviews/getsaved
 * Get all attractions saved by the currently logged in user.
 * 
 * Route Parameters:
 * - userId (string): The ID of the user.
 * 
 * Returns:
 * - A List of attraction Object it contains attractionId and imageUrl.
 * - 404 if user is not found.
 */
router.get('/getsaved', async (req, res) => {
    const { userId } = req.query;
    try {
        const user = await userModel.findById(userId);
        if (!user) {
            res.status(404).json({ error: 'user not found.' })
        }
        if (!user.saved) {
            return res.json(null);
        }
        return res.json(user.saved);
    } catch (error) {
        console.error("Error fetching user by ID:", error);
        res.status(500).json({ error: "Error fetching user by ID." });
    }
});

/**
 * POST /reviews/likechange
 * Saves a new review with an optional uploaded image.
 * 
 * Body Parameters:
 * - id (string): Attraction ID.
 * - userId (string): User ID of the reviewer.
 * - username (string): Username of the reviewer.
 * - like_score (number): Like score for the attraction.
 * - green_score (number): Green score for the attraction.
 * - comment (string): Review comment.
 * 
 * File Upload:
 * - image (file): Optional image file to be uploaded.
 * 
 * Returns:
 * - Message indicating success and the saved review data.
 * - 500 Internal Server Error for server-side issues.
 */
router.post('/likechange', async (req, res) => {
    // if the user's like status is changed
    const { id, userId, liked } = req.body;
    try {
        const attraction = await attractionModel.findByIdAndUpdate(
            id,
            { $inc: { saveCount: liked ? 1 : -1 } },
            { new: true }
        );
        if (!attraction) {
            return res.status(404).json({ error: 'attraction not found.' });
        }
        if (liked) {
            console.log("user likes this attraction.")
            // save attraction in user model
            const user = await userModel.findByIdAndUpdate(
                userId,
                {
                    $set: {
                        [`saved.${attraction._id}`]: attraction.imageUrl,
                    },
                },
                {
                    new: true,
                    upsert: false,
                    runValidators: true,
                }
            );
            if (!user) {
                return res.status(404).json({ error: 'user not found.' });
            }
            // find user preference
            const pref = await prefModel.findOne({ userId: userId }).preference;
            if (pref && Array.isArray(pref) && pref.length > 0) {
                const index = getIndex(pref);
                // save in user group model
                if (!groupModel.some(group => group.userIndex === index)) {
                    groupModel.push({
                        userIndex: index,
                        savedAttractions: [attraction._id]
                    });
                } else {
                    const existingGroup = groupModel.find(group => group.userIndex === index);
                    existingGroup.savedAttractions.push(attraction._id);
                }
            }
        } else {
            const user = await userModel.findByIdAndUpdate(
                userId,
                {
                    $unset: { [`saved.${attraction._id}`]: "" },
                },
                {
                    new: true,
                    upsert: false,
                }
            );
            if (!user) {
                return res.status(404).json({ error: 'User not found.' });
            }
            console.log("removed this attraction from user.");
            const pref = await prefModel.findOne({ userId: userId }).preference;
            if (pref && Array.isArray(pref) && pref.length > 0) {
                const index = getIndex(pref);
                const group = groupModel.find(group => group.userIndex === index);
                if (group) {
                    group.savedAttractions = group.savedAttractions.filter(attr => attr !== attraction._id);
                }
                if (groupModel[index].savedAttractions.length === 0) {
                    groupModel.splice(index, 1);
                }
            }
        }
        res.status(200).json("successfully changed save status.");
    } catch (err) {
        res.status(500).json({ error: 'Error updating clicks' });
    }
});

router.get('/getviewed', async (req, res) => {
    const { userId } = req.query;
    console.log(userId, 'get viewed');
    const filter = { 'userId': userId };
    try {
        const reviews = await reviewModel.aggregate([
            { 
                $match: filter 
            },
            {
                $addFields: {
                    att_id: {
                    $toObjectId: "$attractionId"
                    }
                }
            },
            {
                $lookup: {
                    from: "attractions",
                    localField: "att_id",
                    foreignField: "_id",
                    as: "attraction_data"
                }
            },
            { $unwind: "$attraction_data" },
            {
                $group: {
                  _id: null,
                  data: {
                    $push: { k: { $toString: "$attractionId" }, v: "$attraction_data.imageUrl" }
                  }
                }
              },
              {
                $replaceRoot: {
                  newRoot: { $arrayToObject: "$data" }
                }
              }
          ])
        console.log("get reviews successfully.")
        res.json(reviews[0]);
    } catch (error) {
        console.error("Error fetching user by ID:", error);
        res.status(500).json({ error: "Error fetching user by ID." });
    }
});


module.exports = router;