import React from 'react';
import { Box, Container, Typography, Link } from '@mui/material';

const Footer = () => {
  return (
    <Box
      component="footer"
      sx={{
        py: 3,
        px: 2,
        mt: 4,
        backgroundColor: '#f1f8e9',
        borderTop: '1px solid #c5e1a5',
        width: '100%',
        boxSizing: 'border-box',
        fontFamily: 'Poppins, sans-serif'
      }}
    >
      <Container maxWidth="lg">
        <Box
          sx={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
          }}
        >
          <Box>
            <Typography 
              variant="body2" 
              sx={{ 
                color: '#3c8c6c',
                fontFamily: 'Poppins, sans-serif'
              }}
            >
              © 2025 Travel Recommendation System
            </Typography>
          </Box>
          <Box
            sx={{
              display: 'flex',
              gap: 3,
            }}
          >
            <Link 
              href="#" 
              sx={{ 
                color: '#3c8c6c',
                textDecoration: 'none',
                fontFamily: 'Poppins, sans-serif',
                '&:hover': {
                  color: '#4da181',
                  textDecoration: 'underline'
                }
              }}
            >
              About Us
            </Link>
            <Link 
              href="#" 
              sx={{ 
                color: '#3c8c6c',
                textDecoration: 'none',
                fontFamily: 'Poppins, sans-serif',
                '&:hover': {
                  color: '#4da181',
                  textDecoration: 'underline'
                }
              }}
            >
              Contact
            </Link>
            <Link 
              href="#" 
              sx={{ 
                color: '#3c8c6c',
                textDecoration: 'none',
                fontFamily: 'Poppins, sans-serif',
                '&:hover': {
                  color: '#4da181',
                  textDecoration: 'underline'
                }
              }}
            >
              Privacy Policy
            </Link>
            <Link 
              href="#" 
              sx={{ 
                color: '#3c8c6c',
                textDecoration: 'none',
                fontFamily: 'Poppins, sans-serif',
                '&:hover': {
                  color: '#4da181',
                  textDecoration: 'underline'
                }
              }}
            >
              Terms of Service
            </Link>
          </Box>
        </Box>
      </Container>
    </Box>
  );
};

export default Footer; 