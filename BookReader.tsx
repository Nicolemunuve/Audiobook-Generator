import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Box, Paper, TextField, IconButton, Typography, Container, Tooltip, Collapse } from '@mui/material';
import { BookmarkBorder, Create, Highlight, ArrowBack, ArrowForward, ArrowBackIos, ArrowForwardIos, ExpandMore, ExpandLess } from '@mui/icons-material';
import { ChromePicker } from 'react-color';
import { BookInfo } from '../services/BookService';
import AudioControls from './AudioControls';
import ISBNSearch from './ISBNSearch';
import BookService from '../services/BookService';
import TextToSpeechService from '../services/TextToSpeechService';
import { Book } from '../data/books';
import ReadingStats from './ReadingStats';
import ReadingModes from './ReadingModes';
import BookService from '../services/BookService';

interface Note {
  page: number;
  content: string;
  timestamp: Date;
}

interface Bookmark {
  page: number;
  position: { x: number; y: number };
}

interface BookReaderProps {
  book: Book;
  onBack: () => void;
  readingSpeed: number;
  onSpeedChange: (speed: number) => void;
}

const BookReader: React.FC<BookReaderProps> = ({
  book,
  onBack,
  readingSpeed,
  onSpeedChange,
}) => {
  const [notes, setNotes] = useState<Note[]>([]);
  const [bookmarks, setBookmarks] = useState<Bookmark[]>([]);
  const [highlightColor, setHighlightColor] = useState('#ffeb3b');
  const [showColorPicker, setShowColorPicker] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [highlightedWord, setHighlightedWord] = useState<{
    word: string;
    startOffset: number;
    endOffset: number;
  } | null>(null);
  const [showNotes, setShowNotes] = useState(false);
  const [readingStats, setReadingStats] = useState({
    totalTimeRead: 0,
    averageReadingSpeed: 0,
    pagesRead: 0,
    totalPages: book.pages,
    wordsPerMinute: 0,
    lastReadDate: new Date(),
    readingStreak: 0
  });
  
  const contentRef = useRef<HTMLDivElement>(null);
  const ttsService = TextToSpeechService.getInstance();
  const startTime = useRef<number>(Date.now());
  const bookService = BookService.getInstance();

  const handleBookFound = (newBook: BookInfo) => {
    setCurrentPage(1);
    setCurrentTime(0);
    setDuration(bookService.estimateTextDuration(newBook.content[0]));
  };

  const handleAddNote = (content: string) => {
    const newNote: Note = {
      page: currentPage,
      content,
      timestamp: new Date(),
    };
    setNotes([...notes, newNote]);
  };

  const handleAddBookmark = (position: { x: number; y: number }) => {
    const newBookmark: Bookmark = {
      page: currentPage,
      position,
    };
    setBookmarks([...bookmarks, newBookmark]);
  };

  const handlePlayPause = () => {
    if (!book) return;

    if (isPlaying) {
      bookService.pauseSpeaking();
    } else {
      bookService.startSpeaking(
        book.content[currentPage - 1],
        () => {
          setIsPlaying(false);
          setCurrentTime(0);
          if (currentPage < book.pages) {
            setCurrentPage(currentPage + 1);
          }
        },
        (time) => setCurrentTime(time)
      );
    }
    setIsPlaying(!isPlaying);
  };

  const handlePageChange = (newPage: number) => {
    if (!book || newPage < 1 || newPage > book.pages) return;

    bookService.stopSpeaking();
    setCurrentPage(newPage);
    setCurrentTime(0);
    setDuration(bookService.estimateTextDuration(book.content[newPage - 1]));
    setIsPlaying(false);
    setHighlightedWord(null);
  };

  const handleTimeChange = (time: number) => {
    setCurrentTime(time);
    // In a real implementation, you would seek to the specific time in the audio
  };

  const handleKeyPress = useCallback((event: KeyboardEvent) => {
    if (event.key === ' ' || event.key === 'k') {
      event.preventDefault();
      handlePlayPause();
    } else if (event.key === 'ArrowLeft' || event.key === 'j') {
      event.preventDefault();
      handlePageChange(currentPage - 1);
    } else if (event.key === 'ArrowRight' || event.key === 'l') {
      event.preventDefault();
      handlePageChange(currentPage + 1);
    } else if (event.key === 'b') {
      event.preventDefault();
      handleAddBookmark({ x: 0, y: 0 }); // Add default position
    } else if (event.key === 'n') {
      event.preventDefault();
      const noteInput = document.getElementById('note-input');
      if (noteInput) noteInput.focus();
    }
  }, [currentPage, handlePlayPause, handlePageChange]);

  useEffect(() => {
    document.addEventListener('keydown', handleKeyPress);
    return () => {
      document.removeEventListener('keydown', handleKeyPress);
    };
  }, [handleKeyPress]);

  useEffect(() => {
    // Set up word highlighting callback
    ttsService.setHighlightCallback((event) => {
      setHighlightedWord(event);
      
      // Scroll the highlighted word into view if needed
      if (contentRef.current) {
        const range = document.createRange();
        const textContent = contentRef.current.textContent || '';
        const startIndex = event.startOffset;
        const endIndex = event.endOffset;
        
        try {
          const textNode = Array.from(contentRef.current.childNodes)
            .find(node => node.nodeType === Node.TEXT_NODE) as Text;
            
          if (textNode) {
            range.setStart(textNode, startIndex);
            range.setEnd(textNode, endIndex);
            
            const rect = range.getBoundingClientRect();
            const containerRect = contentRef.current.getBoundingClientRect();
            
            if (rect.top < containerRect.top || rect.bottom > containerRect.bottom) {
              contentRef.current.scrollTo({
                top: rect.top - containerRect.top - containerRect.height / 2,
                behavior: 'smooth'
              });
            }
          }
        } catch (error) {
          console.warn('Error setting text range:', error);
        }
      }
    });

    return () => {
      ttsService.setHighlightCallback(null);
    };
  }, []);

  useEffect(() => {
    return () => {
      bookService.stopSpeaking();
    };
  }, []);

  useEffect(() => {
    // Preload next chunks when page changes
    bookService.preloadNextChunks(book.id, currentPage, 3);

    // Update reading stats
    const timeSpent = Math.floor((Date.now() - startTime.current) / 60000); // Convert to minutes
    const wordsRead = book.content[currentPage - 1].split(/\s+/).length;
    
    setReadingStats(prev => ({
      ...prev,
      totalTimeRead: prev.totalTimeRead + timeSpent,
      pagesRead: currentPage,
      wordsPerMinute: Math.round(wordsRead / (timeSpent || 1)),
      lastReadDate: new Date()
    }));

    startTime.current = Date.now();
  }, [currentPage, book.id]);

  const handleReadingModeChange = (mode: string) => {
    // Apply reading mode changes
    document.documentElement.setAttribute('data-theme', mode);
  };

  const handleAutoScrollSpeedChange = (speed: number) => {
    // Store the auto-scroll speed preference
    localStorage.setItem('autoScrollSpeed', speed.toString());
  };

  const handleAutoScrollToggle = (enabled: boolean) => {
    // Store the auto-scroll preference
    localStorage.setItem('autoScrollEnabled', enabled.toString());
  };

  if (!book) {
    return <ISBNSearch onBookFound={handleBookFound} />;
  }

  const renderContent = (text: string) => {
    if (!highlightedWord) return text;

    const before = text.slice(0, highlightedWord.startOffset);
    const highlighted = text.slice(highlightedWord.startOffset, highlightedWord.endOffset);
    const after = text.slice(highlightedWord.endOffset);

    return (
      <>
        {before}
        <span
          style={{
            backgroundColor: 'rgba(247, 202, 208, 0.5)', // Pastel pink with transparency
            padding: '0 2px',
            borderRadius: '3px',
            transition: 'background-color 0.3s ease'
          }}
        >
          {highlighted}
        </span>
        {after}
      </>
    );
  };

  return (
    <Container maxWidth="lg">
      <Box sx={{ p: 3 }} role="main" aria-label="Book reader">
        <Box sx={{ mb: 3, display: 'flex', alignItems: 'center' }}>
          <Tooltip title="Go back (Alt+←)">
            <IconButton 
              onClick={onBack} 
              sx={{ mr: 2 }}
              aria-label="Go back"
            >
              <ArrowBack />
            </IconButton>
          </Tooltip>
          <Typography variant="h4" role="heading">{book.title}</Typography>
        </Box>

        <ReadingStats stats={readingStats} />
        <ReadingModes
          onModeChange={handleReadingModeChange}
          onAutoScrollSpeedChange={handleAutoScrollSpeedChange}
          onAutoScrollToggle={handleAutoScrollToggle}
          isPlaying={isPlaying}
          currentWord={highlightedWord}
          contentRef={contentRef}
        />

        <AudioControls
          totalPages={book.pages}
          currentPage={currentPage}
          onPageChange={handlePageChange}
          isPlaying={isPlaying}
          onPlayPause={handlePlayPause}
          duration={duration}
          currentTime={currentTime}
          onTimeChange={handleTimeChange}
          onSpeedChange={onSpeedChange}
          currentText={book.content[currentPage - 1]}
        />

        <Paper
          sx={{
            p: 4,
            minHeight: '60vh',
            maxHeight: '60vh',
            overflow: 'auto',
            lineHeight: 1.8,
            fontSize: '1.1rem',
            position: 'relative',
            mb: 2
          }}
          role="article"
          aria-label={`Page ${currentPage} of ${book.pages}`}
        >
          <div ref={contentRef}>
            {renderContent(book.content[currentPage - 1])}
          </div>
        </Paper>

        <Box sx={{ mb: 2, display: 'flex', gap: 1, justifyContent: 'space-between' }}>
          <Box sx={{ display: 'flex', gap: 1 }}>
            <Tooltip title="Toggle highlight tool (H)">
              <IconButton 
                onClick={() => setShowColorPicker(!showColorPicker)}
                aria-label="Toggle highlight tool"
              >
                <Highlight />
              </IconButton>
            </Tooltip>
            <Tooltip title="Add note (N)">
              <IconButton onClick={() => setShowNotes(!showNotes)} aria-label="Add note">
                <Create />
              </IconButton>
            </Tooltip>
            <Tooltip title="Add bookmark (B)">
              <IconButton aria-label="Add bookmark">
                <BookmarkBorder />
              </IconButton>
            </Tooltip>
          </Box>
          <IconButton onClick={() => setShowNotes(!showNotes)}>
            {showNotes ? <ExpandLess /> : <ExpandMore />}
          </IconButton>
        </Box>

        <Collapse in={showNotes}>
          <Paper sx={{ p: 2, mb: 2 }}>
            <Typography variant="h6" gutterBottom>
              Notes for Page {currentPage}
            </Typography>
            
            <TextField
              fullWidth
              multiline
              rows={3}
              placeholder="Add a note..."
              sx={{ mb: 2 }}
              onChange={(e) => handleAddNote(e.target.value)}
            />

            {notes
              .filter(note => note.page === currentPage)
              .sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime())
              .map((note, index) => (
                <Paper key={index} sx={{ p: 2, mb: 1, backgroundColor: 'rgba(247, 202, 208, 0.1)' }}>
                  <Typography variant="body1">{note.content}</Typography>
                  <Typography variant="caption" color="textSecondary">
                    {note.timestamp.toLocaleString()}
                  </Typography>
                </Paper>
              ))
            }
          </Paper>
        </Collapse>
      </Box>
    </Container>
  );
};

export default BookReader; 