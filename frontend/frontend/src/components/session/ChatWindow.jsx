import { useRef, useEffect } from 'react';
import { Box, Flex, Text, Button, Input, IconButton } from '@chakra-ui/react';
import { FiSend, FiMic, FiMicOff } from 'react-icons/fi';
import ChatMessage from './ChatMessage';

const ChatWindow = ({
  messages,
  newMessage,
  setNewMessage,
  sendMessage,
  isTyping,
  isConnected,
  isRecording,
  toggleRecording,
}) => {
  const messagesEndRef = useRef(null);

  // Scroll to bottom when messages change
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSend = (e) => {
    e.preventDefault();
    if (newMessage.trim() && isConnected) {
      sendMessage(newMessage);
      setNewMessage('');
    }
  };

  return (
    <Box
      border="1px"
      borderColor="gray.200"
      borderRadius="md"
      overflow="hidden"
      height="70vh"
      display="flex"
      flexDirection="column"
    >
      {/* Chat messages */}
      <Box
        flex="1"
        overflowY="auto"
        p={4}
        bg="gray.50"
        className="chat-window"
      >
        {messages.map((msg, index) => (
          <ChatMessage
            key={index}
            message={msg.text}
            isUser={msg.isUser}
            timestamp={msg.timestamp}
            audio={msg.audio}
          />
        ))}
        
        {isTyping && (
          <Flex align="center" className="typing-indicator">
            <Text fontSize="sm" color="gray.500" mr={2}>
              AI is typing
            </Text>
            <Box className="typing-dot" />
            <Box className="typing-dot" />
            <Box className="typing-dot" />
          </Flex>
        )}
        
        <div ref={messagesEndRef} />
      </Box>
      
      {/* Input area */}
      <Box p={3} bg="white" borderTop="1px" borderColor="gray.200">
        <form onSubmit={handleSend}>
          <Flex>
            <IconButton
              icon={isRecording ? <FiMicOff /> : <FiMic />}
              aria-label={isRecording ? "Stop recording" : "Start recording"}
              onClick={toggleRecording}
              colorScheme={isRecording ? "red" : "gray"}
              variant="ghost"
              mr={2}
            />
            <Input
              placeholder="Type your message..."
              value={newMessage}
              onChange={(e) => setNewMessage(e.target.value)}
              disabled={!isConnected}
            />
            <Button
              ml={2}
              colorScheme="brand"
              type="submit"
              disabled={!newMessage.trim() || !isConnected}
              leftIcon={<FiSend />}
            >
              Send
            </Button>
          </Flex>
        </form>
      </Box>
    </Box>
  );
};

export default ChatWindow;
