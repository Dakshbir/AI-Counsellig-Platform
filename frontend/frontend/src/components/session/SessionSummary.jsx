import {
  Box,
  Heading,
  Text,
  Divider,
  Button,
  VStack,
  Badge,
  Flex,
  Icon,
  useClipboard,
  useToast,
} from '@chakra-ui/react';
import { FiDownload, FiCopy, FiCheck } from 'react-icons/fi';
import { formatDate } from '../../utils/dateUtils';

const SessionSummary = ({ session }) => {
  const { hasCopied, onCopy } = useClipboard(session?.transcript || '');
  const toast = useToast();
  
  if (!session) {
    return (
      <Box textAlign="center" py={6}>
        <Text color="gray.500">No session data available</Text>
      </Box>
    );
  }

  const handleDownload = () => {
    // Create a blob with the transcript
    const blob = new Blob([session.transcript], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    
    // Create a link and trigger download
    const a = document.createElement('a');
    a.href = url;
    a.download = `session-${session.id}-transcript.txt`;
    document.body.appendChild(a);
    a.click();
    
    // Cleanup
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    
    toast({
      title: 'Transcript downloaded',
      status: 'success',
      duration: 2000,
    });
  };

  return (
    <VStack spacing={6} align="stretch">
      <Box>
        <Heading size="md" mb={2}>
          Session Summary
        </Heading>
        <Flex align="center" mb={4}>
          <Badge colorScheme="green" mr={2}>
            {session.session_type} Session
          </Badge>
          <Text fontSize="sm" color="gray.500">
            {formatDate(session.scheduled_time)}
          </Text>
        </Flex>
        <Divider mb={4} />
        <Text whiteSpace="pre-line">{session.summary}</Text>
      </Box>
      
      {session.transcript && (
        <Box>
          <Flex justify="space-between" align="center" mb={2}>
            <Heading size="md">
              Transcript
            </Heading>
            <Flex>
              <Button
                size="sm"
                leftIcon={<Icon as={FiCopy} />}
                onClick={onCopy}
                mr={2}
              >
                {hasCopied ? 'Copied' : 'Copy'}
              </Button>
              <Button
                size="sm"
                leftIcon={<Icon as={FiDownload} />}
                onClick={handleDownload}
              >
                Download
              </Button>
            </Flex>
          </Flex>
          <Divider mb={4} />
          <Box
            p={4}
            bg="gray.50"
            borderRadius="md"
            maxH="400px"
            overflowY="auto"
            whiteSpace="pre-line"
            fontSize="sm"
          >
            {session.transcript}
          </Box>
        </Box>
      )}
      
      {session.recording_url && (
        <Box>
          <Heading size="md" mb={2}>
            Session Recording
          </Heading>
          <Divider mb={4} />
          <Button
            leftIcon={<Icon as={FiDownload} />}
            colorScheme="brand"
            as="a"
            href={session.recording_url}
            target="_blank"
          >
            Download Recording
          </Button>
        </Box>
      )}
    </VStack>
  );
};

export default SessionSummary;
