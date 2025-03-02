import './style_home.css';
import React from 'react';
import Navigator from '../../Navigation/Navigator';
import Footer from '../../components/Footer/Footer';
import ImageGallery from './ImageGallery';
import Search from './Search'
import { useState } from "react";
import { Box } from '@mui/material';

export default function Home() {
    const [submit, setSubmit] = useState(false);

    return (
        <Box 
            sx={{ 
                width: '100%', 
                minHeight: '100vh',
                display: 'flex',
                flexDirection: 'column',
                overflowX: 'hidden'
            }}
        >
            <Navigator />
            <Box sx={{ 
                flex: 1,
                width: '100%',
                maxWidth: '100vw'
            }}>
                <Search submit={submit} setSubmit={setSubmit} />
                {!submit && <ImageGallery />}
            </Box>
            <Footer />
        </Box>
    );
}