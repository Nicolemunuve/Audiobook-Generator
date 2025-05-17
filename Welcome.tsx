import React from 'react';
import { Box, Typography } from '@mui/material';

const Welcome = () => {
  return (
    <Box
      sx={{
        textAlign: 'center',
        py: 4,
        background: 'linear-gradient(135deg, #fce4ec 0%, #f8bbd0 100%)',
        borderRadius: '0 0 30px 30px',
        boxShadow: '0 4px 20px rgba(0, 0, 0, 0.1)',
        mb: 4,
      }}
    >
      <Typography
        variant="h2"
        sx={{
          fontFamily: '"Berkshire Swash", cursive',
          color: '#4a4a4a',
          textShadow: '2px 2px 4px rgba(0, 0, 0, 0.1)',
          animation: 'fadeIn 1.5s ease-in',
          '@keyframes fadeIn': {
            '0%': {
              opacity: 0,
              transform: 'translateY(-20px)',
            },
            '100%': {
              opacity: 1,
              transform: 'translateY(0)',
            },
          },
        }}
      >
        Welcome to the World of Audio Learning
      </Typography>
      <Typography
        variant="subtitle1"
        sx={{
          mt: 2,
          color: '#666',
          fontStyle: 'italic',
          maxWidth: 600,
          mx: 'auto',
        }}
      >
        Where every book becomes a journey for your ears
      </Typography>
    </Box>
  );
};

export default Welcome; 