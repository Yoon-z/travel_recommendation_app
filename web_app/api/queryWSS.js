const express = require("express");
const router = express.Router();
const reviewModel = require("./models/reviews");
const axios = require("axios");

const distance_api =
  "https://maps.googleapis.com/maps/api/distancematrix/json?";
const google_api_key = process.env.GOOGLE_API_KEY;

//use google maps matrix api to get distance between two points
async function getDistance(originLat, originLng, lat, lng) {
  const apiKey = google_api_key;
  const apiUrl = distance_api;

  const destination = lat + "," + lng;
  const origin = originLat + "," + originLng;

  const params = {
    origins: origin,
    destinations: destination, 
    key: apiKey,
  };

  try {
    const response = await axios.get(apiUrl, { params });
    //console.log("Distance Matrix Result:", response.data);
    const distance = response.data.rows[0].elements[0].distance.text;
    const duration = response.data.rows[0].elements[0].duration.text;
    return [distance, duration];
  } catch (error) {
    console.error("Error calling Google API:", error.message);
  }
}

function calculateCompositeScores(attractions) {
  //Normalize the data
  const normalizedAttractions = attractions.map((item) => {
    const { reviewCount, avgGreenScore, avgLikeScore, saveCount, distance } = item;
    return {
      ...item,
      reviewCountNorm: reviewCount, // Normalize later
      avgGreenScoreNorm: avgGreenScore, // Normalize later
      avgLikeScoreNorm: avgLikeScore, // Normalize later
      saveCountNorm: saveCount, // Normalize later
      distanceNorm: parseFloat(distance.split(" ")[0].replace(",", "")), // Convert distance to float
    };
  });

  // Find min and max for each attribute
  const minMax = {
    reviewCount: {
      min: Math.min(...normalizedAttractions.map((i) => i.reviewCount)),
      max: Math.max(...normalizedAttractions.map((i) => i.reviewCount)),
    },
    avgGreenScore: {
      min: Math.min(...normalizedAttractions.map((i) => i.avgGreenScore)),
      max: Math.max(...normalizedAttractions.map((i) => i.avgGreenScore)),
    },
    avgLikeScore: {
      min: Math.min(...normalizedAttractions.map((i) => i.avgLikeScore)),
      max: Math.max(...normalizedAttractions.map((i) => i.avgLikeScore)),
    },
    saveCount: {
      min: Math.min(...normalizedAttractions.map((i) => i.saveCount)),
      max: Math.max(...normalizedAttractions.map((i) => i.saveCount)),
    },
    distanceNorm: {
      min: Math.min(...normalizedAttractions.map((i) => i.distanceNorm)),
      max: Math.max(...normalizedAttractions.map((i) => i.distanceNorm)),
    },
  };

  // Normalize all attributes
  normalizedAttractions.forEach((item) => {
    item.reviewCountNorm =
      (item.reviewCount - minMax.reviewCount.min) /
      (minMax.reviewCount.max - minMax.reviewCount.min);
    item.avgGreenScoreNorm =
      (item.avgGreenScore - minMax.avgGreenScore.min) /
      (minMax.avgGreenScore.max - minMax.avgGreenScore.min);
    item.avgLikeScoreNorm =
      (item.avgLikeScore - minMax.avgLikeScore.min) /
      (minMax.avgLikeScore.max - minMax.avgLikeScore.min);
    item.saveCountNorm =
      (item.saveCount - minMax.saveCount.min) /
      (minMax.saveCount.max - minMax.saveCount.min);
    item.distanceNorm =
      1 -
      (item.distanceNorm - minMax.distanceNorm.min) /
        (minMax.distanceNorm.max - minMax.distanceNorm.min); // Inverse for shorter distance
  });

  // Assign weights
  const weights = {
    avgGreenScore: 0.3,
    avgLikeScore: 0.25,
    distanceNorm: 0.2,
    reviewCount: 0.15,
    saveCount: 0.1,
  };

  // Calculate composite score
  normalizedAttractions.forEach((item) => {
    item.compositeScore =
      weights.avgGreenScore * item.avgGreenScoreNorm +
      weights.avgLikeScore * item.avgLikeScoreNorm +
      weights.distanceNorm * item.distanceNorm +
      weights.reviewCount * item.reviewCountNorm +
      weights.saveCount * item.saveCountNorm;
  });

  // Rank the objects by composite score
  const rankedAttractions = normalizedAttractions.sort(
    (a, b) => b.compositeScore - a.compositeScore
  );

  return rankedAttractions;
}

//endpoint to get top 5 attractions based on average green score, average like score, review count, save count
router.get("/", async (req, res) => {
  const { userlatitude, userlongitude } = req.query;
  console.log({ userlatitude, userlongitude });

  if (!userlatitude || !userlongitude) {
    return res
      .status(400)
      .json({ error: "Latitude and longitude are required." });
  }
  console.log(
    `Received location: Latitude=${userlatitude}, Longitude=${userlongitude}`
  );

  try {
    const pipeline = [
      //Group by attractionId and count reviews
      {
        $group: {
          _id: "$attractionId",
          reviewCount: {
            $sum: 1,
          },
          avgGreenScore: {
            $avg: "$green_score",
          },
          avgLikeScore: {
            $avg: "$like_score",
          },
        },
      },
      //Sort by reviewCount, then avgGreenScore, then avgLikeScore
      {
        $sort: {
          reviewCount: -1,
          avgGreenScore: -1,
          avgLikeScore: -1,
        },
      },
      //Join with the attractions collection
      {
        $addFields: {
          att_id: {
            $toObjectId: "$_id",
          },
        },
      },
      {
        $lookup: {
          from: "attractions",
          localField: "att_id",
          foreignField: "_id",
          as: "attractionDetails",
        },
      },
      {
        $unwind: {
          path: "$attractionDetails",
          preserveNullAndEmptyArrays: false // Exclude attractions without details
        }
      },
      //Merge with saveCount, latitude and longitude from attractions and re-sort
      {
        $addFields: {
          saveCount: "$attractionDetails.saveCount",
          latitude: "$attractionDetails.location/lat",
          longitude: "$attractionDetails.location/lng",
        },
      },
      {
        $sort: {
          reviewCount: -1,
          avgGreenScore: -1,
          avgLikeScore: -1,
          saveCount: -1,
        },
      },
      //Limit to the top 5 documents
      {
        $limit: 5,
      },
      //Project the fields you want to return
      {
        $project: {
          _id: "$_id",
          reviewCount: 1,
          avgGreenScore: 1,
          avgLikeScore: 1,
          saveCount: 1,
          title: "$attractionDetails.title",
          // Assuming name field exists
          imageUrl: "$attractionDetails.imageUrl",
          city: "$attractionDetails.city",
          latitude: 1,
          longitude: 1,
        },
      },
    ];

    const result = await reviewModel.aggregate(pipeline);
    // console.log("1111", result);

    // Get distance and duration from user location
    for (const attr of result) {
      const info = await getDistance(
        userlatitude,
        userlongitude,
        attr.latitude,
        attr.longitude
      );
      // console.log("22222", info);
      attr.distance = info[0];
      attr.duration = info[1];
    }

    // Calculate composite scores also considering distance, then return the top 5
    const composeRes = calculateCompositeScores(result);
    // console.log("333333", composeRes);

    const finalRes = result.map( a => ({
      _id: a._id,
      title: a.title,
      city: a.city,
      imageUrl: a.imageUrl,
      distance: a.distance,
      duration: a.duration,
    }))

    //console.log("4444444", finalRes);
    return res.json(finalRes);

  } catch (error) {
    console.error("Error fetching data:", error);
  }
});

module.exports = router;
