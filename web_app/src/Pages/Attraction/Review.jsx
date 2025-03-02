import React, { useState, useEffect } from "react";
import { Rating } from 'react-simple-star-rating';
import { useNavigate } from "react-router-dom";
import './review.css';

function Review({ id }) {
  const [comment, setComment] = useState("");
  const [like_score, setlike_score] = useState(null);
  const [green_score, setgreen_score] = useState(null);
  const [image, setImage] = useState(null);
  const [username, setUsername] = useState(null);
  const [userId, setUserId] = useState(null)
  const [review, setReview] = useState(null);
  const [imagepreview, setimagepreview] = useState("");
  const navigate = useNavigate();

  if (!id) {
    navigate("/");
    console.error("id is missing");
  }

  const api_server = process.env.REACT_APP_API_SERVER;

  const fetchReview = async () => {
    try {
      const response = await fetch(`${api_server}/reviews/getreviews/${id}`);
      const res = await response.json();
      if (res) {
        setReview(res);
      } else {
        console.error("Can't get reviews.");
      }
    } catch (err) {
      console.error('Error fetching data: ', err);
    }
  };

  useEffect(() => {
    clear();
    fetch(`${api_server}/auth`, {
      credentials: 'include',
    }).then(response => {
      response.json().then(userInfo => {
        setUsername(userInfo.username);
        setUserId(userInfo.id);
      });
    });
    
    fetchReview();
  }, []);

  const handleCommentChange = (e) => {
    setComment(e.target.value);
  };

  const handlelikescore = (rate) => {
    setlike_score(rate);
  };

  const handlegreenscore = (rate) => {
    setgreen_score(rate);
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setimagepreview(URL.createObjectURL(file));
      setImage(file);
    }
  };

  function clear() {
    setComment("");
    setlike_score(null);
    setgreen_score(null);
    setImage(null);
  }

  async function submit() {
    const formData = new FormData();
    formData.append("id", id);
    formData.append("userId", userId);
    formData.append("username", username);
    formData.append("like_score", like_score);
    formData.append("green_score", green_score);
    formData.append("comment", comment);
    if (image) {
      formData.append("image", image);
    }
    try {
      const response = await fetch(`${api_server}/reviews/submitreview`, {
        method: 'POST',
        body: formData,
      });

      if (response.status === 200) {
        console.log('Added reviews successfully.');
      } else {
        console.log('Failed to add reviews.');
      }
    } catch (error) {
      console.error('Error during fetch:', error);
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!username) {
      alert("Please logged in at first.");
      clear();
      return;
    }

    if (!comment.trim() || green_score === null || like_score === null) {
      alert("Please provide a comment and a score between 1 and 5.");
      return;
    }

    await submit();
    clear();
    
    fetchReview();
  };

  return (
    <div className="review-container">
      {/* Left Section: Write a Review */}
      <div className="review-form">
        <h2>Write a Review</h2>
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label htmlFor="comment">Comment:</label>
            <textarea
              id="comment"
              value={comment}
              onChange={handleCommentChange}
              rows="4"
              maxLength="250"
            />
          </div>
          <div className="form-group">
            <h4> How would you rate your experience? </h4>
            <Rating
              fillColor="yellow"
              transition
              onClick={handlelikescore}
              size={25}
            />
          </div>
          <div className="form-group">
            <h4> How environmentally friendly was the attraction? </h4>
            <Rating
              fillColor="green"
              transition
              onClick={handlegreenscore}
              size={25}
            />
          </div>
          <div className="form-group">
            <label htmlFor="imageUpload">Upload Image:</label>
            <input
              type="file"
              id="imageUpload"
              onChange={handleImageChange}
              accept="image/*"
            />
            {imagepreview && <img src={imagepreview} alt="Preview" className="image-preview" />}
          </div>
          <button type="submit" className="submit-button">
            Submit
          </button>
        </form>
      </div>

      {/* Right Section: User Reviews */}
      <div className="user-reviews">
        <h2>User Reviews</h2>
        <div className="reviews-container">
          {!review || review.length === 0 ? (
            <h5 style={{ 
                fontFamily: 'Poppins, sans-serif',
                color: '#666',
                fontWeight: 500,
                fontSize: '0.95rem'
            }}>
                No reviews yet.
            </h5>
          ) : (
            <div className="show_review">
              {Array.isArray(review) ? (
                review
                  .sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt))
                  .map(({ userName, like_score, green_score, review: comment, imageUrl }, index) => (
                    <div key={index} className="review-item" style={{ textAlign: "left" }}>
                      <h5>User: {userName}</h5>
                      <h5>Comment: {comment}</h5>
                      <h5>
                        Like Score:
                        <Rating readonly={true} fillColor="yellow" initialValue={like_score} size={20} />
                      </h5>
                      <h5>
                        Green Score:
                        <Rating readonly={true} fillColor="green" initialValue={green_score} size={20} />
                      </h5>
                      {imageUrl && <img src={imageUrl} alt="User submitted" className="submitted-image" />}
                    </div>
                  ))
              ) : (
                <h5 style={{ 
                  fontFamily: 'Poppins, sans-serif',
                  color: '#666',
                  fontWeight: 500,
                  fontSize: '0.95rem'
                }}>
                  Error loading reviews.
                </h5>
              )}
            </div>
          )}
        </div>
      </div>

    </div>
  );
}

export default Review;
