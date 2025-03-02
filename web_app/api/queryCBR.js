const express = require("express");
const router = express.Router();
const reviewModel = require("./models/reviews");
const fs = require("fs");

const weights = {
  avgGreenScore: 0.3,
  avgLikeScore: 0.25,
  latitude: 0.1,
  longitude: 0.1,
  reviewCount: 0.15,
  saveCount: 0.1,
};

// Add saveCount field to each object in an array if it doesn't exist
function addSaveCountIfMissing(objArr) {
  if(!Array.isArray(objArr)) {
      throw new Error("Input must be an array of objects.");
  }

  objArr.forEach(obj => {
      if (typeof obj === 'object' && obj !== null) {
          // Add the saveCount field if it doesn't exist
          if (!obj.hasOwnProperty('saveCount')) {
              obj.saveCount = 0;
          }
      } else {
          throw new Error("Array must contain only objects.");
      }
  })

  return objArr;
}

// Helper function to calculate cosine similarity between two vectors
function cosineSimilarity(vectorA, vectorB) {
  const dotProduct = vectorA.reduce((sum, val, i) => sum + val * vectorB[i], 0);
  const magnitudeA = Math.sqrt(vectorA.reduce((sum, val) => sum + val ** 2, 0));
  const magnitudeB = Math.sqrt(vectorB.reduce((sum, val) => sum + val ** 2, 0));
  return dotProduct / (magnitudeA * magnitudeB || 1);
}

// Helper function to normalize an array of values
function normalize(values) {
  const min = Math.min(...values);
  const max = Math.max(...values);
  return values.map((val) => (val - min) / (max - min || 1)); // Avoid division by zero
}

function createUserProfile(pastAttractions, weights) {
  // Normalize features across past attractions
  const reviewCounts = normalize(pastAttractions.map((a) => a.reviewCount));
  const avgGreenScores = normalize(pastAttractions.map((a) => a.avgGreenScore));
  const avgLikeScores = normalize(pastAttractions.map((a) => a.avgLikeScore));
  const saveCounts = normalize(pastAttractions.map((a) => a.saveCount));
  const latitudes = normalize(pastAttractions.map((a) => a.latitude));
  const longitudes = normalize(pastAttractions.map((a) => a.longitude));

  // Weighted average for user profile
  const userProfile = [
    weights.avgGreenScore * avgGreenScores.reduce((a, b) => a + b, 0) / avgGreenScores.length,
    weights.avgLikeScore * avgLikeScores.reduce((a, b) => a + b, 0) / avgLikeScores.length,
    weights.latitude * latitudes.reduce((a, b) => a + b, 0) / latitudes.length,
    weights.longitude * longitudes.reduce((a, b) => a + b, 0) / longitudes.length,
    weights.reviewCount * reviewCounts.reduce((a, b) => a + b, 0) / reviewCounts.length,
    weights.saveCount * saveCounts.reduce((a, b) => a + b, 0) / saveCounts.length,
  ];

  return userProfile;
}

function recommendAttractions(pastAttractions, candidateAttractions, weights) {

  pastAttractions = addSaveCountIfMissing(pastAttractions);
  candidateAttractions = addSaveCountIfMissing(candidateAttractions);

  // Create user profile
  const userProfile = createUserProfile(pastAttractions, weights);
  // console.log("This is the user Profile", userProfile);

  // Normalize features across candidate attractions
  const reviewCounts = normalize(candidateAttractions.map((a) => a.reviewCount));
  const avgGreenScores = normalize(candidateAttractions.map((a) => a.avgGreenScore));
  const avgLikeScores = normalize(candidateAttractions.map((a) => a.avgLikeScore));
  const saveCounts = normalize(candidateAttractions.map((a) => a.saveCount));
  const latitudes = normalize(candidateAttractions.map((a) => a.latitude));
  const longitudes = normalize(candidateAttractions.map((a) => a.longitude));

  // Calculate similarity for each candidate attraction
  const recommendations = candidateAttractions.map((attraction, index) => {
    // const candidateVector = [
    //   weights.avgGreenScore * avgGreenScores[index],
    //   weights.avgLikeScore * avgLikeScores[index],
    //   weights.latitude * latitudes[index],
    //   weights.longitude * longitudes[index],
    //   weights.reviewCount * reviewCounts[index],
    //   weights.saveCount * saveCounts[index],
    // ];
    const candidateVector = [
      avgGreenScores[index],
      avgLikeScores[index],
      latitudes[index],
      longitudes[index],
      reviewCounts[index],
      saveCounts[index],
    ];

    // console.log("This candidate vector", candidateVector);
      
    return {
      ...attraction,
      similarity: cosineSimilarity(userProfile, candidateVector),
    };
  });

  // Rank recommendations by similarity and return the first 10 attraction
  return recommendations.sort((a, b) => b.similarity - a.similarity).slice(0,10);
  
}

//endpoint for item-based filtering based on past reviews
router.get("/", async (req, res) => {
    const { userId } = req.query;

    try {
        if (!userId) {
            return res.status(400).json({ error: 'userId query parameter is required' });
        }

        // Pipeline to get past attractions
        const pipeline_past = [
            //Group by attractionId and count reviews
            {
              $group: {
                _id: "$attractionId",
                reviewCount: {
                  $sum: 1
                },
                avgGreenScore: {
                  $avg: "$green_score"
                },
                avgLikeScore: {
                  $avg: "$like_score"
                }
              }
            },
            //Join with the attractions collection
            {
              $addFields: {
                att_id: {
                  $toObjectId: "$_id"
                }
              }
            },
            {
              $lookup: {
                from: "attractions",
                localField: "att_id",
                foreignField: "_id",
                as: "attractionDetails"
              }
            },
            {
              $unwind: {
                path: "$attractionDetails",
                preserveNullAndEmptyArrays: false // Exclude attractions without details
              }
            },
            //Merge with saveCount, latitude and longitude
            //from attractions and re-sort
            {
              $addFields: {
                saveCount: "$attractionDetails.saveCount",
                latitude: "$attractionDetails.location/lat",
                longitude: "$attractionDetails.location/lng"
              }
            },
            //Second Merge with reviews collection but filter by userId
            {
              $lookup: {
                from: "reviews",
                let: {
                  attractionId: "$_id"
                },
                pipeline: [
                  {
                    $match: {
                      $expr: {
                        $eq: [
                          "$attractionId",
                          "$$attractionId"
                        ]
                      }
                    }
                  },
                  // Match attractionId
                  {
                    $match: {
                      userId: userId
                    }
                  },
                  // Filter by userId
                  {
                    $limit: 1
                  } // Only one review per user per attraction
                ],
                as: "userReviews"
              }
            },
            {
              $match: {
                userReviews: {
                  $ne: []
                } // Only include attractions with reviews from the specific user
              }
            },
            //Project the fields to return
            {
              $project: {
                _id: 0,
                attractionId: "$_id",
                reviewCount: 1,
                avgGreenScore: 1,
                avgLikeScore: 1,
                saveCount: 1,
                title: "$attractionDetails.title",
                imageUrl: "$attractionDetails.imageUrl",
                latitude: 1,
                longitude: 1,
                userId: "$userReviews.userId"
              }
            },
            {
              $unwind: "$userId"
            }
          ];

        const pastAttractions = await reviewModel.aggregate(pipeline_past);
        console.log("--------------------------Past Attraction--------------------------");
        // console.log(pastAttractions);

        // user must have reviewed at least 3 attractions
        if(pastAttractions.length <3) {
          res.status(406).send()
        }

        // Pipeline to get candidate attractions
        const pipeline_candidate = [
            //Group by attractionId and count reviews
            {
              $group: {
                _id: "$attractionId",
                reviewCount: {
                  $sum: 1
                },
                avgGreenScore: {
                  $avg: "$green_score"
                },
                avgLikeScore: {
                  $avg: "$like_score"
                }
              }
            },
            //Join with the attractions collection
            {
              $addFields: {
                att_id: {
                  $toObjectId: "$_id"
                }
              }
            },
            {
              $lookup: {
                from: "attractions",
                localField: "att_id",
                foreignField: "_id",
                as: "attractionDetails"
              }
            },
            {
              $unwind: {
                path: "$attractionDetails",
                preserveNullAndEmptyArrays: false // Exclude attractions without details
              }
            },
            //Merge with saveCount, latitude and longitude
            //from attractions and re-sort
            {
              $addFields: {
                saveCount: "$attractionDetails.saveCount",
                latitude: "$attractionDetails.location/lat",
                longitude: "$attractionDetails.location/lng"
              }
            },
            //Second Merge with reviews collection but filter by userId
            {
              $lookup: {
                from: "reviews",
                let: {
                  attractionId: "$_id"
                },
                pipeline: [
                  {
                    $match: {
                      $expr: {
                        $eq: [
                          "$attractionId",
                          "$$attractionId"
                        ]
                      }
                    }
                  },
                  // Match attractionId
                  {
                    $match: {
                      userId: userId
                    }
                  },
                  // Filter by userId
                  {
                    $limit: 1
                  } // Only one review per user per attraction
                ],
                as: "userReviews"
              }
            },
            {
              $match: {
                userReviews: {
                  $eq: []
                }
              }
            },
            // {$limit: 50},
            //Project the fields to return
            {
              $project: {
                _id: 0,
                attractionId: "$_id",
                reviewCount: 1,
                avgGreenScore: 1,
                avgLikeScore: 1,
                saveCount: 1,
                title: "$attractionDetails.title",
                imageUrl: "$attractionDetails.imageUrl",
                latitude: 1,
                longitude: 1,
              }
            }
          ];

        const candidateAttractions = await reviewModel.aggregate(pipeline_candidate);
        console.log("++++++++++++++++++++++++++++++++++CANDIDATE+++++++++++++++++++++++++++++++++++")
        // console.log(candidateAttractions);

        const result = recommendAttractions(pastAttractions, candidateAttractions, weights);
        console.log(result);

        res.status(200).json(result);
    } catch (error) {
        console.error('Error fetching reviews:', error);
    }
})

//endpoint to save user survey results to txt file
router.post("/save_precision", async (req, res) => {
  const surveyResults = req.body;

  fs.appendFile("survey_results.txt", JSON.stringify(surveyResults, null, 2) + "\n", (err) => {
    if (err) {
      console.error("Error saving survey results:", err);
      res.status(500).send("Failed to save survey results.");
    } else {
      console.log(surveyResults)
      res.send("Survey results saved successfully!");
    }
  });

})

module.exports = router;