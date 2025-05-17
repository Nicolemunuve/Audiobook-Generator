import React, { useState, useEffect, useCallback } from 'react';
import {
  Box,
  IconButton,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Typography,
  Paper,
  ToggleButton,
  ToggleButtonGroup,
  Slider,
} from '@mui/material';
import {
  PlayArrow,
  Pause,
  VolumeUp,
  SkipNext,
  SkipPrevious,
} from '@mui/icons-material';
import TextToSpeechService from '../services/TextToSpeechService';

interface AudioControlsProps {
  totalPages: number;
  currentPage: number;
  onPageChange: (page: number) => void;
  isPlaying: boolean;
  onPlayPause: () => void;
  duration: number;
  currentTime: number;
  onTimeChange: (time: number) => void;
  onSpeedChange: (speed: number) => void;
  currentText?: string;
}

const AudioControls: React.FC<AudioControlsProps> = ({
  totalPages,
  currentPage,
  onPageChange,
  isPlaying,
  onPlayPause,
  duration,
  currentTime,
  onTimeChange,
  onSpeedChange,
  currentText = '',
}) => {
  const [voice, setVoice] = useState<SpeechSynthesisVoice | null>(null);
  const [speed, setSpeed] = useState<string>('1');
  const [volume, setVolume] = useState<number>(1);
  const [pitch, setPitch] = useState<number>(1);
  const [voices, setVoices] = useState<SpeechSynthesisVoice[]>([]);
  const ttsService = TextToSpeechService.getInstance();

  useEffect(() => {
    const loadVoices = () => {
      const availableVoices = ttsService.getVoices();
      setVoices(availableVoices);
      if (availableVoices.length > 0) {
        setVoice(availableVoices[0]);
      }
    };

    window.speechSynthesis.onvoiceschanged = loadVoices;
    loadVoices();

    return () => {
      ttsService.stop();
    };
  }, []);

  const handleSpeedChange = (_: React.MouseEvent<HTMLElement>, newSpeed: string) => {
    if (newSpeed !== null) {
      setSpeed(newSpeed);
      onSpeedChange(parseFloat(newSpeed));
    }
  };

  const handleVoiceChange = (event: React.ChangeEvent<{ value: unknown }>) => {
    const selectedVoice = voices.find(v => v.name === event.target.value);
    if (selectedVoice) {
      setVoice(selectedVoice);
      // Restart speech with new voice if currently playing
      if (isPlaying && currentText) {
        ttsService.stop();
        ttsService.speak(currentText, {
          voice: selectedVoice,
          rate: parseFloat(speed),
          pitch,
          volume,
        });
      }
    }
  };

  useEffect(() => {
    if (isPlaying && currentText && voice) {
      ttsService.speak(currentText, {
        voice,
        rate: parseFloat(speed),
        pitch,
        volume,
      });
    } else {
      ttsService.stop();
    }
  }, [isPlaying, currentText, voice, speed, pitch, volume]);

  const formatTime = (seconds: number): string => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const remainingSeconds = Math.floor(seconds % 60);
    return `${hours.toString().padStart(2, '0')}:${minutes
      .toString()
      .padStart(2, '0')}:${remainingSeconds.toString().padStart(2, '0')}`;
  };

  return (
    <Paper sx={{ p: 2, mb: 2 }}>
      {/* Timeline Display */}
      <Box sx={{ mb: 2 }}>
        <Typography variant="body2" color="text.secondary" align="center">
          {formatTime(currentTime)} / {formatTime(duration)}
        </Typography>
        <Box
          sx={{
            width: '100%',
            height: 4,
            bgcolor: 'grey.200',
            borderRadius: 2,
            mt: 1,
            position: 'relative',
          }}
        >
          <Box
            sx={{
              position: 'absolute',
              height: '100%',
              bgcolor: 'primary.main',
              borderRadius: 2,
              width: `${(currentTime / duration) * 100}%`,
            }}
          />
        </Box>
      </Box>

      {/* Playback Controls */}
      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 2, mb: 2 }}>
        <IconButton onClick={() => onPageChange(currentPage - 1)} disabled={currentPage <= 1}>
          <SkipPrevious />
        </IconButton>
        <IconButton onClick={onPlayPause} color="primary" sx={{ p: 2 }}>
          {isPlaying ? <Pause /> : <PlayArrow />}
        </IconButton>
        <IconButton onClick={() => onPageChange(currentPage + 1)} disabled={currentPage >= totalPages}>
          <SkipNext />
        </IconButton>
      </Box>

      {/* Speed Controls */}
      <Box sx={{ display: 'flex', justifyContent: 'center', mb: 2 }}>
        <ToggleButtonGroup
          value={speed}
          exclusive
          onChange={handleSpeedChange}
          aria-label="reading speed"
          size="small"
        >
          <ToggleButton value="1" aria-label="normal speed">
            1x
          </ToggleButton>
          <ToggleButton value="1.5" aria-label="1.5x speed">
            1.5x
          </ToggleButton>
          <ToggleButton value="2" aria-label="double speed">
            2x
          </ToggleButton>
        </ToggleButtonGroup>
      </Box>

      {/* Voice Selection and Audio Controls */}
      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
        <FormControl size="small">
          <InputLabel>Voice</InputLabel>
          <Select
            value={voice?.name || ''}
            label="Voice"
            onChange={handleVoiceChange}
          >
            {voices.map((v) => (
              <MenuItem key={v.name} value={v.name}>
                {v.name} ({v.lang})
              </MenuItem>
            ))}
          </Select>
        </FormControl>

        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, flex: 1 }}>
            <VolumeUp />
            <Slider
              value={volume}
              onChange={(_, value) => setVolume(value as number)}
              min={0}
              max={1}
              step={0.1}
              aria-label="Volume"
            />
          </Box>
          
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, flex: 1 }}>
            <Typography>Pitch</Typography>
            <Slider
              value={pitch}
              onChange={(_, value) => setPitch(value as number)}
              min={0.5}
              max={2}
              step={0.1}
              aria-label="Pitch"
            />
          </Box>
        </Box>
      </Box>
    </Paper>
  );
};

export default AudioControls; 
 