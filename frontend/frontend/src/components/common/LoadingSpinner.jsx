import { Flex, Spinner, Text } from '@chakra-ui/react';

const LoadingSpinner = ({ message = 'Loading...' }) => {
  return (
    <Flex
      direction="column"
      align="center"
      justify="center"
      h="100vh"
      w="100%"
    >
      <Spinner
        thickness="4px"
        speed="0.65s"
        emptyColor="gray.200"
        color="brand.500"
        size="xl"
      />
      <Text mt={4} fontSize="lg" color="gray.600">
        {message}
      </Text>
    </Flex>
  );
};

export default LoadingSpinner;
