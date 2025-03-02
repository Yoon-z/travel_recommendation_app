import React from 'react';
import './RecommendationCard.css';
import { RiLeafFill } from "react-icons/ri";
import { FaStar } from "react-icons/fa";
import { MdOutlineRateReview } from "react-icons/md";
import { FaHeartCirclePlus } from "react-icons/fa6";
import { useNavigate } from 'react-router-dom';

const RecommendationCard = ({ attraction }) => {
  const {
    title,
    imageUrl,
    avgGreenScore,
    avgLikeScore,
    saveCount,
    reviewCount,
  } = attraction;

const navigate = useNavigate();

const handleCardClick = () => {
  navigate(`/attraction/${attraction.attractionId}`);
};

  return (
    <div className="recommendation-card" onClick={handleCardClick}>
      
      <img src={imageUrl} alt={title} className="card-image" />
      <div className="card-content">
        
        <h2>{title}</h2>

        <div className="card-icons">

          {/* leaf */}
          <div className="icon-group">
            <div className="icon">
              <RiLeafFill size={40} color="green" />
            </div>
            <p>
              <strong>{avgGreenScore.toFixed(1)}</strong>{" "}
            </p>
          </div>
        
        {/* star */}
        <div class="icon-group">
          <div class="icon">
            <FaStar size={40} color="gold" />
          </div>
          <p>
            <strong>{avgLikeScore.toFixed(1)}</strong>{" "}
          </p>
        </div>

        {/* review */}
        <div class="icon-group">
          <div class="icon">
            <MdOutlineRateReview size={40} color="blue" />
          </div>
          <p>
            <strong>Reviews:</strong> {reviewCount}
          </p>
        </div>
        
        {/* heart */}
        <div class="icon-group">
          <div class="icon">
            <FaHeartCirclePlus size={40} color="red" />
          </div>
          <p>
            <strong>Saves:</strong> {saveCount}
          </p>
        </div>

        </div>
        
        
      </div>
    </div>
  );
};

export default RecommendationCard;