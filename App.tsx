import React, { useState } from 'react';
import { ThemeProvider } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import { theme } from './theme/theme';
import BookReader from './components/BookReader';
import BookLibrary from './components/BookLibrary';
import Welcome from './components/Welcome';
import WallpaperSelector from './components/WallpaperSelector';
import { Box } from '@mui/material';
import { books } from './data/books';
import type { Book } from './data/books';
import { WallpaperProvider, useWallpaper } from './context/WallpaperContext';

class LRUCache<T> {
  private cache: Map<string, CacheEntry<T>>;
  private readonly maxSize: number;
}

const AppContent = () => {
  const [selectedBook, setSelectedBook] = useState<Book | null>(null);
  const [readingSpeed, setReadingSpeed] = useState<number>(1);
  const { wallpaper } = useWallpaper();

  const handleBookSelect = (book: Book) => {
    setSelectedBook(book);
  };

  const handleSpeedChange = (speed: number) => {
    setReadingSpeed(speed);
    // The BookReader component will receive this speed value
    // and apply it to the speech synthesis
  };

  return (
    <Box
      sx={{
        minHeight: '100vh',
        backgroundColor: 'background.default',
        display: 'flex',
        flexDirection: 'column',
        position: 'relative',
        ...(wallpaper && {
          '&::before': {
            content: '""',
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundImage: `url(${wallpaper})`,
            backgroundSize: 'cover',
            backgroundPosition: 'center',
            opacity: 0.15,
            zIndex: 0,
          },
        }),
      }}
    >
      <Box sx={{ position: 'relative', zIndex: 1 }}>
        <Welcome />
        {selectedBook ? (
          <BookReader
            book={selectedBook}
            onBack={() => setSelectedBook(null)}
            readingSpeed={readingSpeed}
            onSpeedChange={handleSpeedChange}
          />
        ) : (
          <BookLibrary books={books} onBookSelect={handleBookSelect} />
        )}
      </Box>
      <WallpaperSelector />
    </Box>
  );
};

function App() {
  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <WallpaperProvider>
        <AppContent />
      </WallpaperProvider>
    </ThemeProvider>
  );
}

export default App; 