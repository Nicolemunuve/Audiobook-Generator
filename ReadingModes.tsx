import React, { useState, useEffect, useRef } from 'react';
import { Box, Paper, ToggleButton, ToggleButtonGroup, Slider, Typography, Switch, FormControlLabel } from '@mui/material';
import { WbSunny, NightsStay, ColorLens } from '@mui/icons-material';
import TextToSpeechService from '../services/TextToSpeechService';

interface ReadingModesProps {
  onModeChange: (mode: string) => void;
  onAutoScrollSpeedChange: (speed: number) => void;
  onAutoScrollToggle: (enabled: boolean) => void;
  isPlaying: boolean;
  currentWord?: {
    word: string;
    startOffset: number;
    endOffset: number;
  };
  contentRef: React.RefObject<HTMLDivElement>;
}

export type ReadingMode = 'light' | 'dark' | 'sepia';

interface ThemeColors {
  background: string;
  text: string;
  accent: string;
}

const themes: Record<ReadingMode, ThemeColors> = {
  light: {
    background: '#ffffff',
    text: '#000000',
    accent: '#f7cad0'
  },
  dark: {
    background: '#1a1a1a',
    text: '#ffffff',
    accent: '#b5e5cf'
  },
  sepia: {
    background: '#f4ecd8',
    text: '#5b4636',
    accent: '#b5e5cf'
  }
};

const ReadingModes: React.FC<ReadingModesProps> = ({
  onModeChange,
  onAutoScrollSpeedChange,
  onAutoScrollToggle,
  isPlaying,
  currentWord,
  contentRef
}) => {
  const [mode, setMode] = useState<ReadingMode>('light');
  const [autoScrollEnabled, setAutoScrollEnabled] = useState(false);
  const [scrollSpeed, setScrollSpeed] = useState(1);
  const autoScrollRef = useRef<number | null>(null);
  const lastWordPosition = useRef<number>(0);

  const handleModeChange = (_: React.MouseEvent<HTMLElement>, newMode: ReadingMode) => {
    if (newMode !== null) {
      setMode(newMode);
      onModeChange(newMode);
      document.body.style.backgroundColor = themes[newMode].background;
      document.body.style.color = themes[newMode].text;
    }
  };

  const handleAutoScrollToggle = (event: React.ChangeEvent<HTMLInputElement>) => {
    const enabled = event.target.checked;
    setAutoScrollEnabled(enabled);
    onAutoScrollToggle(enabled);
  };

  const handleSpeedChange = (_: Event, newValue: number | number[]) => {
    const speed = newValue as number;
    setScrollSpeed(speed);
    onAutoScrollSpeedChange(speed);
  };

  // Synchronize auto-scroll with text-to-speech
  useEffect(() => {
    if (autoScrollEnabled && isPlaying && currentWord && contentRef.current) {
      try {
        const textNode = Array.from(contentRef.current.childNodes)
          .find((node): node is Text => node.nodeType === Node.TEXT_NODE);

        if (textNode) {
          const range = document.createRange();
          range.setStart(textNode, currentWord.startOffset);
          range.setEnd(textNode, currentWord.endOffset);
          
          const rect = range.getBoundingClientRect();
          const containerRect = contentRef.current.getBoundingClientRect();
          
          // Only scroll if the word is outside the visible area or if we've moved forward
          if (rect.top > lastWordPosition.current) {
            const scrollTarget = rect.top - containerRect.top - (containerRect.height * 0.4);
            
            contentRef.current.scrollTo({
              top: scrollTarget,
              behavior: 'smooth'
            });
            
            lastWordPosition.current = rect.top;
          }
        }
      } catch (error) {
        console.warn('Error during auto-scroll:', error);
      }
    }
  }, [autoScrollEnabled, isPlaying, currentWord, contentRef]);

  // Reset scroll position when playback stops
  useEffect(() => {
    if (!isPlaying) {
      lastWordPosition.current = 0;
    }
  }, [isPlaying]);

  // Clean up interval on unmount
  useEffect(() => {
    return () => {
      if (autoScrollRef.current) {
        clearInterval(autoScrollRef.current);
      }
    };
  }, []);

  return (
    <Paper sx={{ p: 2, mb: 2 }}>
      <Box sx={{ mb: 2 }}>
        <Typography variant="subtitle1" gutterBottom>
          Reading Mode
        </Typography>
        <ToggleButtonGroup
          value={mode}
          exclusive
          onChange={handleModeChange}
          aria-label="reading mode"
        >
          <ToggleButton value="light" aria-label="light mode">
            <WbSunny />
          </ToggleButton>
          <ToggleButton value="dark" aria-label="dark mode">
            <NightsStay />
          </ToggleButton>
          <ToggleButton value="sepia" aria-label="sepia mode">
            <ColorLens />
          </ToggleButton>
        </ToggleButtonGroup>
      </Box>

      <Box sx={{ mb: 2 }}>
        <FormControlLabel
          control={
            <Switch
              checked={autoScrollEnabled}
              onChange={handleAutoScrollToggle}
              color="primary"
            />
          }
          label="Auto-scroll with Audio"
        />
      </Box>

      {autoScrollEnabled && (
        <Box sx={{ width: '100%', px: 2 }}>
          <Typography variant="body2" gutterBottom>
            Scroll Offset
          </Typography>
          <Slider
            value={scrollSpeed}
            onChange={handleSpeedChange}
            aria-labelledby="scroll-speed-slider"
            min={0.2}
            max={0.8}
            step={0.1}
            marks
            valueLabelDisplay="auto"
            valueLabelFormat={(value) => `${Math.round(value * 100)}%`}
            sx={{
              color: themes[mode].accent,
              '& .MuiSlider-thumb': {
                backgroundColor: themes[mode].accent,
              },
              '& .MuiSlider-track': {
                backgroundColor: themes[mode].accent,
              }
            }}
          />
          <Typography variant="caption" color="textSecondary">
            Adjusts how far down the current word appears on screen
          </Typography>
        </Box>
      )}
    </Paper>
  );
};

export default ReadingModes; 