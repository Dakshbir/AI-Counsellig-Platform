import { useState, useEffect } from 'react';
import {
  Box,
  Heading,
  Text,
  Button,
  Flex,
  Badge,
  Alert,
  AlertIcon,
  AlertTitle,
  AlertDescription,
  useToast,
  Tabs,
  TabList,
  TabPanels,
  Tab,
  TabPanel,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalFooter,
  ModalBody,
  ModalCloseButton,
  useDisclosure,
} from '@chakra-ui/react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import PageHeader from '../components/common/PageHeader';
import LoadingSpinner from '../components/common/LoadingSpinner';
import ErrorAlert from '../components/common/ErrorAlert';
import ChatWindow from '../components/session/ChatWindow';
import SessionSummary from '../components/session/SessionSummary';
import useWebSocket from '../hooks/useWebSocket';
import { sessionApi } from '../services/api';
import { formatDate } from '../utils/dateUtils';
import { getStatusColor } from '../utils/formatUtils';

export default function CounselingSessionPage() {
  const { sessionId } = useParams();
  const { user } = useAuth();
  const [session, setSession] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [newMessage, setNewMessage] = useState('');
  const [chatMessages, setChatMessages] = useState([]);
  const [isRecording, setIsRecording] = useState(false);
  const { isOpen, onOpen, onClose } = useDisclosure();
  const toast = useToast();
  const navigate = useNavigate();
  
  // WebSocket connection for real-time chat
  const wsUrl = session?.status === 'in_progress' ? 
    `ws://localhost:8000/api/counseling/ws/${sessionId}` : null;
  
  const {
    isConnected,
    messages: wsMessages,
    error: wsError,
    isTyping,
    sendMessage,
  } = useWebSocket(wsUrl);

  // Fetch session details
  useEffect(() => {
    const fetchSession = async () => {
      try {
        setLoading(true);
        const response = await sessionApi.getSession(sessionId);
        setSession(response.data);
        
        // If session has interactions, fetch them
        if (response.data.status === 'completed') {
          const interactionsResponse = await sessionApi.getSessionInteractions(sessionId);
          
          // Convert interactions to chat messages format
          const formattedMessages = interactionsResponse.data.map(interaction => ({
            text: interaction.question,
            isUser: true,
            timestamp: interaction.timestamp,
          })).concat(interactionsResponse.data.map(interaction => ({
            text: interaction.answer,
            isUser: false,
            timestamp: interaction.timestamp,
          }))).sort((a, b) => new Date(a.timestamp) - new Date(b.timestamp));
          
          setChatMessages(formattedMessages);
        }
      } catch (err) {
        setError('Failed to load session. Please try again later.');
        console.error('Session fetch error:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchSession();
  }, [sessionId]);

  // Process WebSocket messages
  useEffect(() => {
    if (wsMessages.length > 0) {
      const newMessages = wsMessages.map(msg => ({
        text: msg.text,
        isUser: msg.type === 'user',
        audio: msg.audio,
        timestamp: new Date(),
      }));
      
      setChatMessages(prevMessages => [...prevMessages, ...newMessages]);
    }
  }, [wsMessages]);

  // Handle WebSocket errors
  useEffect(() => {
    if (wsError) {
      toast({
        title: 'Connection error',
        description: wsError,
        status: 'error',
        duration: 5000,
        isClosable: true,
      });
    }
  }, [wsError, toast]);

  const handleSendMessage = (message) => {
    if (message.trim() && isConnected) {
      sendMessage(message);
      
      // Add user message to chat (WebSocket will add AI response)
      setChatMessages(prevMessages => [
        ...prevMessages, 
        {
          text: message,
          isUser: true,
          timestamp: new Date(),
        }
      ]);
      
      setNewMessage('');
    }
  };

  const toggleRecording = () => {
    // This would integrate with browser's speech recognition API
    setIsRecording(!isRecording);
    
    if (!isRecording) {
      // Start recording
      toast({
        title: 'Recording started',
        description: 'Speak clearly into your microphone',
        status: 'info',
        duration: 2000,
      });
    } else {
      // Stop recording and process speech
      toast({
        title: 'Processing speech',
        status: 'info',
        duration: 2000,
      });
      
      // Simulate speech recognition result
      setTimeout(() => {
        const recognizedText = "Can you tell me more about careers in data science?";
        setNewMessage(recognizedText);
      }, 1500);
    }
  };

  const handleEndSession = async () => {
    try {
      const response = await sessionApi.endSession(sessionId);
      
      toast({
        title: 'Session ended',
        description: 'Your counseling session has been completed',
        status: 'success',
        duration: 3000,
        isClosable: true,
      });
      
      // Update local session state
      setSession(prev => ({
        ...prev,
        status: 'completed',
        summary: response.data.summary
      }));
      
      onClose();
    } catch (error) {
      toast({
        title: 'Failed to end session',
        description: error.response?.data?.detail || 'An error occurred',
        status: 'error',
        duration: 5000,
        isClosable: true,
      });
    }
  };

  if (loading) {
    return <LoadingSpinner />;
  }

  if (error || !session) {
    return <ErrorAlert title="Error" description={error || 'Session not found'} />;
  }

  const isActiveSession = session.status === 'in_progress' || session.status === 'scheduled';
  
  return (
    <Box>
      <PageHeader 
        title={`${session.session_type} Counseling Session`} 
        subtitle={`Scheduled for ${formatDate(session.scheduled_time)}`}
      />
      
      <Flex justify="space-between" align="center" mb={6}>
        <Badge colorScheme={getStatusColor(session.status)} fontSize="md" px={2} py={1}>
          {session.status}
        </Badge>
        
        {isActiveSession && (
          <Button colorScheme="red" onClick={onOpen}>
            End Session
          </Button>
        )}
      </Flex>
      
      {session.status === 'scheduled' && (
        <Alert status="info" mb={6} borderRadius="md">
          <AlertIcon />
          <Box>
            <AlertTitle>Session not started yet</AlertTitle>
            <AlertDescription>
              This session is scheduled for {formatDate(session.scheduled_time)}. 
              You can join the session at the scheduled time.
            </AlertDescription>
          </Box>
        </Alert>
      )}
      
      <Tabs variant="enclosed" colorScheme="brand">
        <TabList>
          <Tab>Conversation</Tab>
          {session.status === 'completed' && <Tab>Summary</Tab>}
        </TabList>
        <TabPanels>
          <TabPanel p={0} pt={4}>
            {isActiveSession ? (
              <ChatWindow
                messages={chatMessages}
                newMessage={newMessage}
                setNewMessage={setNewMessage}
                sendMessage={handleSendMessage}
                isTyping={isTyping}
                isConnected={isConnected}
                isRecording={isRecording}
                toggleRecording={toggleRecording}
              />
            ) : (
              <Box p={4} bg="gray.50" borderRadius="md">
                <Text>This session has ended. You can view the transcript and summary.</Text>
              </Box>
            )}
          </TabPanel>
          
          {session.status === 'completed' && (
            <TabPanel>
              <SessionSummary session={session} />
            </TabPanel>
          )}
        </TabPanels>
      </Tabs>
      
      {/* End Session Confirmation Modal */}
      <Modal isOpen={isOpen} onClose={onClose}>
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>End Session</ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            <Text>Are you sure you want to end this counseling session? This will generate a summary and save the transcript.</Text>
          </ModalBody>
          <ModalFooter>
            <Button variant="ghost" mr={3} onClick={onClose}>
              Cancel
            </Button>
            <Button colorScheme="red" onClick={handleEndSession}>
              End Session
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </Box>
  );
}
