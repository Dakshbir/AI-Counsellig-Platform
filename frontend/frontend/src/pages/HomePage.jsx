import {
  Box,
  Flex,
  Heading,
  Text,
  Button,
  Image,
  Stack,
  Icon,
  useColorModeValue,
  Container,
  SimpleGrid,
} from '@chakra-ui/react';
import { FiFileText, FiMessageCircle, FiMap } from 'react-icons/fi';
import { Link as RouterLink } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function HomePage() {
  const { isAuthenticated } = useAuth();

  return (
    <Box>
      {/* Hero Section */}
      <Box bg={useColorModeValue('gray.50', 'gray.900')} px={8} py={24}>
        <Flex
          align="center"
          justify={{ base: 'center', md: 'space-between', xl: 'space-between' }}
          direction={{ base: 'column-reverse', md: 'row' }}
          wrap="no-wrap"
          minH="70vh"
          px={8}
          mb={16}
        >
          <Stack
            spacing={4}
            w={{ base: '80%', md: '40%' }}
            align={['center', 'center', 'flex-start', 'flex-start']}
          >
            <Heading
              as="h1"
              size="xl"
              fontWeight="bold"
              color={useColorModeValue('gray.700', 'white')}
              textAlign={['center', 'center', 'left', 'left']}
            >
              AI-Powered Career Counseling
            </Heading>
            <Heading
              as="h2"
              size="md"
              color={useColorModeValue('brand.500', 'brand.300')}
              opacity="0.8"
              fontWeight="normal"
              lineHeight={1.5}
              textAlign={['center', 'center', 'left', 'left']}
            >
              Get personalized career guidance based on your psychometric profile
            </Heading>
            <Text
              fontSize="lg"
              color={useColorModeValue('gray.600', 'gray.400')}
              textAlign={['center', 'center', 'left', 'left']}
            >
              Upload your psychometric test results and chat with our AI counselor to discover the perfect career path for your unique skills and interests.
            </Text>
            <Stack direction={{ base: 'column', sm: 'row' }} spacing={4} mt={2}>
              {isAuthenticated ? (
                <Button
                  as={RouterLink}
                  to="/dashboard"
                  colorScheme="blue"
                  size="lg"
                >
                  Go to Dashboard
                </Button>
              ) : (
                <>
                  <Button
                    as={RouterLink}
                    to="/register"
                    colorScheme="blue"
                    size="lg"
                  >
                    Get Started
                  </Button>
                  <Button
                    as={RouterLink}
                    to="/login"
                    variant="outline"
                    colorScheme="blue"
                    size="lg"
                  >
                    Sign In
                  </Button>
                </>
              )}
            </Stack>
          </Stack>
          <Box w={{ base: '80%', sm: '60%', md: '50%' }} mb={{ base: 12, md: 0 }}>
            <Image
              src="https://images.unsplash.com/photo-1552664730-d307ca884978?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2340&q=80"
              rounded="1rem"
              shadow="2xl"
              alt="Career Counseling"
            />
          </Box>
        </Flex>
      </Box>

      {/* Features Section */}
      <Box py={20}>
        <Container maxW={'5xl'}>
          <Heading
            textAlign={'center'}
            fontSize={'4xl'}
            py={10}
            fontWeight={'bold'}
          >
            How It Works
          </Heading>
          <SimpleGrid columns={{ base: 1, md: 3 }} spacing={10}>
            <Feature
              icon={<Icon as={FiFileText} w={10} h={10} />}
              title={'Upload Psychometric Tests'}
              text={
                'Upload your psychometric test results to our platform. Our system analyzes your interests, skills, personality type, and aptitude.'
              }
            />
            <Feature
              icon={<Icon as={FiMessageCircle} w={10} h={10} />}
              title={'AI Counseling Sessions'}
              text={
                'Book a session with our AI counselor. Get personalized guidance based on your psychometric profile and ask career-related questions.'
              }
            />
            <Feature
              icon={<Icon as={FiMap} w={10} h={10} />}
              title={'Personalized Career Roadmap'}
              text={
                'Receive a detailed career roadmap tailored to your profile. Includes short and long-term goals, educational requirements, and skill development recommendations.'
              }
            />
          </SimpleGrid>
        </Container>
      </Box>

      {/* CTA Section */}
      <Box bg={useColorModeValue('brand.500', 'brand.600')} color="white">
        <Container maxW={'5xl'} py={16} textAlign="center">
          <Heading fontSize={'4xl'} mb={4}>
            Ready to discover your ideal career path?
          </Heading>
          <Text fontSize={'xl'} mb={6}>
            Join thousands of students who have found their perfect career match with our AI counseling platform.
          </Text>
          {isAuthenticated ? (
            <Button
              as={RouterLink}
              to="/dashboard"
              bg="white"
              color="brand.500"
              size="lg"
              _hover={{ bg: 'gray.100' }}
            >
              Go to Dashboard
            </Button>
          ) : (
            <Button
              as={RouterLink}
              to="/register"
              bg="white"
              color="brand.500"
              size="lg"
              _hover={{ bg: 'gray.100' }}
            >
              Get Started Now
            </Button>
          )}
        </Container>
      </Box>
    </Box>
  );
}

const Feature = ({ title, text, icon }) => {
  return (
    <Stack align={'center'} textAlign={'center'}>
      <Flex
        w={16}
        h={16}
        align={'center'}
        justify={'center'}
        color={'white'}
        rounded={'full'}
        bg={'brand.500'}
        mb={1}
      >
        {icon}
      </Flex>
      <Text fontWeight={600} fontSize={'xl'}>
        {title}
      </Text>
      <Text color={'gray.600'}>{text}</Text>
    </Stack>
  );
};
