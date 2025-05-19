import { useState, useEffect } from 'react';
import {
  Box,
  SimpleGrid,
  Button,
  Flex,
  useToast,
  Text,
} from '@chakra-ui/react';
import { Link as RouterLink } from 'react-router-dom';
import { FiCalendar, FiFileText, FiMap, FiMessageCircle } from 'react-icons/fi';
import { useAuth } from '../context/AuthContext';
import { sessionApi, psychometricApi } from '../services/api';
import PageHeader from '../components/common/PageHeader';
import LoadingSpinner from '../components/common/LoadingSpinner';
import ErrorAlert from '../components/common/ErrorAlert';
import DashboardCard from '../components/dashboard/DashboardCard';
import StatsCard from '../components/dashboard/StatsCard';
import SessionsList from '../components/dashboard/SessionsList';
import CareerRoadmapCard from '../components/roadmap/CareerRoadmapCard';
import axios from 'axios';

export default function DashboardPage() {
  const { user } = useAuth();
  const [sessions, setSessions] = useState([]);
  const [roadmaps, setRoadmaps] = useState([]);
  const [psychometricData, setPsychometricData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const toast = useToast();

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        setLoading(true);
        
        // Fetch sessions
        const sessionsResponse = await sessionApi.getMySessions();
        setSessions(sessionsResponse.data);
        
        // Fetch roadmaps
        const roadmapsResponse = await psychometricApi.getRoadmaps();
        setRoadmaps(roadmapsResponse.data);
        
        // For psychometric data, we'd need an endpoint to fetch the latest
        // This is a placeholder assuming such an endpoint exists
        try {
          // This endpoint might not exist yet
          const psychometricResponse = await axios.get('/api/reports/psychometric/latest');
          setPsychometricData(psychometricResponse.data);
        } catch (err) {
          // It's okay if this fails, we'll just show a prompt to upload
          console.log('No psychometric data found');
        }
        
      } catch (err) {
        setError('Failed to load dashboard data. Please try again later.');
        console.error('Dashboard data fetch error:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, []);

  if (loading) {
    return <LoadingSpinner />;
  }

  // Get upcoming sessions (scheduled)
  const upcomingSessions = sessions.filter(s => s.status === 'scheduled');
  
  // Get completed sessions
  const completedSessions = sessions.filter(s => s.status === 'completed');

  return (
    <Box>
      <PageHeader 
        title={`Welcome, ${user?.full_name || 'Student'}!`} 
        subtitle="Track your progress and manage your career counseling journey"
      />
      
      {error && <ErrorAlert description={error} />}
      
      <SimpleGrid columns={{ base: 1, md: 3 }} spacing={6} mb={8}>
        <StatsCard
          title="Upcoming Sessions"
          stat={upcomingSessions.length}
          icon={FiCalendar}
          description="Scheduled counseling sessions"
        />
        <StatsCard
          title="Completed Sessions"
          stat={completedSessions.length}
          icon={FiMessageCircle}
          description="Past counseling sessions"
        />
        <StatsCard
          title="Career Roadmaps"
          stat={roadmaps.length}
          icon={FiMap}
          description="Personalized career paths"
        />
      </SimpleGrid>
      
      <SimpleGrid columns={{ base: 1, md: 2 }} spacing={6}>
        <DashboardCard
          title="Psychometric Profile"
          icon={FiFileText}
          action={
            <Button
              as={RouterLink}
              to="/psychometric-test"
              colorScheme="brand"
              size="sm"
            >
              {psychometricData ? 'View Details' : 'Upload Test'}
            </Button>
          }
        >
          {psychometricData ? (
            <Box>
              <Text mb={2}>Your psychometric profile is complete!</Text>
              <Flex wrap="wrap" gap={2} mb={2}>
                {psychometricData.interests?.slice(0, 3).map((interest, index) => (
                  <Text key={index} p={1} bg="blue.50" borderRadius="md" fontSize="sm">
                    {interest}
                  </Text>
                ))}
              </Flex>
              <Text fontWeight="bold">Personality Type: {psychometricData.personality_type}</Text>
            </Box>
          ) : (
            <Text>
              Upload your psychometric test results to get personalized career guidance.
            </Text>
          )}
        </DashboardCard>
        
        <DashboardCard
          title="Upcoming Sessions"
          icon={FiCalendar}
          action={
            <Button
              as={RouterLink}
              to="/book-session"
              colorScheme="brand"
              size="sm"
            >
              Book New
            </Button>
          }
        >
          <SessionsList 
            sessions={upcomingSessions.slice(0, 3)} 
            emptyMessage="No upcoming sessions. Book a new session to get started."
          />
        </DashboardCard>
        
        <DashboardCard
          title="Career Roadmap"
          icon={FiMap}
          action={
            <Button
              as={RouterLink}
              to="/career-roadmap"
              colorScheme="brand"
              size="sm"
            >
              View All
            </Button>
          }
        >
          {roadmaps.length > 0 ? (
            <CareerRoadmapCard roadmap={roadmaps[0]} />
          ) : (
            <Text>
              Generate a personalized career roadmap based on your psychometric profile.
            </Text>
          )}
        </DashboardCard>
        
        <DashboardCard
          title="Recent Sessions"
          icon={FiMessageCircle}
          action={
            <Button
              as={RouterLink}
              to="/dashboard"
              colorScheme="brand"
              size="sm"
            >
              View All
            </Button>
          }
        >
          <SessionsList 
            sessions={completedSessions.slice(0, 3)} 
            emptyMessage="No completed sessions yet."
          />
        </DashboardCard>
      </SimpleGrid>
    </Box>
  );
}
