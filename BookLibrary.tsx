import React, { useState } from 'react';
import {
  Grid,
  Card,
  CardContent,
  CardMedia,
  Typography,
  Box,
  Chip,
} from '@mui/material';
import { Book } from '../data/books';
import BookSearch from './BookSearch';

interface BookLibraryProps {
  books: Book[];
  onBookSelect: (book: Book) => void;
}

const BookLibrary: React.FC<BookLibraryProps> = ({ books, onBookSelect }) => {
  const [filteredBooks, setFilteredBooks] = useState<Book[]>(books);

  const handleSearchResults = (searchResults: Book[]) => {
    setFilteredBooks(searchResults);
  };

  return (
    <Box sx={{ p: 3 }}>
      <BookSearch onBookSelect={handleSearchResults} />
      
      <Typography variant="h4" sx={{ mt: 4, mb: 4 }}>
        {filteredBooks.length === books.length ? 'Available Books' : 'Search Results'}
      </Typography>
      
      <Grid container spacing={3}>
        {filteredBooks.map((book) => (
          <Grid item xs={12} sm={6} md={4} lg={3} key={book.id}>
            <Card
              sx={{
                height: '100%',
                display: 'flex',
                flexDirection: 'column',
                cursor: 'pointer',
                transition: 'transform 0.2s',
                '&:hover': {
                  transform: 'scale(1.02)',
                },
              }}
              onClick={() => onBookSelect(book)}
            >
              <CardMedia
                component="img"
                height="300"
                image={book.coverUrl}
                alt={book.title}
                sx={{ objectFit: 'cover' }}
              />
              <CardContent sx={{ flexGrow: 1 }}>
                <Typography gutterBottom variant="h6" component="div">
                  {book.title}
                </Typography>
                <Typography variant="body2" color="text.secondary" gutterBottom>
                  {book.author}
                </Typography>
                {book.series && (
                  <Chip
                    label={`Series: ${book.series}`}
                    size="small"
                    sx={{ mb: 1 }}
                    color="primary"
                  />
                )}
                <Typography
                  variant="body2"
                  color="text.secondary"
                  sx={{
                    display: '-webkit-box',
                    WebkitLineClamp: 3,
                    WebkitBoxOrient: 'vertical',
                    overflow: 'hidden',
                    height: 60,
                  }}
                >
                  {book.description}
                </Typography>
                <Box sx={{ mt: 1 }}>
                  <Typography variant="caption" color="text.secondary">
                    {book.totalPages} pages
                  </Typography>
                </Box>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>
    </Box>
  );
};

export default BookLibrary; 