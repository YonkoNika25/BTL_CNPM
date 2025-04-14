import React from 'react';
import { Box, Typography } from '@mui/material';

const Home = () => {
  return (
    <Box>
      <Typography variant="h4" gutterBottom>
        Welcome to the Attendance System
      </Typography>
      <Typography variant="body1">
        This is the home page of the attendance system. You can navigate to
        different sections using the sidebar.
      </Typography>
    </Box>
  );
};

export default Home;
