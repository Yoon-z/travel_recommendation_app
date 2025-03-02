import './style_auth.css'
import Navigator from '../../Navigation/Navigator';
import { Link, useNavigate } from "react-router-dom";
import React, { useState } from 'react';
import { Box, TextField, Button, Typography, Container } from '@mui/material';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const navigate = useNavigate();

  const api_server = process.env.REACT_APP_API_SERVER;

  async function login(ev) {
    ev.preventDefault();
    const response = await fetch(`${api_server}/auth/login`, {
      method: 'POST',
      body: JSON.stringify({ email, password }),
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
    });
    if (response.ok) {
      handleLoginSuccess();
    } else {
      alert('wrong credentials');
    }
  }

  const handleLoginSuccess = () => {
    const redirectUrl = sessionStorage.getItem('redirectAfterLogin');
    sessionStorage.removeItem('redirectAfterLogin');
    
    if (redirectUrl) {
      navigate(redirectUrl);
    } else {
      navigate('/');
    }
  };

  return (
    <>
      <Navigator />
      <Box 
        sx={{ 
          display: 'flex',
          minHeight: 'calc(100vh - 92px)',
          alignItems: 'flex-start',
          justifyContent: 'center',
          pt: 0
        }}
      >
        <Container maxWidth="lg" sx={{ flex: 1, py: 4, mb: 4 }}>
          <Box
            component="form"
            onSubmit={login}
            sx={{
              p: 4,
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              gap: 2,
              backgroundColor: '#fff',
              borderRadius: '8px',
              border: '1px solid #e0e0e0',
              boxShadow: '0 2px 4px rgba(0, 0, 0, 0.08)',
              width: '100%',
              maxWidth: '400px',
              mx: 'auto'
            }}
          >
            <Typography variant="h5" sx={{ 
              mb: 2,
              fontFamily: 'Poppins, sans-serif',
              fontWeight: 600,
              color: '#3c8c6c'
            }}>
              Login
            </Typography>
            
            <TextField
              required
              fullWidth
              type="email"
              label="Email"
              value={email}
              onChange={ev => setEmail(ev.target.value)}
              sx={{ mb: 2 }}
            />
            
            <TextField
              required
              fullWidth
              type="password"
              label="Password"
              value={password}
              onChange={ev => setPassword(ev.target.value)}
              sx={{ mb: 3 }}
            />
            
            <Button
              type="submit"
              fullWidth
              variant="contained"
              sx={{
                bgcolor: '#3c8c6c',
                '&:hover': {
                  bgcolor: '#4da181',
                },
                mb: 2
              }}
            >
              Login
            </Button>
            
            <Typography variant="body2" sx={{ mt: 1 }}>
              Don't have an account?{' '}
              <Link to="/register" style={{ 
                color: '#3c8c6c',
                textDecoration: 'none',
                '&:hover': {
                  textDecoration: 'underline'
                }
              }}>
                Register
              </Link>
            </Typography>
          </Box>
        </Container>
      </Box>
    </>
  );
}