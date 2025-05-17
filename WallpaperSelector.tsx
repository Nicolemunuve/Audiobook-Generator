import React, { useRef, useState } from 'react';
import {
  Button,
  Box,
  IconButton,
  Tooltip,
  Snackbar,
  Alert,
} from '@mui/material';
import WallpaperIcon from '@mui/icons-material/Wallpaper';
import DeleteIcon from '@mui/icons-material/Delete';
import { useWallpaper } from '../context/WallpaperContext';

const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB

const WallpaperSelector: React.FC = () => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { wallpaper, setWallpaper } = useWallpaper();
  const [error, setError] = useState<string | null>(null);

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      if (file.size > MAX_FILE_SIZE) {
        setError('Image size should be less than 5MB');
        return;
      }

      if (!file.type.startsWith('image/')) {
        setError('Please select an image file');
        return;
      }

      const reader = new FileReader();
      reader.onload = (e) => {
        setWallpaper(e.target?.result as string);
      };
      reader.onerror = () => {
        setError('Failed to read the image file');
      };
      reader.readAsDataURL(file);
    }
  };

  const handleRemoveWallpaper = () => {
    setWallpaper(null);
  };

  const handleCloseError = () => {
    setError(null);
  };

  return (
    <>
      <Box sx={{ position: 'fixed', bottom: 20, right: 20, zIndex: 1000 }}>
        <input
          type="file"
          accept="image/*"
          style={{ display: 'none' }}
          ref={fileInputRef}
          onChange={handleFileSelect}
        />
        <Box sx={{ display: 'flex', gap: 1 }}>
          {wallpaper && (
            <Tooltip title="Remove Wallpaper">
              <IconButton
                onClick={handleRemoveWallpaper}
                sx={{
                  bgcolor: 'background.paper',
                  '&:hover': { bgcolor: 'action.hover' },
                }}
              >
                <DeleteIcon />
              </IconButton>
            </Tooltip>
          )}
          <Tooltip title="Change Wallpaper">
            <IconButton
              onClick={() => fileInputRef.current?.click()}
              sx={{
                bgcolor: 'background.paper',
                '&:hover': { bgcolor: 'action.hover' },
              }}
            >
              <WallpaperIcon />
            </IconButton>
          </Tooltip>
        </Box>
      </Box>
      <Snackbar
        open={!!error}
        autoHideDuration={6000}
        onClose={handleCloseError}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'left' }}
      >
        <Alert onClose={handleCloseError} severity="error" sx={{ width: '100%' }}>
          {error}
        </Alert>
      </Snackbar>
    </>
  );
};

export default WallpaperSelector; 