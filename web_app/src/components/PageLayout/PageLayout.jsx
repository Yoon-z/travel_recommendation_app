import React from 'react';
import { Box, Container, Grid, Paper } from '@mui/material';
import Navigator from '../../Navigation/Navigator';
import Footer from '../../components/Footer/Footer';
import { styled } from '@mui/material/styles';

const StyledPaper = styled(Paper)(({ theme }) => ({
  padding: theme.spacing(3),
  borderRadius: 8,
  border: '1px solid #e0e0e0',
  backgroundColor: '#fff',
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

const PageLayout = ({ rightContent }) => {
  return (
    <>
      <Navigator sx={{ margin: 0, width: '100%' }} />
      <Box 
        sx={{ 
          width: '100%',
          minHeight: 'calc(100vh - 92px)',
          display: 'flex',
          flexDirection: 'column'
        }}
      >
        <Container 
          maxWidth="lg" 
          sx={{ 
            mt: 3, 
            mb: 4,
            flex: 1
          }}
        >
          <Grid container justifyContent="center">
            <Grid item xs={12} md={10}>
              <StyledPaper elevation={0}>
                {rightContent}
              </StyledPaper>
            </Grid>
          </Grid>
        </Container>
        <Footer />
      </Box>
    </>
  );
};

export default PageLayout; 