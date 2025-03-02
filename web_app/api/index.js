const express = require("express");
const connectDB = require("./db.js");
const cors = require("cors");
const authRoutes = require("./auth.js");
const reviewsRoutes = require('./review.js');
const recomRoutes = require('./recommendation.js');
const attracRoutes = require('./queryAttraction.js');
const prefRoutes = require('./queryPreference.js');
const eventsRoutes = require('./events.js');

const wssRoutes = require('./queryWSS.js');
const cbrRoutes = require('./queryCBR.js');

const cookieParser = require("cookie-parser");
const path = require("path");
require('dotenv').config();

const web_server = process.env.REACT_APP_WEB_SERVER;


const app = express();
app.use(express.json());
app.use(cors({ credentials: true, origin: `${web_server}` })); // web request 3000
app.use(cookieParser());
app.use('/auth', authRoutes);
app.use('/reviews', reviewsRoutes);
app.use('/recommendation', recomRoutes);

//FindAttraction
app.use('/wss', wssRoutes);
app.use('/cbr', cbrRoutes);

app.use('/', attracRoutes);
app.use('/', prefRoutes);
app.use(express.urlencoded({ extended: true }));
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));
app.use('/events', eventsRoutes);
connectDB();


app.listen(4000, () => {
  console.log("app is runing.");
});
