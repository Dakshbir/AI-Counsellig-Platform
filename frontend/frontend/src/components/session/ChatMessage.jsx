import { Box, Text, Flex } from '@chakra-ui/react';
import AudioPlayer from './AudioPlayer';
import { formatTime } from '../../utils/dateUtils';

const ChatMessage = ({ message, isUser, timestamp, audio }) => {
  return (
    <Box
      className={`chat-message ${isUser ? 'user-message' : 'ai-message'}`}
      alignSelf={isUser ? 'flex-end' : 'flex-start'}
      maxW="80%"
    >
      <Text>{message}</Text>
      
      {audio && !isUser && (
        <Box mt={2}>
          <AudioPlayer audioData={audio} />
        </Box>
      )}
      
      <Flex justifyContent="flex-end" mt={1}>
        <Text fontSize="xs" color={isUser ? "whiteAlpha.700" : "gray.500"}>
          {timestamp ? formatTime(timestamp) : formatTime(new Date())}
        </Text>
      </Flex>
    </Box>
  );
};

export default ChatMessage;
