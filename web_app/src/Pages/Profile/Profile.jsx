import React, { useState, useEffect } from 'react';
import {
  Container,
  Paper,
  Grid,
  Avatar,
  Typography,
  TextField,
  Button,
  Box,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Chip,
} from '@mui/material';
import { styled } from '@mui/material/styles';
import Navigator from '../../Navigation/Navigator';
import { Link, useNavigate } from "react-router-dom";
import { load } from '../Home/ImageLoad';
import './profile.css'
import { Edit as EditIcon } from '@mui/icons-material';
import Footer from '../../components/Footer/Footer';

const images = load();

const api_server = process.env.REACT_APP_API_SERVER;

// Global styles
const StyledPaper = styled(Paper)(({ theme }) => ({
  padding: theme.spacing(4),
  borderRadius: '8px',
  border: '1px solid #e0e0e0',
  '& .MuiTypography-root': {
    fontFamily: 'Poppins, sans-serif'
  },
  '& .MuiButton-root': {
    fontFamily: 'Poppins, sans-serif'
  },
  '& .MuiInputBase-root': {
    fontFamily: 'Poppins, sans-serif'
  },
  '& .MuiInputLabel-root': {
    fontFamily: 'Poppins, sans-serif'
  },
  '& .MuiChip-root': {
    fontFamily: 'Poppins, sans-serif'
  }
}));

// Update default styles for the Typography component
const StyledTypography = styled(Typography)({
  fontFamily: 'Poppins, sans-serif'
});

// Update default styles for the Button component
const StyledButton = styled(Button)({
  fontFamily: 'Poppins, sans-serif'
});

// Modify LargeAvatar styles
const LargeAvatar = styled(Avatar)(({ theme }) => ({
  width: theme.spacing(15),
  height: theme.spacing(15),
  margin: 'auto',
  border: '2px solid #e0e0e0',
  cursor: 'pointer',
  '&:hover': {
    opacity: 0.8,
  }
}));

// Modify BadgeBox styles, reducing height
const BadgeBox = styled(Box)({
  position: 'relative',
  padding: '16px 20px 12px',  // Reduce top and bottom padding
  width: 'calc(100% - 48px)',
  maxWidth: 'calc(100% - 48px)',
  margin: '16px auto 0',
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  gap: '4px',  // Reduce spacing
  background: 'linear-gradient(135deg, #4CAF50 0%, #2E7D32 100%)',
  clipPath: 'polygon(50% 0, 100% 25%, 100% 100%, 0 100%, 0 25%)',
  boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
  transition: 'all 0.3s ease',
  minHeight: '75px',  // Reduce minimum height
  justifyContent: 'center',
  '&:hover': {
    transform: 'translateY(-2px)',
    boxShadow: '0 6px 16px rgba(0,0,0,0.2)',
  },
  '&::before': {
    content: '""',
    position: 'absolute',
    top: 2,
    left: 2,
    right: 2,
    bottom: 2,
    background: 'transparent',
    clipPath: 'polygon(50% 0, 100% 25%, 100% 100%, 0 100%, 0 25%)',
    border: '1px solid rgba(255,255,255,0.3)',
    pointerEvents: 'none'
  }
});

// Modify the function for obtaining badges, returning more detailed style information
const getBadge = (points) => {
  const numPoints = Number(points);
  if (isNaN(numPoints)) return null;
  
  if (numPoints >= 70) return { 
    icon: '☀️', 
    text: 'Green Hero',
    gradient: 'linear-gradient(135deg, #4CAF50 0%, #2E7D32 100%)',
    borderColor: '#2E7D32'
  };
  if (numPoints >= 50) return { 
    icon: '🌲', 
    text: 'Green Guardian',
    gradient: 'linear-gradient(135deg, #66BB6A 0%, #388E3C 100%)',
    borderColor: '#388E3C'
  };
  if (numPoints >= 30) return { 
    icon: '🌍', 
    text: 'Planet Protector',
    gradient: 'linear-gradient(135deg, #81C784 0%, #3c8c6c 100%)',
    borderColor: '#3c8c6c'
  };
  if (numPoints >= 10) return { 
    icon: '🍃', 
    text: 'Sustainability Seeker',
    gradient: 'linear-gradient(135deg, #A5D6A7 0%, #4da181 100%)',
    borderColor: '#4da181'
  };
  if (numPoints >= 1) return { 
    icon: '🌱', 
    text: 'Eco Explorer',
    gradient: 'linear-gradient(135deg, #C8E6C9 0%, #66BB6A 100%)',
    borderColor: '#66BB6A'
  };
  return null;
};

async function fetchPreference(setPreferences, userId) {
  if (!userId) return;

  try {
    const url = `${api_server}/getpreference?userId=${encodeURIComponent(userId)}`;
    const response = await fetch(url);
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    
    const res = await response.json();
    if (res) {
      setPreferences(res);
    } else {
      console.error("Preferences data is missing in the response.");
      setPreferences([]);
    }
  } catch (err) {
    console.error('Error fetching preferences:', err);
    setPreferences([]);
  }
}

async function fetchSaved(setSaved, userId, setIsLoading) {
  if (!userId) {
    setIsLoading(false);
    return;
  }

  try {
    const url = `${api_server}/reviews/getsaved?userId=${encodeURIComponent(userId)}`;
    const response = await fetch(url);
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    
    const res = await response.json();
    if (res) {
      setSaved(res);
    } else {
      console.error("Saved attractions data is missing in the response.");
      setSaved([]);
    }
  } catch (err) {
    console.error('Error fetching saved attractions:', err);
    setSaved([]);
  } finally {
    setIsLoading(false);
  }
}

async function fetchViewed(setViewed, userId, setIsLoading) {
  if (!userId) {
    setIsLoading(false);
    return;
  }

  try {
    const url = `${api_server}/reviews/getviewed?userId=${encodeURIComponent(userId)}`;
    const response = await fetch(url);
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    
    const res = await response.json();
    if (res) {
      setViewed(res);
    } else {
      console.error("Viewed attractions data is missing in the response.");
      setViewed([]);
    }
  } catch (err) {
    console.error('Error fetching viewed attractions:', err);
    setViewed([]);
  } finally {
    setIsLoading(false);
  }
}

const Profile = () => {
  const [userInfo, setUserInfo] = useState({
    name: '',
    age: '',
    address: '',
    email: '',
    preferences: ['Action', 'Adventure', 'Sci-Fi'],
    avatar: '/default-avatar.jpg',
    phoneNumber: ''
  });

  const [isEditing, setIsEditing] = useState(false);
  const [tempInfo, setTempInfo] = useState(userInfo);
  const [preferences, setPreferences] = useState([]);
  const [saved, setSaved] = useState([]);
  const [viewed, setViewed] = useState([]);
  const [userId, setUserId] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    // First, fetch user information
    fetch(`${api_server}/auth`, {
      credentials: 'include',
    })
    .then(response => {
      if (!response.ok) {
        throw new Error('Authentication failed');
      }
      return response.json();
    })
    .then(userInfo => {
      if (userInfo && userInfo.id) {
        setUserInfo(userInfo);
        setUserId(userInfo.id);
        // Fetch additional data only if userId exists
        fetchPreference(setPreferences, userInfo.id);
        fetchSaved(setSaved, userInfo.id, setIsLoading);
        fetchViewed(setViewed, userInfo.id, setIsLoading);
      }
    })
    .catch(error => {
      console.error('Error during authentication:', error);
      navigate('/login');
    });
  }, []); // Remove userId dependency

  const handleAvatarChange = (event) => {
    const file = event.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setTempInfo({ ...tempInfo, avatar: reader.result });
      };
      reader.readAsDataURL(file);
    }
  };

const handleSave = () => {
  setUserInfo(tempInfo);
  setIsEditing(false);
  // Here you would typically make an API call to update the user info
};

const movieGenres = [
  'Action', 'Adventure', 'Animation', 'Comedy', 'Crime',
  'Documentary', 'Drama', 'Family', 'Fantasy', 'Horror',
  'Mystery', 'Romance', 'Sci-Fi', 'Thriller'
];

const handleChange = () => {
  navigate("/userpref", { state: { userId: userId } });
}

// create a function to handle the avatar change
const titleStyle = {
  fontSize: '1.25rem', 
  fontWeight: 600,     
  color: '#333',       
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'space-between',
  mb: 3
};

  return (
    <>
      <Box 
        sx={{ 
          width: '100%', 
          minHeight: '100vh', // Ensure the content area occupies at least the full viewport height
          display: 'flex',
          flexDirection: 'column'
        }}
      >
        <Navigator sx={{ margin: 0, width: '100%' }} />
        <Container 
          maxWidth="lg" 
          sx={{ 
            mt: 3,
            mb: 4,
            flex: 1
          }}
        >
          <Grid container spacing={3.75}>
            {/* Left Side - Personal Information */}
            <Grid item xs={12} md={3}>
              <StyledPaper 
                elevation={0}
                sx={{
                  p: 3,
                  backgroundColor: '#fff',
                  borderRadius: 2,
                  border: '1px solid #e0e0e0'
                }}
              >
                {/* Avatar Section */}
                <Grid item xs={12} textAlign="center" sx={{ mb: 3, position: 'relative' }}>
                  {/* show avatar */}
                  <input
                    accept="image/*"
                    type="file"
                    id="avatar-upload"
                    hidden
                    onChange={handleAvatarChange}
                    disabled={!isEditing}
                  />
                  <Box sx={{ position: 'relative' }}>
                    <label htmlFor="avatar-upload">
                      <LargeAvatar
                        src={userInfo.avatar}
                        alt={userInfo.username}
                        component={isEditing ? 'div' : 'avatar'}
                      />
                    </label>
                  </Box>

                  {/* show gadget */}
                  {userInfo && getBadge(userInfo.green_point) && (
                    <BadgeBox
                      sx={{
                        background: getBadge(userInfo.green_point).gradient,
                      }}
                    >
                      <span style={{ 
                        fontSize: '1.8rem',  // reduce font size
                        filter: 'drop-shadow(0 2px 4px rgba(0,0,0,0.2))',
                        marginBottom: '2px'  // reduce margin
                      }}>
                        {getBadge(userInfo.green_point).icon}
                      </span>
                      <StyledTypography 
                        variant="subtitle2"
                        sx={{ 
                          fontWeight: 600,
                          color: '#fff',
                          textShadow: '0 1px 2px rgba(0,0,0,0.2)',
                          letterSpacing: '0.5px',
                          textAlign: 'center',
                          fontSize: '0.8rem',  // reduce font size
                          lineHeight: 1.2,
                          paddingBottom: '2px'  // reduce padding
                        }}
                      >
                        {getBadge(userInfo.green_point).text}
                      </StyledTypography>
                    </BadgeBox>
                  )}
                </Grid>

                {/* Personal Info Fields */}
                <Grid item xs={12}>
                  <Box mb={2}>
                    <TextField
                      fullWidth
                      label="Name"
                      value={userInfo.username}
                      onChange={(e) => setTempInfo({ ...tempInfo, username: e.target.value })}
                      disabled={!isEditing}
                      variant="outlined"
                      size="small"
                      InputLabelProps={{
                        shrink: true,  // Reduce the size of the label when focused
                        sx: { 
                          fontFamily: 'Poppins, sans-serif',
                          color: '#666'
                        }
                      }}
                    />
                  </Box>
                  <Box mb={2}>
                    <TextField
                      fullWidth
                      label="Email"
                      value={userInfo.email}
                      onChange={(e) => setTempInfo({ ...tempInfo, email: e.target.value })}
                      disabled={!isEditing}
                      variant="outlined"
                      size="small"
                      InputLabelProps={{
                        shrink: true,
                        sx: { 
                          fontFamily: 'Poppins, sans-serif',
                          color: '#666'
                        }
                      }}
                    />
                  </Box>
                  <Box mb={2}>
                    <TextField
                      fullWidth
                      label="Age"
                      type="number"
                      value={userInfo.age}
                      onChange={(e) => setTempInfo({ ...tempInfo, age: e.target.value })}
                      disabled={!isEditing}
                      variant="outlined"
                      size="small"
                      InputLabelProps={{
                        shrink: true,
                        sx: { 
                          fontFamily: 'Poppins, sans-serif',
                          color: '#666'
                        }
                      }}
                    />
                  </Box>
                  <Box mb={2}>
                    <TextField
                      fullWidth
                      label="Phone Number"
                      value={userInfo.phoneNumber}
                      onChange={(e) => setTempInfo({ ...tempInfo, phoneNumber: e.target.value })}
                      disabled={!isEditing}
                      variant="outlined"
                      size="small"
                      InputLabelProps={{
                        shrink: true,
                        sx: { 
                          fontFamily: 'Poppins, sans-serif',
                          color: '#666'
                        }
                      }}
                    />
                  </Box>
                  <Box mb={2}>
                    <TextField
                      fullWidth
                      label="Address"
                      value={userInfo.address}
                      onChange={(e) => setTempInfo({ ...tempInfo, address: e.target.value })}
                      disabled={!isEditing}
                      variant="outlined"
                      multiline
                      rows={2}
                      size="small"
                      InputLabelProps={{
                        shrink: true,
                        sx: { 
                          fontFamily: 'Poppins, sans-serif',
                          color: '#666'
                        }
                      }}
                    />
                  </Box>
                </Grid>

                {/* Action Buttons */}
                <Grid item xs={12} textAlign="center" sx={{ mt: 3 }}>
                  {isEditing ? (
                    <Box sx={{ display: 'flex', justifyContent: 'center', gap: 2 }}>
                      <StyledButton
                        variant="contained"
                        color="primary"
                        onClick={handleSave}
                        sx={{ 
                          width: '80px',
                          height: '32px',
                          fontSize: '0.875rem',
                          padding: '4px 12px',
                          backgroundColor: '#1976d2',
                          textTransform: 'none',
                          '&:hover': {
                            backgroundColor: '#115293'
                          }
                        }}
                      >
                        Save
                      </StyledButton>
                      <StyledButton
                        variant="outlined"
                        onClick={() => {
                          setTempInfo(userInfo);
                          setIsEditing(false);
                        }}
                        sx={{ 
                          width: '80px',
                          height: '32px',
                          fontSize: '0.875rem',
                          padding: '4px 12px',
                          borderColor: '#666',
                          color: '#666',
                          textTransform: 'none',
                          '&:hover': {
                            borderColor: '#333',
                            color: '#333',
                            backgroundColor: 'rgba(0, 0, 0, 0.04)'
                          }
                        }}
                      >
                        Cancel
                      </StyledButton>
                    </Box>
                  ) : (
                    <StyledButton
                      variant="outlined"
                      startIcon={<EditIcon />}
                      onClick={() => setIsEditing(true)}
                      sx={{
                        color: '#3c8c6c',
                        borderColor: '#3c8c6c',
                        '&:hover': {
                          borderColor: '#4da181',
                          bgcolor: 'rgba(60, 140, 108, 0.08)'
                        }
                      }}
                    >
                      Edit Profile
                    </StyledButton>
                  )}
                </Grid>
              </StyledPaper>
            </Grid>

            {/* Right Side - Preferences and Saved Attractions */}
            <Grid item xs={12} md={9}>
              <StyledPaper 
                elevation={0}
                sx={{
                  p: 3,
                  backgroundColor: '#fff',
                  borderRadius: 2,
                  border: '1px solid #e0e0e0'
                }}
              >
                {/* Preferences */}
                <Box 
                  sx={{ 
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    mb: 3
                  }}
                >
                  <StyledTypography 
                    variant="h6" 
                    sx={{
                      fontSize: '1.25rem',
                      fontWeight: 600,
                      color: '#333',
                    }}
                  >
                    Preferences
                  </StyledTypography>
                  <StyledButton
                    variant="outlined"
                    size="small"
                    onClick={handleChange}
                    startIcon={<EditIcon sx={{ fontSize: '1rem' }} />}
                    sx={{ 
                      width: '80px',
                      height: '32px',
                      padding: '4px 12px',
                      fontSize: '0.875rem',
                      borderColor: '#666',
                      color: '#666',
                      textTransform: 'none',
                      '&:hover': {
                        borderColor: '#333',
                        color: '#333',
                        backgroundColor: 'rgba(0, 0, 0, 0.04)'
                      }
                    }}
                  >
                    Edit
                  </StyledButton>
                </Box>

                {/* Preferences */}
                <Box>
                  {preferences.length === 0 ? (
                    <StyledTypography>You haven&apos;t selected preferences yet.</StyledTypography>
                  ) : (
                    <Grid container spacing={2}>
                      {preferences.map(p => (
                        <Grid item xs={12} sm={6} md={2.4} key={p}>
                          <Box
                            sx={{
                              '&:hover': {
                                transform: 'translateY(-5px)',
                                transition: 'transform 0.3s ease'
                              }
                            }}
                          >
                            <img
                              src={images[p]}
                              alt={p}
                              style={{ 
                                width: '100%', 
                                height: '140px',
                                objectFit: 'cover',
                                borderRadius: '8px',
                              }}
                            />
                          </Box>
                        </Grid>
                      ))}
                    </Grid>
                  )}
                </Box>

                {/* Saved Attractions */}
                <StyledTypography 
                  variant="h6" 
                  gutterBottom 
                  sx={{
                    ...titleStyle,
                    mt: 4
                  }}
                >
                  Saved Attractions
                </StyledTypography>

                <Box>
                  {isLoading ? (
                    <StyledTypography>Loading...</StyledTypography>
                  ) : saved.length === 0 ? (
                    <StyledTypography>You haven&apos;t saved any attractions yet.</StyledTypography>
                  ) : (
                    <Grid container spacing={2}>
                      {Object.entries(saved).map(([attractionId, imageUrl]) => (
                        <Grid item xs={12} sm={6} md={2.4} key={attractionId}>
                          <Link 
                            to={`/attraction/${attractionId}`} 
                            style={{ textDecoration: 'none' }}
                          >
                            <Box
                              sx={{
                                '&:hover': {
                                  transform: 'translateY(-5px)',
                                  transition: 'transform 0.3s ease'
                                }
                              }}
                            >
                              <img
                                src={imageUrl}
                                alt='Saved Attraction'
                                style={{ 
                                  width: '100%', 
                                  height: '140px',
                                  objectFit: 'cover',
                                  borderRadius: '8px',
                                }}
                              />
                            </Box>
                          </Link>
                        </Grid>
                      ))}
                    </Grid>
                  )}
                </Box>

                {/* Viewed Attractions Section */}
                <StyledTypography 
                  variant="h6" 
                  gutterBottom 
                  sx={{
                    ...titleStyle,
                    mt: 4
                  }}
                >
                  Reviewed Attractions
                </StyledTypography>

                <Box>
                  {isLoading ? (
                    <StyledTypography>Loading...</StyledTypography>
                  ) : viewed.length === 0 ? (
                    <StyledTypography>You haven&apos;t viewed any attractions yet.</StyledTypography>
                  ) : (
                    <Grid container spacing={2}>
                      {Object.entries(viewed).map(([attractionId, imageUrl]) => (
                        <Grid item xs={12} sm={6} md={2.4} key={attractionId}>
                          <Link 
                            to={`/attraction/${attractionId}`} 
                            style={{ textDecoration: 'none' }}
                          >
                            <Box
                              sx={{
                                '&:hover': {
                                  transform: 'translateY(-5px)',
                                  transition: 'transform 0.3s ease'
                                }
                              }}
                            >
                              <img
                                src={imageUrl}
                                alt='Viewed Attraction'
                                style={{ 
                                  width: '100%', 
                                  height: '140px',
                                  objectFit: 'cover',
                                  borderRadius: '8px',
                                }}
                              />
                            </Box>
                          </Link>
                        </Grid>
                      ))}
                    </Grid>
                  )}
                </Box>
              </StyledPaper>
            </Grid>
          </Grid>
        </Container>
        <Footer />
      </Box>
    </>
  );
};

export default Profile;