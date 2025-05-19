import { Box, Stat, StatLabel, StatNumber, StatHelpText, Flex, Icon } from '@chakra-ui/react';

const StatsCard = ({ title, stat, icon, description }) => {
  return (
    <Box
      bg="white"
      borderRadius="lg"
      boxShadow="md"
      p={5}
    >
      <Flex justifyContent="space-between">
        <Box>
          <StatLabel fontWeight="medium" isTruncated>
            {title}
          </StatLabel>
          <StatNumber fontSize="3xl" fontWeight="bold">
            {stat}
          </StatNumber>
          <StatHelpText>
            {description}
          </StatHelpText>
        </Box>
        <Flex
          alignItems="center"
          justifyContent="center"
          rounded="full"
          bg="brand.100"
          color="brand.500"
          boxSize={16}
        >
          <Icon as={icon} boxSize={8} />
        </Flex>
      </Flex>
    </Box>
  );
};

export default StatsCard;
