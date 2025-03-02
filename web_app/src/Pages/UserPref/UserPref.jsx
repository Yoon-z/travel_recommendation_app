import React, { useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { loadArray } from '../Home/ImageLoad';
import Navigator from '../../Navigation/Navigator';
import Footer from '../../components/Footer/Footer';
import {
  Box,
  Container,
  Grid,
  Typography,
  Button,
  Paper,
  Avatar,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
} from '@mui/material';
import { styled } from '@mui/material/styles';
import { Edit as EditIcon } from '@mui/icons-material';
import './userpref.css';
import PageLayout from '../../components/PageLayout/PageLayout';

const images = loadArray();
const api_server = process.env.REACT_APP_API_SERVER;

// use same border style as the Profile page
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

const StyledTypography = styled(Typography)({
  fontFamily: 'Poppins, sans-serif'
});

const StyledButton = styled(Button)({
  fontFamily: 'Poppins, sans-serif'
});

const LargeAvatar = styled(Avatar)(({ theme }) => ({
  width: theme.spacing(15),
  height: theme.spacing(15),
  margin: 'auto',
  border: '1px solid #e0e0e0',
  cursor: 'pointer',
  '&:hover': {
    opacity: 0.8,
  },
}));

export default function UserPref() {
  const [clickedImage, setClickedImage] = useState(Array(images.length).fill(false));
  const [preference, setPreference] = useState(Array(images.length).fill(0));
  
  const [isEditing, setIsEditing] = useState(false);
  const location = useLocation();
  const { userId } = location.state || {};
  const navigate = useNavigate();

  if (!userId) {
    navigate('/');
  }

  const handleClick = (index) => {
    const newClickedImage = [...clickedImage];
    const newPreference = [...preference];

    newClickedImage[index] = !newClickedImage[index];
    newPreference[index] = newClickedImage[index] ? 1 : 0;

    const selectedCount = newClickedImage.filter(isClicked => isClicked).length;

    if (selectedCount > 5) {
      alert('You can only select up to 5 images.');
      return;
    }

    setClickedImage(newClickedImage);
    setPreference(newPreference);
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    const selectedPreferences = preference
      .map((p, index) => p === 1 ? images[index].name : null)
      .filter(name => name !== null);

    console.log(selectedPreferences);

    if (selectedPreferences.length === 0) {
      alert('Please select at least one image.');
      return;
    }

    // save user selected preferences in database
    try {
      const response = await fetch(`${api_server}/userPreference`, {
        method: 'POST',
        body: JSON.stringify({ userId, selectedPreferences }),
        headers: { 'Content-Type': 'application/json' },
      });

      if (response.status === 200) {
        console.log('Added user preferences successfully.');
        navigate('/');
      } else {
        console.log('Failed to add user preferences.');
      }
    } catch (error) {
      console.error('Error during fetch:', error);
    }
  };

  const rightContent = (
    <>
      <StyledTypography 
        variant="h6" 
        sx={{
          fontSize: '1.25rem',
          fontWeight: 600,
          color: '#333',
          mb: 3
        }}
      >
        Select topics you're interested in
      </StyledTypography>
      <div className="image-grid">
        {images.map((image, index) => (
          <div key={index}>
            <img 
              src={image.src} 
              alt={image.name}
              className={clickedImage[index] ? 'clicked' : ''}
              onClick={() => handleClick(index)} 
              style={{ 
                width: '100%',
                height: '140px',
                objectFit: 'cover',
                borderRadius: '8px',
                cursor: 'pointer'
              }}
            />
            <StyledTypography 
              variant="subtitle2"
              sx={{ 
                mt: 1,
                textAlign: 'center'
              }}
            >
              {image.name}
            </StyledTypography>
          </div>
        ))}
      </div>
      <Box sx={{ mt: 3, textAlign: 'center' }}>
        <StyledButton
          variant="contained"
          onClick={handleSubmit}
          sx={{
            bgcolor: '#3c8c6c',
            color: 'white',
            padding: '10px 24px',
            '&:hover': {
              bgcolor: '#4da181'
            }
          }}
        >
          Submit
        </StyledButton>
      </Box>
    </>
  );

  return <PageLayout rightContent={rightContent} />;
}
