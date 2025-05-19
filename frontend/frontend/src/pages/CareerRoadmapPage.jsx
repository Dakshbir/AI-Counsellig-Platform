import { useState, useEffect } from 'react';
import {
  Box,
  Heading,
  Text,
  Button,
  SimpleGrid,
  VStack,
  Divider,
  Alert,
  AlertIcon,
  AlertTitle,
  AlertDescription,
  useToast,
  Card,
  CardBody,
} from '@chakra-ui/react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { FiArrowRight, FiBook, FiTarget, FiTrendingUp, FiAward, FiAlertTriangle } from 'react-icons/fi';
import { useAuth } from '../context/AuthContext';
import PageHeader from '../components/common/PageHeader';
import LoadingSpinner from '../components/common/LoadingSpinner';
import ErrorAlert from '../components/common/ErrorAlert';
import RoadmapSection from '../components/roadmap/RoadmapSection';
import CareerRoadmapCard from '../components/roadmap/CareerRoadmapCard';
import { psychometricApi } from '../services/api';
import { formatDate } from '../utils/dateUtils';

export default function CareerRoadmapPage() {
  const { user } = useAuth();
  const [roadmaps, setRoadmaps] = useState([]);
  const [selectedRoadmap, setSelectedRoadmap] = useState(null);
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);
  const [error, setError] = useState(null);
  const [searchParams] = useSearchParams();
  const toast = useToast();
  const navigate = useNavigate();
  
  // Get roadmap ID from URL if present
  const roadmapId = searchParams.get('id');

  useEffect(() => {
    const fetchRoadmaps = async () => {
      try {
        setLoading(true);
        const response = await psychometricApi.getRoadmaps();
        setRoadmaps(response.data);
        
        // If roadmapId is in URL, select that roadmap
        if (roadmapId && response.data.length > 0) {
          const roadmap = response.data.find(r => r.id === parseInt(roadmapId));
          if (roadmap) {
            setSelectedRoadmap(roadmap);
          } else {
            // If roadmap not found, select the most recent one
            setSelectedRoadmap(response.data[0]);
          }
        } else if (response.data.length > 0) {
          // Otherwise select the most recent roadmap
          setSelectedRoadmap(response.data[0]);
        }
      } catch (err) {
        setError('Failed to load career roadmaps. Please try again later.');
        console.error('Roadmaps fetch error:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchRoadmaps();
  }, [roadmapId]);

  const handleGenerateRoadmap = async () => {
    try {
      setGenerating(true);
      
      const response = await psychometricApi.generateRoadmap();
      
      toast({
        title: 'Roadmap generated',
        description: 'Your career roadmap has been generated successfully',
        status: 'success',
        duration: 3000,
        isClosable: true,
      });
      
      // Add new roadmap to list and select it
      setRoadmaps(prev => [response.data, ...prev]);
      setSelectedRoadmap(response.data);
    } catch (error) {
      toast({
        title: 'Failed to generate roadmap',
        description: error.response?.data?.detail || 'An error occurred',
        status: 'error',
        duration: 5000,
        isClosable: true,
      });
    } finally {
      setGenerating(false);
    }
  };

  if (loading) {
    return <LoadingSpinner />;
  }

  // If no roadmaps, show prompt to generate one
  if (roadmaps.length === 0) {
    return (
      <Box>
        <PageHeader 
          title="Career Roadmap" 
          subtitle="Generate a personalized career path based on your psychometric profile"
        />
        
        <Alert status="info" mb={6} borderRadius="md">
          <AlertIcon />
          <Box>
            <AlertTitle>No roadmaps found</AlertTitle>
            <AlertDescription>
              You haven't generated any career roadmaps yet. Generate one now to get personalized guidance.
            </AlertDescription>
          </Box>
        </Alert>
        
        <Box textAlign="center" py={10}>
          <Button
            colorScheme="brand"
            size="lg"
            onClick={handleGenerateRoadmap}
            isLoading={generating}
            loadingText="Generating..."
          >
            Generate Career Roadmap
          </Button>
        </Box>
      </Box>
    );
  }

  return (
    <Box>
      <PageHeader 
        title="Career Roadmap" 
        subtitle="Your personalized career path based on psychometric analysis"
      />
      
      {roadmaps.length > 1 && (
        <Box mb={8}>
          <Heading size="md" mb={4}>Your Roadmaps</Heading>
          <SimpleGrid columns={{ base: 1, md: 2, lg: 3 }} spacing={4}>
            {roadmaps.map(roadmap => (
              <Box
                key={roadmap.id}
                onClick={() => setSelectedRoadmap(roadmap)}
                cursor="pointer"
                opacity={selectedRoadmap?.id === roadmap.id ? 1 : 0.7}
                transition="all 0.2s"
                _hover={{ opacity: 1 }}
              >
                <CareerRoadmapCard roadmap={roadmap} />
              </Box>
            ))}
            
            <Card>
              <CardBody display="flex" alignItems="center" justifyContent="center">
                <Button
                  colorScheme="brand"
                  variant="outline"
                  onClick={handleGenerateRoadmap}
                  isLoading={generating}
                  loadingText="Generating..."
                >
                  Generate New Roadmap
                </Button>
              </CardBody>
            </Card>
          </SimpleGrid>
        </Box>
      )}
      
      {selectedRoadmap && (
        <Box>
          <Heading size="md" mb={2}>
            Career Roadmap
          </Heading>
          <Text color="gray.600" mb={6}>
            Generated on {formatDate(selectedRoadmap.created_at)}
          </Text>
          
          <SimpleGrid columns={{ base: 1, lg: 2 }} spacing={8}>
            <RoadmapSection 
              title="Short-term Goals (1-2 years)"
              content={selectedRoadmap.roadmap_data.short_term_goals}
              icon={FiTarget}
            />
            
            <RoadmapSection 
              title="Medium-term Goals (3-5 years)"
              content={selectedRoadmap.roadmap_data.medium_term_goals}
              icon={FiTrendingUp}
            />
            
            <RoadmapSection 
              title="Long-term Career Path"
              content={selectedRoadmap.roadmap_data.long_term_career_path}
              icon={FiArrowRight}
            />
            
            <RoadmapSection 
              title="Educational Requirements"
              content={selectedRoadmap.roadmap_data.educational_requirements}
              icon={FiBook}
            />
            
            <RoadmapSection 
              title="Skill Development Recommendations"
              content={selectedRoadmap.roadmap_data.skill_development}
              icon={FiAward}
            />
            
            <RoadmapSection 
              title="Potential Challenges and Solutions"
              content={selectedRoadmap.roadmap_data.potential_challenges}
              icon={FiAlertTriangle}
            />
          </SimpleGrid>
          
          <Divider my={8} />
          
          <Box textAlign="center">
            <Button
              colorScheme="brand"
              size="lg"
              onClick={handleGenerateRoadmap}
              isLoading={generating}
              loadingText="Generating..."
            >
              Generate New Roadmap
            </Button>
            <Text mt={2} fontSize="sm" color="gray.500">
              Generate a new roadmap based on your latest psychometric data
            </Text>
          </Box>
        </Box>
      )}
    </Box>
  );
}
