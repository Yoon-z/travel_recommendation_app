const fs = require("fs");

function calculateMetrics() {
  const data = fs.readFileSync("survey_results.json", "utf8");
  const surveyJson = JSON.parse(data);
  // console.log(surveyJson);

  let totalPrecision = 0;
  let totalRecall = 0;

  let results = surveyJson.map((entry) => {
    const totalIds = 10;
    const relevantIds = Object.values(entry).filter(
      (value) => typeof value === "number" && value === 1
    ).length;
    const additionalAttractionsCount = entry.additionalAttractionsCount || 0;

    const precision = relevantIds / totalIds;
    const recall = relevantIds / (relevantIds + additionalAttractionsCount);

    totalPrecision += precision;
    totalRecall += recall;

    return {
      precision: precision.toFixed(2),
      recall: recall.toFixed(2),
    };
  });

  let averagePrecision = totalPrecision / surveyJson.length;
  let averageRecall = totalRecall / surveyJson.length;
  let f1Score = (2 * averagePrecision * averageRecall) / (averagePrecision + averageRecall);

  return { results, averagePrecision, averageRecall, f1Score };
}

console.log(calculateMetrics());
