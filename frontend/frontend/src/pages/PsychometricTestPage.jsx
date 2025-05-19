import { useState, useEffect } from 'react';
import {
  Box,
  Heading,
  Text,
  Tabs,
  TabList,
  TabPanels,
  Tab,
  TabPanel,
  Button,
  useToast,
  Alert,
  AlertIcon,
  AlertTitle,
  AlertDescription,
} from '@chakra-ui/react';
import { useAuth } from '../context/AuthContext';
import PageHeader from '../components/common/PageHeader';
import LoadingSpinner from '../components/common/LoadingSpinner';
import UploadForm from '../components/psychometric/UploadForm';
import PsychometricDataDisplay from '../components/psychometric/PsychometricDataDisplay';
import { psychometricApi } from '../services/api';
import axios from 'axios';

export default function PsychometricTestPage() {
  const { user } = useAuth();
  const [psychometricData, setPsychometricData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const toast = useToast();

  useEffect(() => {
    const fetchPsychometricData = async () => {
      try {
        setLoading(true);
        
        // This endpoint might not exist yet - you'll need to create it
        const response = await axios.get('/api/reports/psychometric/latest');
        setPsychometricData(response.data);
      } catch (err) {
        // It's okay if this fails, we'll just show the upload form
        console.log('No psychometric data found');
      } finally {
        setLoading(false);
      }
    };

    fetchPsychometricData();
  }, []);

  const handleUploadSuccess = (data) => {
    setPsychometricData(data);
  };

  const handleGenerateRoadmap = async () => {
    try {
      setLoading(true);
      
      const response = await psychometricApi.generateRoadmap();
      
      toast({
        title: 'Roadmap generated',
        description: 'Your career roadmap has been generated successfully',
        status: 'success',
        duration: 3000,
        isClosable: true,
      });
    } catch (error) {
      toast({
        title: 'Failed to generate roadmap',
        description: error.response?.data?.detail || 'An error occurred',
        status: 'error',
        duration: 5000,
        isClosable: true,
      });
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <LoadingSpinner />;
  }

  return (
    <Box>
      <PageHeader 
        title="Psychometric Test" 
        subtitle="Upload and analyze your psychometric test results"
      />
      
      <Tabs variant="enclosed" colorScheme="brand">
        <TabList>
          <Tab>Upload Test</Tab>
          <Tab isDisabled={!psychometricData}>View Results</Tab>
        </TabList>
        <TabPanels>
          <TabPanel>
            {psychometricData ? (
              <Alert status="success" mb={6} borderRadius="md">
                <AlertIcon />
                <Box>
                  <AlertTitle>Test already uploaded!</AlertTitle>
                  <AlertDescription>
                    You've already uploaded a psychometric test. You can view your results or upload a new test to replace the existing one.
                  </AlertDescription>
                </Box>
              </Alert>
            ) : (
              <Alert status="info" mb={6} borderRadius="md">
                <AlertIcon />
                <Box>
                  <AlertTitle>Upload your test results</AlertTitle>
                  <AlertDescription>
                    Upload your psychometric test results in PDF format to get personalized career guidance.
                  </AlertDescription>
                </Box>
              </Alert>
            )}
            
            <UploadForm onUploadSuccess={handleUploadSuccess} />
          </TabPanel>
          <TabPanel>
            <PsychometricDataDisplay data={psychometricData} />
            
            <Box mt={8} textAlign="center">
              <Button
                colorScheme="brand"
                size="lg"
                onClick={handleGenerateRoadmap}
                isLoading={loading}
              >
                Generate Career Roadmap
              </Button>
              <Text mt={2} fontSize="sm" color="gray.600">
                Create a personalized career roadmap based on your psychometric profile
              </Text>
            </Box>
          </TabPanel>
        </TabPanels>
      </Tabs>
    </Box>
  );
}
