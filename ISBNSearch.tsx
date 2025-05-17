import React, { useState } from 'react';
import {
  Box,
  TextField,
  Button,
  Typography,
  Paper,
  CircularProgress,
} from '@mui/material';
import { bookService, BookInfo } from '../services/BookService';

interface ISBNSearchProps {
  onBookFound: (book: BookInfo) => void;
}

const ISBNSearch: React.FC<ISBNSearchProps> = ({ onBookFound }) => {
  const [isbn, setIsbn] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSearch = async () => {
    if (!isbn.trim()) {
      setError('Please enter an ISBN');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const bookInfo = await bookService.getBookByISBN(isbn.trim());
      onBookFound(bookInfo);
    } catch (err) {
      setError('Could not find book with this ISBN. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Paper
      sx={{
        p: 3,
        maxWidth: 400,
        mx: 'auto',
        mt: 4,
        backgroundColor: 'background.paper',
      }}
    >
      <Typography variant="h6" sx={{ mb: 2 }}>
        Search Book by ISBN
      </Typography>
      <Box sx={{ display: 'flex', gap: 1 }}>
        <TextField
          fullWidth
          value={isbn}
          onChange={(e) => setIsbn(e.target.value)}
          placeholder="Enter ISBN..."
          error={!!error}
          helperText={error}
          disabled={loading}
        />
        <Button
          variant="contained"
          onClick={handleSearch}
          disabled={loading}
          sx={{
            minWidth: 100,
            backgroundColor: 'primary.main',
            '&:hover': {
              backgroundColor: 'primary.dark',
            },
          }}
        >
          {loading ? <CircularProgress size={24} /> : 'Search'}
        </Button>
      </Box>
    </Paper>
  );
};

export default ISBNSearch; 