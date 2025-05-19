import { Box, Heading, Flex, Icon, Divider } from '@chakra-ui/react';

const DashboardCard = ({ title, icon, action, children }) => {
  return (
    <Box
      bg="white"
      borderRadius="lg"
      boxShadow="md"
      p={5}
      height="100%"
    >
      <Flex justifyContent="space-between" alignItems="center" mb={4}>
        <Flex alignItems="center">
          {icon && <Icon as={icon} mr={2} boxSize={5} color="brand.500" />}
          <Heading as="h3" size="md">
            {title}
          </Heading>
        </Flex>
        {action}
      </Flex>
      <Divider mb={4} />
      {children}
    </Box>
  );
};

export default DashboardCard;
