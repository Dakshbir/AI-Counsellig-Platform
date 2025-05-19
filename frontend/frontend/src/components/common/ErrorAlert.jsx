import { Alert, AlertIcon, AlertTitle, AlertDescription } from '@chakra-ui/react';

const ErrorAlert = ({ title = 'Error', description = 'An error occurred. Please try again.' }) => {
  return (
    <Alert status="error" borderRadius="md" mb={4}>
      <AlertIcon />
      <AlertTitle mr={2}>{title}</AlertTitle>
      <AlertDescription>{description}</AlertDescription>
    </Alert>
  );
};

export default ErrorAlert;
