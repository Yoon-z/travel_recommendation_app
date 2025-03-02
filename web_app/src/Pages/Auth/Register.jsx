import './style_auth.css'
import Navigator from '../../Navigation/Navigator';
import { Link, useNavigate } from "react-router-dom";
import React, { useState } from 'react';
import { Box, TextField, Button, Typography, Container } from '@mui/material';

export default function Register() {
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [age, setAge] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [address, setAddress] = useState('');
  const navigate = useNavigate();

  const api_server = process.env.REACT_APP_API_SERVER;

  async function register(ev) {
    ev.preventDefault();
    const response = await fetch(`${api_server}/auth/register`, {
      method: 'POST',
      body: JSON.stringify({ username, email, password, age, phoneNumber, address }),
      headers: { 'Content-Type': 'application/json' },
    })
    if (response.status === 200) {
      const data = await response.json();
      navigate("/userpref", { state: { userId: data.userId } });
    } else {
      alert('register failed');
    }
  }

  return (
    <>
      <Navigator />
      <Box 
        sx={{ 
          display: 'flex',
          minHeight: 'calc(100vh - 92px)', // 100vh - height of navbar
          alignItems: 'flex-start',  
          justifyContent: 'center',
          pt: 0 // remove padding 
        }}
      >
        <Container maxWidth="sm">
          <Box
            component="form"
            onSubmit={register}
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
              mx: 'auto' // center the form
            }}
          >
            <Typography variant="h5" sx={{ 
              mb: 2,
              fontFamily: 'Poppins, sans-serif',
              fontWeight: 600,
              color: '#3c8c6c'
            }}>
              Register
            </Typography>
            
            <TextField
              required
              fullWidth
              label="Username"
              value={username}
              onChange={ev => setUsername(ev.target.value)}
              sx={{ mb: 2 }}
            />
            
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
              sx={{ mb: 2 }}
            />

            <TextField
              fullWidth
              label="Age"
              onChange={ev => setAge(ev.target.value)}
              sx={{ mb: 3 }}
            />

            <TextField
              fullWidth
              label="Phone Number"
              onChange={ev => setPhoneNumber(ev.target.value)}
              sx={{ mb: 3 }}
            />

            <TextField
              fullWidth
              label="Address"
              onChange={ev => setAddress(ev.target.value)}
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
              Register
            </Button>
            
            <Typography variant="body2" sx={{ mt: 1 }}>
              Already have an account?{' '}
              <Link to="/login" style={{ 
                color: '#3c8c6c',
                textDecoration: 'none',
                '&:hover': {
                  textDecoration: 'underline'
                }
              }}>
                Login
              </Link>
            </Typography>
          </Box>
        </Container>
      </Box>
    </>
  );
}