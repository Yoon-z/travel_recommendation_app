import { Box, Paper, Typography } from '@mui/material';
import { styled } from '@mui/material/styles';

const AttractionCard = styled(Paper)(({ theme }) => ({
    borderRadius: '12px',
    overflow: 'hidden',
    transition: 'transform 0.2s ease, box-shadow 0.2s ease',
    cursor: 'pointer',
    '&:hover': {
        transform: 'translateY(-4px)',
        boxShadow: '0 4px 12px rgba(0, 0, 0, 0.1)'
    }
}));

const StyledTypography = styled(Typography)({
    fontFamily: 'Poppins, sans-serif'
});

const AttractionCardComponent = ({ attraction }) => {
    return (
        <AttractionCard>
            <Box sx={{ position: 'relative' }}>
                <img
                    src={attraction.imageUrl}
                    alt={attraction.title}
                    style={{
                        width: '100%',
                        height: '200px',
                        objectFit: 'cover'
                    }}
                />
                {/* Rating and Favorite Button */}
                <Box sx={{
                    position: 'absolute',
                    top: 8,
                    right: 8,
                    display: 'flex',
                    gap: 1
                }}>
                    {/* Rating and Favorite Component */}
                </Box>
            </Box>
            <Box sx={{ p: 2 }}>
                <StyledTypography 
                    variant="h6" 
                    sx={{ 
                        mb: 1,
                        fontSize: '1.1rem',
                        fontWeight: 600,
                        color: '#3c8c6c'
                    }}
                >
                    {attraction.title}
                </StyledTypography>
                <StyledTypography 
                    variant="body2" 
                    sx={{ 
                        color: '#666',
                        mb: 1
                    }}
                >
                    {attraction.city}
                </StyledTypography>
                {/* Rating Display */}
            </Box>
        </AttractionCard>
    );
    };
    

export default AttractionCardComponent; 