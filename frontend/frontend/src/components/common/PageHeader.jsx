import { Box, Heading, Text, Flex } from '@chakra-ui/react';

const PageHeader = ({ title, subtitle }) => {
  return (
    <Box mb={8}>
      <Heading as="h1" size="xl" mb={2}>
        {title}
      </Heading>
      {subtitle && (
        <Text color="gray.600" fontSize="lg">
          {subtitle}
        </Text>
      )}
    </Box>
  );
};

export default PageHeader;
