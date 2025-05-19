import { useState, useEffect, useRef } from 'react';
import { Box, IconButton, Slider, SliderTrack, SliderFilledTrack, SliderThumb, Flex, Text } from '@chakra-ui/react';
import { FiPlay, FiPause } from 'react-icons/fi';

const AudioPlayer = ({ audioData }) => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [duration, setDuration] = useState(0);
  const [currentTime, setCurrentTime] = useState(0);
  const audioRef = useRef(null);
  const audioUrl = useRef(null);

  useEffect(() => {
    if (audioData) {
      // Convert base64 or binary audio data to a blob URL
      const audioBlob = new Blob([audioData], { type: 'audio/wav' });
      audioUrl.current = URL.createObjectURL(audioBlob);
      
      // Create audio element
      if (!audioRef.current) {
        audioRef.current = new Audio(audioUrl.current);
        
        // Add event listeners
        audioRef.current.addEventListener('loadedmetadata', () => {
          setDuration(audioRef.current.duration);
        });
        
        audioRef.current.addEventListener('timeupdate', () => {
          setCurrentTime(audioRef.current.currentTime);
        });
        
        audioRef.current.addEventListener('ended', () => {
          setIsPlaying(false);
          setCurrentTime(0);
        });
      } else {
        audioRef.current.src = audioUrl.current;
      }
    }
    
    // Cleanup function
    return () => {
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current.removeEventListener('loadedmetadata', () => {});
        audioRef.current.removeEventListener('timeupdate', () => {});
        audioRef.current.removeEventListener('ended', () => {});
      }
      
      if (audioUrl.current) {
        URL.revokeObjectURL(audioUrl.current);
      }
    };
  }, [audioData]);

  const togglePlayPause = () => {
    if (isPlaying) {
      audioRef.current.pause();
    } else {
      audioRef.current.play();
    }
    setIsPlaying(!isPlaying);
  };

  const handleSliderChange = (value) => {
    if (audioRef.current) {
      audioRef.current.currentTime = value;
      setCurrentTime(value);
    }
  };

  // Format time in MM:SS
  const formatTime = (time) => {
    const minutes = Math.floor(time / 60);
    const seconds = Math.floor(time % 60);
    return `${minutes}:${seconds < 10 ? '0' : ''}${seconds}`;
  };

  return (
    <Box bg="whiteAlpha.900" p={2} borderRadius="md">
      <Flex align="center">
        <IconButton
          icon={isPlaying ? <FiPause /> : <FiPlay />}
          aria-label={isPlaying ? 'Pause' : 'Play'}
          onClick={togglePlayPause}
          size="sm"
          colorScheme="brand"
          mr={2}
        />
        
        <Slider
          aria-label="audio-progress"
          value={currentTime}
          min={0}
          max={duration || 100}
          onChange={handleSliderChange}
          flex="1"
          mr={2}
        >
          <SliderTrack>
            <SliderFilledTrack bg="brand.500" />
          </SliderTrack>
          <SliderThumb />
        </Slider>
        
        <Text fontSize="xs" color="gray.600" minW="40px" textAlign="right">
          {formatTime(currentTime)} / {formatTime(duration)}
        </Text>
      </Flex>
    </Box>
  );
};

export default AudioPlayer;
