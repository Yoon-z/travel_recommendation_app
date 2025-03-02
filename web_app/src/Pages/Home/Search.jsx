import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import './search.css';
import { handleError } from './ImageLoad';
import { 
  Box, 
  TextField, 
  InputAdornment, 
  IconButton, 
  Paper,
  Autocomplete,
  Fade,
  Typography,
  CircularProgress
} from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import LocationOnIcon from '@mui/icons-material/LocationOn';
import ClearIcon from '@mui/icons-material/Clear';
import { styled } from '@mui/material/styles';

const api_server = process.env.REACT_APP_API_SERVER;

const SearchWrapper = styled(Box)(({ theme }) => ({
  width: '100%',
  display: 'flex',
  justifyContent: 'center',
  padding: '20px',
}));

const StyledSearchBox = styled(Box)(({ theme }) => ({
  width: '100%',
  maxWidth: '700px',
}));

export default function Search({ submit, setSubmit }) {
  const [searchValue, setSearchValue] = useState('');
  const [suggestions] = useState([
    'Sydney Opera House',
    'Great Barrier Reef',
    'Bondi Beach',
    'Blue Mountains',
    'Melbourne CBD',
    'Gold Coast',
    // ... add more suggestions
  ]);
  const [city, setCity] = useState([]);
  const [attractions, setAttractions] = useState({})
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    const fetchCities = async () => {
      try {
        const response = await fetch(`${api_server}/city`);
        if (!response.ok) throw new Error("Failed to fetch cities.");
        const cities = await response.json();
        setCity(cities);
      } catch (error) {
        console.error(error);
      }
    };

    fetchCities();
  }, []);
  
  const handleSearch = async (event) => {
    event.preventDefault();
    if (searchValue.trim()) {
      setIsLoading(true);
      try {
        const response = await fetch(`${api_server}/city/attractions?keyword=${encodeURIComponent(searchValue.trim())}`, {
          method: 'GET',
          credentials: 'include'
        });

        if (!response.ok) {
          throw new Error('Search failed');
        }

        const data = await response.json();
        setAttractions(data.attractions);
        setSubmit(true);
      } catch (error) {
        console.error('Error searching attractions:', error);
      } finally {
        setIsLoading(false);
      }
    }
  };

  const handleClear = () => {
    setSearchValue('');
    setSubmit(false);
  };

  const handleKeyPress = async (event) => {
    if (event.key === 'Enter' && searchValue.trim()) {
      event.preventDefault();
      handleSearch(event);
    }
  };

  return (
    <>
      <SearchWrapper>
        <StyledSearchBox>
          <Autocomplete
            freeSolo
            options={city}
            value={searchValue}
            onChange={(event, newValue) => {
              setSearchValue(newValue || '');
            }}
            onInputChange={(event, newInputValue) => {
              setSearchValue(newInputValue);
            }}
            onKeyPress={handleKeyPress}
            renderInput={(params) => (
              <TextField
                {...params}
                fullWidth
                placeholder="Search for sustainable travel destinations..."
                variant="outlined"
                onKeyPress={handleKeyPress}
                InputProps={{
                  ...params.InputProps,
                  startAdornment: (
                    <InputAdornment position="start">
                      <LocationOnIcon sx={{ color: '#2e7d32' }} />
                    </InputAdornment>
                  ),
                  endAdornment: (
                    <Box 
                      sx={{ 
                        display: 'flex', 
                        alignItems: 'center',
                        position: 'absolute',
                        right: '3px',
                        top: '50%',
                        transform: 'translateY(-50%)',
                        gap: '4px'
                      }}
                    >
                      <Box sx={{ 
                        width: '28px', 
                        visibility: searchValue ? 'visible' : 'hidden',
                        display: 'flex',
                        alignItems: 'center'
                      }}>
                        <IconButton
                          onClick={handleClear}
                          size="small"
                          sx={{
                            color: '#666',
                            padding: '4px',
                            '&:hover': {
                              color: '#333',
                            }
                          }}
                        >
                          <ClearIcon sx={{ fontSize: '18px' }} />
                        </IconButton>
                      </Box>
                      <IconButton 
                        onClick={handleSearch}
                        sx={{ 
                          backgroundColor: '#2e7d32',
                          color: 'white',
                          padding: '6px',
                          borderRadius: '50%',
                          height: '32px',
                          width: '32px',
                          minWidth: '32px',
                          marginRight: '2px',
                          '&:hover': {
                            backgroundColor: '#1b5e20',
                          }
                        }}
                      >
                        <SearchIcon sx={{ fontSize: '18px' }} />
                      </IconButton>
                    </Box>
                  ),
                  sx: {
                    height: '48px',
                    borderRadius: '8px',
                    backgroundColor: 'white',
                    boxShadow: '0 2px 8px rgba(0, 0, 0, 0.1)',
                    paddingRight: '48px',
                    '& .MuiOutlinedInput-root': {
                      fontFamily: 'var(--font-body)',
                      '& fieldset': {
                        borderColor: 'var(--border-color)',
                      },
                      '&:hover fieldset': {
                        borderColor: 'var(--primary-color)',
                      },
                      '&.Mui-focused fieldset': {
                        borderColor: 'var(--primary-color)',
                      },
                    },
                    '& .MuiInputLabel-root': {
                      fontFamily: 'var(--font-body)',
                      color: 'var(--text-secondary)',
                    },
                    '& .MuiOutlinedInput-notchedOutline': {
                      borderColor: '#e0e0e0',
                    },
                    '&:hover .MuiOutlinedInput-notchedOutline': {
                      borderColor: '#2e7d32',
                    },
                    '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
                      borderColor: '#2e7d32',
                    },
                  }
                }}
              />
            )}
            renderOption={(props, option) => (
              <Box 
                component="li" 
                {...props}
                sx={{
                  padding: '10px 16px',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  '&:hover': {
                    backgroundColor: 'rgba(46, 125, 50, 0.08)',
                  }
                }}
              >
                <LocationOnIcon sx={{ color: '#2e7d32', fontSize: '1.2rem' }} />
                {option}
              </Box>
            )}
          />
        </StyledSearchBox>
      </SearchWrapper>

      {isLoading && (
        <Box 
          sx={{ 
            display: 'flex', 
            justifyContent: 'center', 
            alignItems: 'center',
            minHeight: '200px'
          }}
        >
          <CircularProgress sx={{ color: '#3c8c6c' }} />
        </Box>
      )}

      {!isLoading && submit && attractions && Object.keys(attractions).length > 0 && (
        <div className="gallery">
          {Object.keys(attractions).map(category => (
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
              <Box 
                sx={{ 
                  display: 'flex',
                  flexWrap: 'wrap',
                  justifyContent: 'center',
                  gap: '20px',
                  maxWidth: '1250px',  
                  margin: '0 auto',
                  px: 2
                }}
              >
                {attractions[category].map(({ imageUrl, title, city, _id }) => (
                  <Box 
                    key={_id} 
                    sx={{ 
                      width: '220px',  
                      textAlign: 'center',
                      flex: '0 0 auto' 
                    }}
                  >
                    <Link to={`/attraction/${_id}`} style={{
                      textDecoration: 'none',
                      color: '#3c8c6c',
                    }}>
                      <img
                        src={imageUrl}
                        alt={title}
                        style={{ 
                          width: '220px', 
                          height: '180px', 
                          objectFit: 'cover',
                          borderRadius: '8px'
                        }}
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
                  </Box>
                ))}
              </Box>
            </div>
          ))}
        </div>
      )}
    </>
  );
}