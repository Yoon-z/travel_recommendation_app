const express = require('express');
const eventsModel = require("./models/events.js");
const userEventsModel = require("./models/user_events.js");
const userModel = require("./models/user.js");
const router = express.Router();
const multer = require("multer");
const path = require("path");
const fs = require('fs');
require('dotenv').config()


const api_server = process.env.REACT_APP_API_SERVER;

// Configure multer for file uploads
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, 'uploads/events/')
    },
    filename: function (req, file, cb) {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9)
        cb(null, uniqueSuffix + path.extname(file.originalname))
    }
});

// Ensure the uploads directory exists
const uploadDir = path.join(__dirname, 'uploads');
if (!fs.existsSync(uploadDir)) {
    fs.mkdirSync(uploadDir, { recursive: true });
    console.log('Uploads folder created.');
}

// Configure file filter
const fileFilter = (req, file, cb) => {
    // Only accept image files
    if (file.mimetype.startsWith('image/')) {
        cb(null, true);
    } else {
        cb(new Error('Not an image! Please upload an image.'), false);
    }
};

const upload = multer({ 
    storage: storage,
    fileFilter: fileFilter,
    limits: {
        fileSize: 5 * 1024 * 1024 // Limit file size to 5MB
    }
});


router.get('/', async (req, res) => {
    try {
        const events = await eventsModel.find({});
        console.log("Get events successfully.")
        res.json(events);
    } catch (error) {
        console.error(error);
    }
});

router.get('/:id', async (req, res) => {
    const { id } = req.params;
    try {
        const event = await eventsModel.findById(id);
        console.log("Get event successfully.")
        res.json(event);
    } catch (error) {
        console.error(error);
    }
});

router.post("/", upload.single('image'), async (req, res) => {
    try {
        const imageUrl = req.file ? `${api_server}/uploads/events/${req.file.filename}` : null;
        const { user_id, event_name, description, event_time, event_location, carbon_offset_estimation, eco_activities, xp_rewards } = req.body;
        console.log(user_id, event_name, description, event_time, event_location, carbon_offset_estimation, eco_activities, xp_rewards)
        const event = new eventsModel({
            user_id,
            event_name,
            description,
            event_time,
            event_location,
            carbon_offset_estimation,
            eco_activities: JSON.parse(eco_activities), // Parse JSON string
            xp_rewards,
            event_image: imageUrl
        });

        const savedEvent = await event.save();
        res.json({
            message: "Event saved successfully!",
            savedEvent,
        });

    } catch (error) {
        console.error(error);
        res.status(500).json({
            message: "Failed to create event",
            error: error.message
        });
    }
});

router.post('/:id/join', async (req, res) => {
    const { event_id, user_id } = req.body; 
    console.log(event_id, user_id)
    try {
        const event = await eventsModel.findById(event_id);
        if (!event) {
            res.status(404).json({ error: 'Event not found.' });
            return;
        }

        const userEvents = new userEventsModel({
            event_id: event_id,
            user_id: user_id,
            join_time: new Date().toISOString(),
            xp_rewards: event.xp_rewards,
            carbon_offset_estimation: event.carbon_offset_estimation
        });
        const savedUserEvents = await userEvents.save();

        const user = await userModel.findByIdAndUpdate(
            user_id, 
            { $inc: { green_point: event.xp_rewards } },
            { new: true, upsert: false } 
        );

        console.log("Join event successfully.");
        res.json(user);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Failed to join event.' });
    }
});


module.exports = router;
