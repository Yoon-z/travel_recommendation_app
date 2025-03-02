import './attraction.css'
import React, { useState, useEffect, useRef } from 'react';
import Navigator from '../../Navigation/Navigator';
import Review from './Review';
import { useParams } from 'react-router-dom';
import arrow from '../../images/arrow.png'
import { AiOutlineHeart, AiFillHeart } from "react-icons/ai";
import { Rating } from 'react-simple-star-rating';
import { Box, Container, Typography, Paper, Grid, IconButton } from '@mui/material';
import { styled } from '@mui/material/styles';
import Footer from '../../components/Footer/Footer';

const api_server = process.env.REACT_APP_API_SERVER;

const StyledPaper = styled(Paper)(({ theme }) => ({
  borderRadius: 8,
  border: '1px solid #e0e0e0',
  backgroundColor: '#fff',
  '& .MuiTypography-root': {
    fontFamily: 'Poppins, sans-serif'
  }
}));

const StyledTypography = styled(Typography)({
  fontFamily: 'Poppins, sans-serif'
});

const ImageContainer = styled(Box)({
  position: 'relative'
});

async function fetchData(id, setAttraction, setImageUrls, setIsLoading, setLikeCount, setGreen, setLike) {
    fetch(`${api_server}/attraction/${id}`, {})
        .then(response => response.json())
        .then(res => {
            if (res) {
                setAttraction(res);
                if (res.saveCount) {
                    setLikeCount(res.saveCount);
                }
                setImageUrls((prevUrls) => [...prevUrls, res.imageUrl]);
            } else {
                console.error("Can't get attraction by Id.");
            }
            setIsLoading(false);
        })
        .catch(err => {
            console.error('Error fetching data: ', err);
            setIsLoading(false);
        });

    fetch(`${api_server}/reviews/images/${id}`, {})
        .then(res => res.json())
        .then(res => {
            if (res) {
                const validUrls = res.filter(url => url !== null && url !== undefined);

                if (validUrls.length > 0) {
                    setImageUrls((prevUrls) => [...prevUrls, ...validUrls]);
                } else {
                    console.error('No valid image URLs found.');
                }
            }
        })
        .catch(err => {
            console.error('Error fetching data: ', err);
        }
        )

    fetch(`${api_server}/reviews/score/${id}`, {})
        .then(res => res.json())
        .then(res => {
            if (res) {
                setGreen(res.green);
                setLike(res.like);
            } else {
                console.error('Can\'t get images from reviews.')
            }
        })
        .catch(err => {
            console.error('Error fetching data: ', err);
        }
        )
}

const Attraction = () => {
    const { id } = useParams();
    const [attraction, setAttraction] = useState({});
    const [isLoading, setIsLoading] = useState(true);
    const [imageUrls, setImageUrls] = useState([]);
    const [imageNum, setImageNum] = useState(0);
    const [liked, setLiked] = useState(false);
    const [userId, setUserId] = useState(null);
    const [green, setGreen] = useState(0);
    const [like, setLike] = useState(0);
    const [likeCount, setLikeCount] = useState(0);
    const [contentHeight, setContentHeight] = useState('450px');
    const imageRef = useRef(null);

    useEffect(() => {
        // Fetch authentication status
        fetch(`${api_server}/auth`, {
            credentials: 'include',
        }).then(response => {
            response.json().then(userInfo => {
                if (userInfo && userInfo.id) {
                    setUserId(userInfo.id);
                    // If the user is logged in, check if they have liked the attraction
                    let url = `${api_server}/reviews/ifsaved?userId=${encodeURIComponent(userInfo.id)}&attractionId=${encodeURIComponent(id)}`;
                    fetch(url)
                        .then(res => res.json())
                        .then(res => {
                            setLiked(res);
                        })
                        .catch(err => {
                            console.error('Error fetching like status: ', err);
                        });
                } else {
                    setLiked(false);  // If no user is logged in, set liked to false
                }
            }).catch(err => {
                console.error('Error fetching user info: ', err);
            });
        });

        // Fetch attraction details and images
        console.log("attraction_id: " + id);
        fetchData(id, setAttraction, setImageUrls, setIsLoading, setLikeCount, setGreen, setLike);
    }, [id]);

    // Listen for the height of the image after it loads
    useEffect(() => {
        if (imageRef.current) {
            const updateHeight = () => {
                const height = imageRef.current.offsetHeight;
                setContentHeight(`${height}px`);
            };

            // Initial update
            updateHeight();
            
            // Listen for window size changes
            window.addEventListener('resize', updateHeight);
            
            return () => window.removeEventListener('resize', updateHeight);
        }
    }, [imageUrls, imageNum]);

    const handleNext = () => {
        if ((imageNum + 1) === imageUrls.length) {
            setImageNum(0);
        } else {
            setImageNum(imageNum + 1);
        }
    }

    async function changeLike(liked) {
        console.log(liked);
        // Send updated like status to the backend
        try {
            await fetch(`${api_server}/reviews/likechange`, {
                method: 'POST',
                body: JSON.stringify({ id, userId, liked }),
                headers: { 'Content-Type': 'application/json' },
            });
            console.log("Like status changed.");
        } catch (err) {
            console.error('Error changing like status: ', err);
        }
    }

    const handleLike = () => {
        if (!userId) {
            alert("Please log in first.");
            return;
        }

        // Toggle the like status and adjust like count
        const l = !liked;
        const lc = likeCount + (l ? 1 : -1);
        setLiked(l);
        setLikeCount(lc);

        changeLike(l);
    };

    if (isLoading) {
        return <div>Loading...</div>;
    }

    return (
        <>
            <Navigator />
            <Box sx={{ bgcolor: '#fff', minHeight: 'calc(100vh - 92px)' }}>
                <Container 
                    maxWidth={false}
                    sx={{ 
                        py: 3,
                        px: { xs: 1, sm: 2, md: 3 },
                        maxWidth: '2400px',
                        margin: '0 auto',
                        width: '98%'
                    }}
                >
                    <Grid container spacing={3} sx={{ mb: 3 }}>
                        {/* Left-side image */}
                        <Grid item xs={12} md={8} lg={8}>
                            <ImageContainer>
                                <img
                                    ref={imageRef}
                                    src={imageUrls[imageNum]}
                                    alt={attraction.title}
                                    style={{ 
                                        width: '100%',
                                        height: '450px',  // Restore fixed height
                                        objectFit: 'cover',
                                        borderRadius: '8px'
                                    }}
                                />
                            </ImageContainer>
                        </Grid>
    
                        {/* Right-side information */}
                        <Grid item xs={12} md={4} lg={4}>
                            <StyledPaper 
                                elevation={0} 
                                sx={{ 
                                    height: '405px',
                                    display: 'flex',
                                    flexDirection: 'column',
                                    p: 3,
                                }}
                            >
                                {/* Title and Like button */}
                                <Box sx={{ mb: 2 }}>
                                    <StyledTypography 
                                        variant="h5" 
                                        sx={{ 
                                            fontWeight: 600,
                                            color: '#3c8c6c',
                                            mb: 1.5
                                        }}
                                    >
                                        {attraction.title ? attraction.title.charAt(0).toUpperCase() + attraction.title.slice(1) : "Unknown title"}
                                    </StyledTypography>
                                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                        <IconButton 
                                            onClick={handleLike}
                                            sx={{ 
                                                padding: '8px',  // Reduce padding
                                                borderRadius: '50%',  // Keep circular shape
                                                width: '40px',  // Fixed width
                                                height: '40px',  // Fixed height
                                                '&:hover': { 
                                                    backgroundColor: 'rgba(233, 30, 99, 0.08)'  // Softer hover effect
                                                }
                                            }}
                                        >
                                            {liked ? (
                                                <AiFillHeart style={{ 
                                                    color: "#e91e63", 
                                                    fontSize: "24px",
                                                    display: 'block'  // Ensure icon is centered
                                                }} />
                                            ) : (
                                                <AiOutlineHeart style={{ 
                                                    color: "#666", 
                                                    fontSize: "24px",
                                                    display: 'block'  // Ensure icon is centered
                                                }} />
                                            )}
                                        </IconButton>
                                        <StyledTypography sx={{ 
                                            color: '#666',
                                            fontSize: '0.9rem'  // Slightly smaller font size
                                        }}>
                                            {likeCount} people saved this
                                        </StyledTypography>
                                    </Box>
                                </Box>
    
                                {/* Rating section */}
                                <Box sx={{ mb: 2 }}>
                                    {/* Overall Rating */}
                                    <Box sx={{ mb: 3 }}>
                                        <StyledTypography 
                                            sx={{ 
                                                color: '#666', 
                                                mb: 1, 
                                                fontWeight: 500,
                                                textAlign: 'left'
                                            }}
                                        >
                                            Overall Rating
                                        </StyledTypography>
                                        <Box sx={{ 
                                            display: 'flex', 
                                            alignItems: 'center', 
                                            gap: 1,
                                            justifyContent: 'flex-start'
                                        }}>
                                            <Rating
                                                readonly={true}
                                                initialValue={like || 0}
                                                size={20}
                                                allowFraction={true}
                                            />
                                            <StyledTypography sx={{ color: '#666', fontSize: '0.9rem' }}>
                                                ({(like || 0).toFixed(1)})
                                            </StyledTypography>
                                        </Box>
                                    </Box>
    
                                    {/* Sustainability */}
                                    <Box>
                                        <StyledTypography 
                                            sx={{ 
                                                color: '#666', 
                                                mb: 1, 
                                                fontWeight: 500,
                                                textAlign: 'left'
                                            }}
                                        >
                                            Sustainability
                                        </StyledTypography>
                                        <Box sx={{ 
                                            display: 'flex', 
                                            alignItems: 'center', 
                                            gap: 1,
                                            justifyContent: 'flex-start'
                                        }}>
                                            <Rating
                                                readonly={true}
                                                fillColor="#4caf50"
                                                initialValue={green || 0}
                                                size={20}
                                                allowFraction={true}
                                            />
                                            <StyledTypography sx={{ color: '#666', fontSize: '0.9rem' }}>
                                                ({(green || 0).toFixed(1)})
                                            </StyledTypography>
                                        </Box>
                                    </Box>
                                </Box>
    
                                {/* Location information */}
                                <Box sx={{ mb: 2 }}>
                                    <StyledTypography 
                                        sx={{ 
                                            color: '#666',
                                            fontWeight: 500,
                                            mb: 1,
                                            textAlign: 'left'  // Added left alignment
                                        }}
                                    >
                                        Location
                                    </StyledTypography>
                                    <StyledTypography 
                                        sx={{ 
                                            color: '#666',
                                            fontSize: '0.95rem',
                                            lineHeight: 1.5,
                                            textAlign: 'left'  // Added left alignment
                                        }}
                                    >
                                        {attraction.city ? attraction.city.charAt(0).toUpperCase() + attraction.city.slice(1) : "Unknown city"}
                                        {attraction.address && (
                                            <>
                                                <br />
                                                {attraction.address}
                                            </>
                                        )}
                                    </StyledTypography>
                                </Box>
    
                                {/* Description information */}
                                {attraction.description && (
                                    <Box>
                                        <StyledTypography 
                                            sx={{ 
                                                color: '#666',
                                                fontWeight: 500,
                                                mb: 1
                                            }}
                                        >
                                            About
                                        </StyledTypography>
                                        <StyledTypography 
                                            sx={{ 
                                                color: '#666',
                                                fontSize: '0.95rem',
                                                lineHeight: 1.6
                                            }}
                                        >
                                            {attraction.description}
                                        </StyledTypography>
                                    </Box>
                                )}
                            </StyledPaper>
                        </Grid>
                    </Grid>
    
                    {/* Review section - Directly use the Review component without wrapping it in StyledPaper */}
                    <Review id={id} />
                </Container>
                <Footer />
            </Box>
        </>
    );
    
};

export default Attraction;
