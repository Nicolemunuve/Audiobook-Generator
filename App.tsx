import * as React from 'react';
import { useState } from 'react';
import { ThemeProvider } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import Box from '@mui/material/Box';
import { theme } from './theme/theme';
import BookReader from './components/BookReader';
import BookLibrary from './components/BookLibrary';
import Welcome from './components/Welcome';
import WallpaperSelector from './components/WallpaperSelector';
import { books } from './data/books';
import type { Book } from './data/books';
import { WallpaperProvider, useWallpaper } from './context/WallpaperContext';

const AppContent: React.FC = () => {
  const [selectedBook, setSelectedBook] = useState<Book | null>(null);
  const [readingSpeed, setReadingSpeed] = useState<number>(1);
  const { wallpaper } = useWallpaper();

  const handleBookSelect = (book: Book) => {
    setSelectedBook(book);
  };

  const handleSpeedChange = (speed: number) => {
    setReadingSpeed(speed);
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

const App: React.FC = () => {
  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <WallpaperProvider>
        <AppContent />
      </WallpaperProvider>
    </ThemeProvider>
  );
};

export default App;
