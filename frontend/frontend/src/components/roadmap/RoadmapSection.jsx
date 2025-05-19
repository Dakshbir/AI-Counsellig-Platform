import { Box, Heading, Text, List, ListItem, ListIcon } from '@chakra-ui/react';
import { FiCheckCircle } from 'react-icons/fi';

const RoadmapSection = ({ title, content, icon }) => {
  // Handle different content types (string, array, object)
  const renderContent = () => {
    if (!content) return null;
    
    if (typeof content === 'string') {
      return <Text whiteSpace="pre-line">{content}</Text>;
    }
    
    if (Array.isArray(content)) {
      return (
        <List spacing={2} mt={2}>
          {content.map((item, index) => (
            <ListItem key={index} display="flex">
              <ListIcon as={FiCheckCircle} color="brand.500" mt={1} />
              <Text>{item}</Text>
            </ListItem>
          ))}
        </List>
      );
    }
    
    if (typeof content === 'object') {
      return (
        <Box>
          {Object.entries(content).map(([key, value]) => (
            <Box key={key} mb={3}>
              <Text fontWeight="bold">{key}:</Text>
              {typeof value === 'string' ? (
                <Text ml={4}>{value}</Text>
              ) : (
                <List spacing={1} ml={4}>
                  {Array.isArray(value) && value.map((item, index) => (
                    <ListItem key={index} display="flex">
                      <ListIcon as={FiCheckCircle} color="brand.500" mt={1} />
                      <Text>{item}</Text>
                    </ListItem>
                  ))}
                </List>
              )}
            </Box>
          ))}
        </Box>
      );
    }
    
    return null;
  };

  return (
    <Box mb={6}>
      <Heading as="h3" size="md" mb={3} display="flex" alignItems="center">
        {icon && <Box as={icon} mr={2} />}
        {title}
      </Heading>
      {renderContent()}
    </Box>
  );
};

export default RoadmapSection;
