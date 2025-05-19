import { Box, Heading, Text, Badge, Flex, Button, useColorModeValue } from '@chakra-ui/react';
import { Link as RouterLink } from 'react-router-dom';
import { formatDate } from '../../utils/dateUtils';

const CareerRoadmapCard = ({ roadmap, isDetailed = false }) => {
  const cardBg = useColorModeValue('white', 'gray.700');
  const cardHoverBg = useColorModeValue('gray.50', 'gray.600');
  
  if (!roadmap) return null;
  
  // Extract career fields from roadmap data
  const getCareerFields = () => {
    if (!roadmap.roadmap_data || !roadmap.roadmap_data.recommended_careers) {
      return [];
    }
    
    if (Array.isArray(roadmap.roadmap_data.recommended_careers)) {
      return roadmap.roadmap_data.recommended_careers.slice(0, 3);
    }
    
    return [];
  };
  
  const careerFields = getCareerFields();

  return (
    <Box
      p={5}
      shadow="md"
      borderWidth="1px"
      borderRadius="lg"
      bg={cardBg}
      transition="all 0.3s"
      className="roadmap-card"
      _hover={{ bg: cardHoverBg }}
    >
      <Flex justify="space-between" align="flex-start" mb={3}>
        <Heading fontSize="xl">Career Roadmap</Heading>
        <Text fontSize="sm" color="gray.500">
          {formatDate(roadmap.created_at)}
        </Text>
      </Flex>
      
      {careerFields.length > 0 && (
        <Box mb={4}>
          <Text fontWeight="bold" mb={2}>
            Top Career Paths:
          </Text>
          <Flex wrap="wrap" gap={2}>
            {careerFields.map((career, index) => (
              <Badge key={index} colorScheme="brand" fontSize="0.8em" p={1}>
                {career}
              </Badge>
            ))}
          </Flex>
        </Box>
      )}
      
      {isDetailed ? (
        <Box>
          {roadmap.roadmap_data.short_term_goals && (
            <Box mb={3}>
              <Text fontWeight="bold">Short-term Goals:</Text>
              <Text noOfLines={2}>{roadmap.roadmap_data.short_term_goals}</Text>
            </Box>
          )}
          
          {roadmap.roadmap_data.educational_requirements && (
            <Box mb={3}>
              <Text fontWeight="bold">Educational Requirements:</Text>
              <Text noOfLines={2}>{roadmap.roadmap_data.educational_requirements}</Text>
            </Box>
          )}
        </Box>
      ) : (
        <Button
          as={RouterLink}
          to={`/career-roadmap?id=${roadmap.id}`}
          colorScheme="brand"
          size="sm"
          mt={2}
        >
          View Full Roadmap
        </Button>
      )}
    </Box>
  );
};

export default CareerRoadmapCard;
