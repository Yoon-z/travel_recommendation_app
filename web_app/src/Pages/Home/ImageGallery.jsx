import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import TopAttractions from './TopAttractions';
import YML from './YouMightLike';
import { handleError, preloadImages} from './ImageLoad';
import { Typography, Box, Grid, CircularProgress } from '@mui/material';

const api_server = process.env.REACT_APP_API_SERVER;

async function fetchData(setCategories, setIsLoading, userId) {
    let url = `${api_server}/attractions`;
    if (userId) {
        url += `?userId=${encodeURIComponent(userId)}`;
    }
    try {
        const response = await fetch(url);
        const res = await response.json();

        if (res && res.imagesByCategory) {
            setCategories(res.imagesByCategory);
            const allImageUrls = Object.values(res.imagesByCategory).flat().map(img => img.imageUrl);
            await preloadImages(allImageUrls);
        } else {
            console.error("Categories are missing in the response.");
        }
    } catch (err) {
        console.error('Error fetching data: ', err);
    } finally {
        setIsLoading(false);
    }
}

const ImageGallery = () => {
    const [categories, setCategories] = useState({});
    const [isLoading, setIsLoading] = useState(true);
    const [userId, setUserId] = useState(null);

    useEffect(() => {
        fetch(`${api_server}/auth`, {
            credentials: 'include',
        }).then(response => {
            response.json().then(userInfo => {
                setUserId(userInfo.id);
                fetchData(setCategories, setIsLoading, userInfo.id);
            });
        });
    }, []);

    if (isLoading) {
        return (
            <Box 
                sx={{ 
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    justifyContent: 'center',
                    minHeight: '60vh',
                    gap: 2
                }}
            >
                <CircularProgress 
                    size={40}
                    sx={{ 
                        color: '#3c8c6c'
                    }} 
                />
                <Typography 
                    variant="h6"
                    sx={{ 
                        color: '#666',
                        fontFamily: 'Poppins, sans-serif',
                        fontWeight: 500
                    }}
                >
                    Loading amazing places...
                </Typography>
            </Box>
        );
    }

    return (
        <div className="gallery">
            <Typography 
                variant="h5" 
                sx={{ 
                    mb: 3,
                    mt: 8,
                    color: '#3c8c6c',
                    fontFamily: 'Poppins, sans-serif',
                    fontWeight: 600,
                    textAlign: 'center',
                    fontSize: '1.5rem'
                }}
            >
                Top Attractions
            </Typography>
            <TopAttractions />

            {userId && (
                <Box sx={{ mb: 6 }}>
                    <Typography 
                        variant="h5" 
                        sx={{ 
                            mb: 3,
                            mt: 6,
                            color: '#3c8c6c',
                            fontFamily: 'Poppins, sans-serif',
                            fontWeight: 600,
                            textAlign: 'center',
                            fontSize: '1.5rem'
                        }}
                    >
                        You Might Like
                    </Typography>
                    <YML userId={userId} />
                </Box>
            )}

            {Object.keys(categories).map(category => (
                <div key={category}>
                    <Typography 
                        variant="h5" 
                        sx={{ 
                            mb: 3,
                            mt: 6, 
                            color: '#3c8c6c',
                            fontFamily: 'Poppins, sans-serif',
                            fontWeight: 600,
                            textAlign: 'center',
                            fontSize: '1.5rem'
                        }}
                    >
                        {category.charAt(0).toUpperCase() + category.slice(1)}
                    </Typography>
                    <div style={{ display: 'flex', justifyContent: 'center' }}>
                        {categories[category].map(({ imageUrl, title, city, _id }, index) => (
                            <div key={_id} style={{ margin: '10px', width: '230px', textAlign: 'center' }}>
                                <Link to={`/attraction/${_id}`} style={{
                                    textDecoration: 'none',
                                    color: '#3c8c6c',
                                }}>
                                    <img
                                        src={imageUrl}
                                        alt=''
                                        style={{ width: '230px', height: '200px' }}
                                        onError={(e) => handleError(e, category)}
                                    />
                                    <Typography 
                                        variant="h6" 
                                        sx={{ 
                                            marginTop: '8px',
                                            fontSize: '0.8rem',
                                            fontFamily: 'Poppins, sans-serif',
                                            fontWeight: 500,
                                            color: '#666666',
                                            whiteSpace: 'nowrap',
                                            overflow: 'hidden',
                                            textOverflow: 'ellipsis'
                                        }}
                                    >
                                        {title.charAt(0).toUpperCase() + title.slice(1) + ', ' + city}
                                    </Typography>
                                </Link>
                            </div>
                        ))}
                    </div>
                </div>
            ))}
        </div>
    );
};

export default ImageGallery;
