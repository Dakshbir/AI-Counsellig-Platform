import { Box, Text, Badge, Flex, Button, Divider } from '@chakra-ui/react';
import { Link as RouterLink } from 'react-router-dom';
import { formatDate, isToday, isFuture } from '../../utils/dateUtils';
import { getStatusColor } from '../../utils/formatUtils';

const SessionsList = ({ sessions, emptyMessage = "No sessions found" }) => {
  if (!sessions || sessions.length === 0) {
    return (
      <Box textAlign="center" py={4}>
        <Text color="gray.500">{emptyMessage}</Text>
      </Box>
    );
  }

  return (
    <Box>
      {sessions.map((session, index) => (
        <Box key={session.id} mb={4}>
          <Flex justifyContent="space-between" alignItems="center" mb={2}>
            <Box>
              <Text fontWeight="bold">
                {isToday(session.scheduled_time) ? 'Today' : formatDate(session.scheduled_time)}
              </Text>
              <Badge colorScheme={getStatusColor(session.status)}>
                {session.status}
              </Badge>
            </Box>
            <Button
              as={RouterLink}
              to={`/session/${session.id}`}
              size="sm"
              colorScheme="brand"
              variant="outline"
            >
              {isFuture(session.scheduled_time) ? 'Join' : 'View'}
            </Button>
          </Flex>
          <Text color="gray.600" fontSize="sm">
            {session.session_type} Counseling Session
          </Text>
          {index < sessions.length - 1 && <Divider my={3} />}
        </Box>
      ))}
    </Box>
  );
};

export default SessionsList;
