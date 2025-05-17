import React, { useState, useEffect, useMemo } from 'react';
import {
  Box,
  TextField,
  Button,
  Typography,
  Paper,
  CircularProgress,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Grid,
  Autocomplete,
} from '@mui/material';
import { bookService, BookInfo } from '../services/BookService';
import { books } from '../data/books';

interface BookSearchProps {
  onBookSelect: (book: BookInfo) => void;
}

type SearchType = 'isbn' | 'title' | 'author';

const BookSearch: React.FC<BookSearchProps> = ({ onBookSelect }) => {
  const [searchType, setSearchType] = useState<SearchType>('title');
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [searchResults, setSearchResults] = useState<typeof books>([]);

  // Generate suggestions based on search type
  const suggestions = useMemo(() => {
    const query = searchQuery.toLowerCase().trim();
    if (!query) return [];

    const uniqueValues = new Set<string>();
    
    books.forEach(book => {
      if (searchType === 'title') {
        if (book.title.toLowerCase().includes(query)) {
          uniqueValues.add(book.title);
        }
      } else if (searchType === 'author') {
        if (book.author.toLowerCase().includes(query)) {
          uniqueValues.add(book.author);
        }
      } else if (searchType === 'isbn') {
        if (book.isbn.includes(query)) {
          uniqueValues.add(book.isbn);
        }
      }
    });

    return Array.from(uniqueValues);
  }, [searchQuery, searchType]);

  const handleSearch = async (query: string = searchQuery) => {
    if (!query.trim()) {
      setError('Please enter a search term');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      let results;
      const searchTerm = query.trim().toLowerCase();

      if (searchType === 'isbn') {
        const bookInfo = await bookService.getBookByISBN(searchTerm);
        results = [bookInfo];
      } else {
        results = books.filter(book => {
          if (searchType === 'title') {
            return book.title.toLowerCase().includes(searchTerm);
          } else {
            return book.author.toLowerCase().includes(searchTerm);
          }
        });
      }

      if (results.length === 0) {
        setError('No books found matching your search');
        setSearchResults([]);
      } else {
        setSearchResults(results);
      }
    } catch (err) {
      setError('An error occurred while searching. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Paper
      sx={{
        p: 3,
        maxWidth: 800,
        mx: 'auto',
        mt: 4,
        backgroundColor: 'background.paper',
      }}
    >
      <Typography variant="h6" sx={{ mb: 2 }}>
        Search Books
      </Typography>
      <Grid container spacing={2} sx={{ mb: 3 }}>
        <Grid item xs={12} sm={3}>
          <FormControl fullWidth>
            <InputLabel>Search by</InputLabel>
            <Select
              value={searchType}
              label="Search by"
              onChange={(e) => {
                setSearchType(e.target.value as SearchType);
                setSearchQuery('');
              }}
            >
              <MenuItem value="title">Title</MenuItem>
              <MenuItem value="author">Author</MenuItem>
              <MenuItem value="isbn">ISBN</MenuItem>
            </Select>
          </FormControl>
        </Grid>
        <Grid item xs={12} sm={7}>
          <Autocomplete
            freeSolo
            options={suggestions}
            inputValue={searchQuery}
            onInputChange={(_, newValue) => setSearchQuery(newValue)}
            onChange={(_, value) => {
              if (value) {
                setSearchQuery(value);
                handleSearch(value);
              }
            }}
            renderInput={(params) => (
              <TextField
                {...params}
                fullWidth
                placeholder={`Enter ${searchType}...`}
                error={!!error}
                helperText={error}
                disabled={loading}
              />
            )}
          />
        </Grid>
        <Grid item xs={12} sm={2}>
          <Button
            fullWidth
            variant="contained"
            onClick={() => handleSearch()}
            disabled={loading}
            sx={{
              height: '56px',
              backgroundColor: 'primary.main',
              '&:hover': {
                backgroundColor: 'primary.dark',
              },
            }}
          >
            {loading ? <CircularProgress size={24} /> : 'Search'}
          </Button>
        </Grid>
      </Grid>

      {searchResults.length > 0 && (
        <Box sx={{ mt: 3 }}>
          <Typography variant="h6" sx={{ mb: 2 }}>
            Search Results
          </Typography>
          <Grid container spacing={2}>
            {searchResults.map((book) => (
              <Grid item xs={12} key={book.id}>
                <Paper
                  sx={{
                    p: 2,
                    cursor: 'pointer',
                    '&:hover': {
                      backgroundColor: 'action.hover',
                    },
                  }}
                  onClick={() => onBookSelect(book)}
                >
                  <Typography variant="subtitle1" sx={{ fontWeight: 'bold' }}>
                    {book.title}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    by {book.author}
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    ISBN: {book.isbn}
                  </Typography>
                </Paper>
              </Grid>
            ))}
          </Grid>
        </Box>
      )}
    </Paper>
  );
};

export default BookSearch; 