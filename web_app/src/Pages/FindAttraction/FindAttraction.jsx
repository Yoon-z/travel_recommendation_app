import "./style_pref.css";
import RecommendationCard from "./components/RecommendationCard";
import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import Navigator from "../../Navigation/Navigator";
const api_server = process.env.REACT_APP_API_SERVER;

export default function FindAttraction() {
  const [userId, setUserId] = useState(null);
  const navigate = useNavigate();
  
  //cbr data
  const [cbrResult, setCbrResult] = useState([]);

  //survey
  const [responses, setResponses] = useState({});
  const [additionalAttractions, setAdditionalAttractions] = useState([]);
  const [inputValue, setInputValue] = useState("");

  useEffect(() => {
    fetch(`${api_server}/auth`, {
      credentials: "include",
    }).then((response) => {
      if (response.status === 401) {
        navigate("/login");
        return;
      }
      response.json().then((userInfo) => {
        setUserId(userInfo.id);
      });
    });
  }, []);

  //---------------CBR--------------------
  useEffect(() => {
    if (userId) {
      fetch(
        `${api_server}/cbr?userId=${userId}`,
        {
          credentials: "include",
        }
      )
        .then((res) => {
          if(res.status === 406) {
            alert("Please review at least 3 attractions");
            return;
          }
          res.json().then((res) => {
            console.log(res);
          setCbrResult(res);
          })
        })
        
    }
  }, [userId]);

  const handleChange = (id, value) => {
    setResponses((prev) => ({
      ...prev,
      [id]: value,
    }));
    console.log(responses)
  };

  const handleAdditionalInputChange = (e) => {
    const value = e.target.value;
    setInputValue(value);

    // Split the input by commas and trim whitespace
    const attractions = value
      .split(",")
      .map((attraction) => attraction.trim())
      .filter((attraction) => attraction !== ""); // Remove empty strings
    setAdditionalAttractions(attractions);
  };

  // submit survey to backend
  const handleSubmit = async () => {
    const result = {
      ...responses,
      additionalAttractions,
      additionalAttractionsCount: additionalAttractions.length,
    };

    if ((Object.keys(result).length -2 !== cbrResult.length) || (Object.keys(result).length < 12)) {
      alert("Please review all attractions.");
      return;
    }

    try {
      const response = await fetch(`${api_server}/cbr/save_precision`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(result),
      });

      if (response.ok) {
        alert("Survey results saved successfully!");
        navigate(0);
      } else {
        alert("Failed to save survey results.");
        navigate(0);
      }
    } catch (error) {
      console.error("Error saving survey results:", error);
      alert("An error occurred while saving the survey.");
    }
  };

  return (
    <div>
      <header>
        <Navigator />
      </header>

      <div>
        <h2>Recommendations based on your Reviews:</h2>
        <div className="recommendation-grid">
          {cbrResult.map((item) => (
            <RecommendationCard key={item.attractionId} attraction={item} />
          ))}
        </div>

        <div className="survey">
        <h3>Were the recommendations relevant for you?</h3>
        
        {cbrResult.map((attraction) => (
          <div key={attraction.attractionId} className="survey-item">
            <label>{attraction.title}</label>
            <div>
              <input
                type="radio"
                name={attraction.title}
                value="yes"
                onChange={() => handleChange(attraction.attractionId, 1)}
              />
              Yes
              <input
                type="radio"
                name={attraction.title}
                value="no"
                onChange={() => handleChange(attraction.attractionId, 0)}
              />
              No
            </div>
          </div>
        ))}

      <h5>----------------------------------------------------------------------------------------------------</h5>

      <div className="survey-item" style={{marginBottom: "40px"}}>
          <label htmlFor="additional-attractions">
            Are there attractions you are interested in but were not
            recommended? <br />
            <small>(Separate attractions by a comma)</small>
          </label>
          <textarea
            id="additional-attractions"
            value={inputValue}
            onChange={handleAdditionalInputChange}
            placeholder="Type attractions here, separated by a comma..."
            rows="4"
            style={{ width: "50%" }}
          />
          <p style={{width: "100px"}}>
            <strong>Number of attractions added:</strong>{" "}
            {additionalAttractions.length}
          </p>
        </div>

        <button onClick={handleSubmit}>Submit</button>
      </div>

      </div>
    </div>
  );
}
