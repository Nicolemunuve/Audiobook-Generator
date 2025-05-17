import React from 'react';
import { Box, Paper, Typography, LinearProgress, Grid } from '@mui/material';
import { TimerOutlined, SpeedOutlined, MenuBookOutlined, TrendingUpOutlined } from '@mui/icons-material';

interface ReadingStats {
  totalTimeRead: number;
  averageReadingSpeed: number;
  pagesRead: number;
  totalPages: number;
  wordsPerMinute: number;
  lastReadDate: Date;
  readingStreak: number;
}

interface ReadingStatsProps {
  stats: ReadingStats;
}

const ReadingStats: React.FC<ReadingStatsProps> = ({ stats }) => {
  const formatTime = (minutes: number): string => {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return hours > 0 ? `${hours}h ${mins}m` : `${mins}m`;
  };

  const calculateProgress = (): number => {
    return (stats.pagesRead / stats.totalPages) * 100;
  };

  return (
    <Paper sx={{ p: 3, mb: 3 }}>
      <Typography variant="h6" gutterBottom>
        Reading Progress
      </Typography>
      
      <Box sx={{ mb: 3 }}>
        <LinearProgress 
          variant="determinate" 
          value={calculateProgress()} 
          sx={{ 
            height: 10, 
            borderRadius: 5,
            backgroundColor: 'rgba(181, 229, 207, 0.2)', // Light pastel green
            '& .MuiLinearProgress-bar': {
              backgroundColor: '#b5e5cf', // Pastel green
            }
          }}
        />
        <Typography variant="body2" color="textSecondary" align="right" sx={{ mt: 1 }}>
          {stats.pagesRead} of {stats.totalPages} pages
        </Typography>
      </Box>

      <Grid container spacing={3}>
        <Grid item xs={6} sm={3}>
          <Box sx={{ textAlign: 'center' }}>
            <TimerOutlined sx={{ color: '#f7cad0', fontSize: 32, mb: 1 }} />
            <Typography variant="body2" color="textSecondary">
              Total Time
            </Typography>
            <Typography variant="h6">
              {formatTime(stats.totalTimeRead)}
            </Typography>
          </Box>
        </Grid>

        <Grid item xs={6} sm={3}>
          <Box sx={{ textAlign: 'center' }}>
            <SpeedOutlined sx={{ color: '#f7cad0', fontSize: 32, mb: 1 }} />
            <Typography variant="body2" color="textSecondary">
              Reading Speed
            </Typography>
            <Typography variant="h6">
              {stats.wordsPerMinute} WPM
            </Typography>
          </Box>
        </Grid>

        <Grid item xs={6} sm={3}>
          <Box sx={{ textAlign: 'center' }}>
            <MenuBookOutlined sx={{ color: '#f7cad0', fontSize: 32, mb: 1 }} />
            <Typography variant="body2" color="textSecondary">
              Pages Today
            </Typography>
            <Typography variant="h6">
              {stats.pagesRead}
            </Typography>
          </Box>
        </Grid>

        <Grid item xs={6} sm={3}>
          <Box sx={{ textAlign: 'center' }}>
            <TrendingUpOutlined sx={{ color: '#f7cad0', fontSize: 32, mb: 1 }} />
            <Typography variant="body2" color="textSecondary">
              Reading Streak
            </Typography>
            <Typography variant="h6">
              {stats.readingStreak} days
            </Typography>
          </Box>
        </Grid>
      </Grid>
    </Paper>
  );
};

export default ReadingStats; 