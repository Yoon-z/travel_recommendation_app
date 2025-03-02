import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { handleErrorWTHCate, preloadImages} from './ImageLoad';
import { Typography } from '@mui/material';

const api_server = process.env.REACT_APP_API_SERVER;

export default function TopAttractions() {
  const [top, setTop] = useState(null);
  const [userId, setUserId] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  const [location, setLocation] = useState({ latitude: null, longitude: null });
  const [error, setError] = useState(null);

  const getLocation = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const { latitude, longitude } = position.coords;
          setLocation({ latitude, longitude });
        },
        (err) => {
          setError("Error getting location: " + err.message);
        }
      );
    } else {
      setError("Geolocation is not supported.");
    }
  };

  async function fetchTop() {
    // fetch most saved attractions by user
    await fetch(`${api_server}/mostsaved`)
      .then(response => response.json())
      .then(async res => {
        if (res) {
          setTop(res);
          const allImageUrls = Object.values(res).flat().map(img => img.imageUrl);
          await preloadImages(allImageUrls);
        } else {
          console.error("Clicked most often images are missing in the response.");
        }
      })
      .catch(err => {
        console.error('Error fetching data: ', err);
      }).finally(setIsLoading(false));
  }

  useEffect(() => {
    getLocation();
  }, []);

  useEffect(() => {
    const authenticateUser = async () => {
      try {
        const response = await fetch(`${api_server}/auth`, { credentials: "include" });

        const userInfo = await response.json();
        setUserId(userInfo.id);
        if (!userInfo.id) {
          fetchTop();
          setIsLoading(false);
        }
      } catch (error) {
        console.error('Error during authentication:', error);
      }
    };

    authenticateUser();
  }, []);

  useEffect(() => {
    //if user is logged in, fetch top attraction with WSS
    const fetchTopAttractions = async () => {
      if (location && userId) {
        try {
          const response = await fetch(
            `${api_server}/wss?userlatitude=${location.latitude}&userlongitude=${location.longitude}`,
            { credentials: "include" }
          );
          const result = await response.json();
          setTop(result);
          const allImageUrls = Object.values(result).flat().map(img => img.imageUrl);
          await preloadImages(allImageUrls);
          setIsLoading(false);
        } catch (error) {
          console.error('Error fetching top attractions:', error);
        }
      }
    };

    fetchTopAttractions();
  }, [location, userId]);

  if (isLoading) {
    return <div>Loading...</div>;
  }

  return (
    (top &&
      <>
        <div style={{ display: 'flex', justifyContent: 'center' }}>
          {top && top.map(({ imageUrl, title, city, _id, distance, duration }, index) => (
            <div key={_id} style={{ margin: '10px', width: '230px', textAlign: 'center' }}>
              <Link to={`/attraction/${_id}`} key={_id} style={{
                textDecoration: 'none',
                color: 'black',
              }}>
                <img
                  src={imageUrl}
                  alt={title}
                  style={{ width: '230px', height: '200px' }}
                  onError={(e) => handleErrorWTHCate(e)}
                />
                <Typography 
                    variant="h6" 
                    sx={{ 
                        marginTop: '8px',
                        fontSize: '0.8rem',      // font size
                        fontFamily: 'Poppins, sans-serif',
                        fontWeight: 500,
                        color: '#666666',
                        whiteSpace: 'nowrap',    // white space
                        overflow: 'hidden',      // hidden overflow
                        textOverflow: 'ellipsis' 
                    }}
                >
                    {title.charAt(0).toUpperCase() + title.slice(1) + ', ' + city}
                </Typography>
                {distance !== undefined && (
                    <Typography 
                        sx={{ 
                            marginTop: '1px',
                            fontSize: '0.8rem',
                            fontStyle: 'italic',
                            color: '#666666',
                            fontFamily: 'Poppins, sans-serif'
                        }}
                    >
                        {distance + ", " + duration}
                    </Typography>
                )}
              </Link>
            </div>
          ))}
        </div>
      </>
    )
  );
}
