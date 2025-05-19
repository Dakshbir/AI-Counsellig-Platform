import {
  Box,
  Heading,
  Text,
  SimpleGrid,
  Badge,
  Progress,
  Divider,
  VStack,
  HStack,
  Link,
  Button,
  Icon,
} from '@chakra-ui/react';
import { FiDownload, FiExternalLink } from 'react-icons/fi';
import { formatDate } from '../../utils/dateUtils';

const PsychometricDataDisplay = ({ data }) => {
  if (!data) {
    return (
      <Box textAlign="center" py={6}>
        <Text color="gray.500">No psychometric data available</Text>
      </Box>
    );
  }

  return (
    <Box>
      <Heading size="md" mb={4}>
        Psychometric Profile
      </Heading>
      
      <Box mb={6}>
        <Text fontSize="sm" color="gray.500">
          Uploaded on {formatDate(data.uploaded_at)}
        </Text>
        {data.report_url && (
          <Link href={data.report_url} isExternal>
            <Button
              size="sm"
              leftIcon={<FiDownload />}
              variant="outline"
              colorScheme="brand"
              mt={2}
            >
              Download Original Report
            </Button>
          </Link>
        )}
      </Box>
      
      <Divider mb={6} />
      
      <SimpleGrid columns={{ base: 1, md: 2 }} spacing={6}>
        {/* Interests Section */}
        <Box>
          <Heading size="sm" mb={3}>
            Interests
          </Heading>
          <HStack spacing={2} flexWrap="wrap">
            {data.interests?.map((interest, index) => (
              <Badge key={index} colorScheme="blue" mb={2}>
                {interest}
              </Badge>
            ))}
          </HStack>
        </Box>
        
        {/* Skills Section */}
        <Box>
          <Heading size="sm" mb={3}>
            Skills
          </Heading>
          <HStack spacing={2} flexWrap="wrap">
            {data.skills?.map((skill, index) => (
              <Badge key={index} colorScheme="green" mb={2}>
                {skill}
              </Badge>
            ))}
          </HStack>
        </Box>
        
        {/* Personality Type */}
        <Box>
          <Heading size="sm" mb={3}>
            Personality Type
          </Heading>
          <Badge colorScheme="purple" fontSize="lg" p={2}>
            {data.personality_type || 'Not specified'}
          </Badge>
          {data.personality_type && (
            <Link href={`https://www.16personalities.com/${data.personality_type.toLowerCase()}-personality`} isExternal mt={2} display="inline-block">
              <Text fontSize="sm" color="brand.500">
                Learn more about this type <Icon as={FiExternalLink} boxSize={3} ml={1} />
              </Text>
            </Link>
          )}
        </Box>
        
        {/* Subjects Interested */}
        <Box>
          <Heading size="sm" mb={3}>
            Subjects Interested
          </Heading>
          <HStack spacing={2} flexWrap="wrap">
            {data.subjects_interested?.map((subject, index) => (
              <Badge key={index} colorScheme="orange" mb={2}>
                {subject}
              </Badge>
            ))}
          </HStack>
        </Box>
      </SimpleGrid>
      
      <Divider my={6} />
      
      {/* Aptitude Section */}
      <Box mb={6}>
        <Heading size="sm" mb={4}>
          Aptitude
        </Heading>
        <VStack spacing={4} align="stretch">
          {data.aptitude && Object.entries(data.aptitude).map(([key, value]) => (
            <Box key={key}>
              <HStack justify="space-between" mb={1}>
                <Text>{key.charAt(0).toUpperCase() + key.slice(1)}</Text>
                <Text fontWeight="bold">{value}%</Text>
              </HStack>
              <Progress value={value} colorScheme="brand" size="sm" borderRadius="md" />
            </Box>
          ))}
        </VStack>
      </Box>
      
      {/* Recommended Careers */}
      <Box>
        <Heading size="sm" mb={3}>
          Recommended Careers
        </Heading>
        <SimpleGrid columns={{ base: 1, sm: 2, md: 3 }} spacing={2}>
          {data.recommended_careers?.map((career, index) => (
            <Text key={index} p={2} bg="gray.50" borderRadius="md">
              {career}
            </Text>
          ))}
        </SimpleGrid>
      </Box>
    </Box>
  );
};

export default PsychometricDataDisplay;
