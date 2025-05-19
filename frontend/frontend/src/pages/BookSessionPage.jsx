import { useState } from 'react';
import {
  Box,
  Heading,
  Text,
  SimpleGrid,
  Card,
  CardBody,
  Icon,
  VStack,
  Alert,
  AlertIcon,
  AlertTitle,
  AlertDescription,
  useToast,
  Button,
} from '@chakra-ui/react';
import { FiCalendar, FiMessageCircle, FiUser, FiClock } from 'react-icons/fi';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import PageHeader from '../components/common/PageHeader';
import BookingForm from '../components/session/BookingForm';
import axios from 'axios';

export default function BookSessionPage() {
  const { user } = useAuth();
  const [hasPsychometricData, setHasPsychometricData] = useState(null);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const toast = useToast();

  // Check if user has uploaded psychometric data
  useState(() => {
    const checkPsychometricData = async () => {
      try {
        // This endpoint might not exist yet
        await axios.get('/api/reports/psychometric/latest');
        setHasPsychometricData(true);
      } catch (err) {
        setHasPsychometricData(false);
      }
    };

    checkPsychometricData();
  }, []);

  const handleBookingSuccess = (session) => {
    toast({
      title: 'Session booked',
      description: 'Your counseling session has been scheduled successfully',
      status: 'success',
      duration: 5000,
      isClosable: true,
    });
    
    // Navigate to dashboard or session details
    navigate('/dashboard');
  };

  return (
    <Box>
      <PageHeader 
        title="Book a Counseling Session" 
        subtitle="Schedule a session with our AI or human counselors"
      />
      
      {hasPsychometricData === false && (
        <Alert status="warning" mb={6} borderRadius="md">
          <AlertIcon />
          <Box>
            <AlertTitle>No psychometric data found</AlertTitle>
            <AlertDescription>
              For the best counseling experience, we recommend uploading your psychometric test results first.
              <Button
                ml={4}
                size="sm"
                colorScheme="blue"
                onClick={() => navigate('/psychometric-test')}
              >
                Upload Test
              </Button>
            </AlertDescription>
          </Box>
        </Alert>
      )}
      
      <SimpleGrid columns={{ base: 1, md: 2 }} spacing={8}>
        <Card>
          <CardBody>
            <VStack spacing={6} align="stretch">
              <Heading size="md">Schedule Your Session</Heading>
              <BookingForm onBookingSuccess={handleBookingSuccess} />
            </VStack>
          </CardBody>
        </Card>
        
        <VStack spacing={6} align="stretch">
          <Card>
            <CardBody>
              <Heading size="md" mb={4}>About Our Counseling Sessions</Heading>
              <Text>
                Our counseling sessions are designed to provide personalized career guidance based on your psychometric profile.
                Choose between AI-powered sessions available 24/7 or schedule a session with one of our human counselors.
              </Text>
            </CardBody>
          </Card>
          
          <SimpleGrid columns={2} spacing={4}>
            <SessionTypeCard 
              icon={FiMessageCircle} 
              title="AI Counselor" 
              description="Available 24/7, instant guidance based on your profile"
            />
            <SessionTypeCard 
              icon={FiUser} 
              title="Human Counselor" 
              description="Personalized guidance from experienced professionals"
            />
            <SessionTypeCard 
              icon={FiClock} 
              title="Session Duration" 
              description="30-45 minutes of focused career counseling"
            />
            <SessionTypeCard 
              icon={FiCalendar} 
              title="Availability" 
              description="Book sessions up to 2 weeks in advance"
            />
          </SimpleGrid>
        </VStack>
      </SimpleGrid>
    </Box>
  );
}

const SessionTypeCard = ({ icon, title, description }) => {
  return (
    <Card>
      <CardBody>
        <VStack spacing={3} align="center" textAlign="center">
          <Icon as={icon} boxSize={8} color="brand.500" />
          <Heading size="sm">{title}</Heading>
          <Text fontSize="sm">{description}</Text>
        </VStack>
      </CardBody>
    </Card>
  );
};
