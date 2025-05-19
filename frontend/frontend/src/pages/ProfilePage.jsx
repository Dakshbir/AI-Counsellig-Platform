import {
  Box,
  Button,
  FormControl,
  FormLabel,
  Input,
  VStack,
  Heading,
  Text,
  useToast,
  FormErrorMessage,
  Textarea,
  Divider,
  SimpleGrid,
  Card,
  CardBody,
  Flex,
  Avatar,
  Stat,
  StatLabel,
  StatNumber,
} from '@chakra-ui/react';
import { useState } from 'react';
import { useFormik } from 'formik';
import * as Yup from 'yup';
import { useAuth } from '../context/AuthContext';
import PageHeader from '../components/common/PageHeader';
import LoadingSpinner from '../components/common/LoadingSpinner';
import ErrorAlert from '../components/common/ErrorAlert';
import { formatDate } from '../utils/dateUtils';

export default function ProfilePage() {
  const { user, updateProfile, loading: authLoading } = useAuth();
  const [isEditing, setIsEditing] = useState(false);
  const toast = useToast();

  const formik = useFormik({
    initialValues: {
      full_name: user?.full_name || '',
      email: user?.email || '',
      grade_class: user?.grade_class || '',
      contact: user?.contact || '',
      expectations: user?.expectations || '',
    },
    validationSchema: Yup.object({
      full_name: Yup.string()
        .required('Full name is required')
        .min(2, 'Name must be at least 2 characters'),
      email: Yup.string()
        .email('Invalid email address')
        .required('Email is required'),
      grade_class: Yup.string()
        .required('Grade/Class is required'),
      contact: Yup.string()
        .required('Contact number is required'),
    }),
    onSubmit: async (values) => {
      try {
        await updateProfile(values);
        
        toast({
          title: 'Profile updated',
          description: 'Your profile has been updated successfully',
          status: 'success',
          duration: 3000,
          isClosable: true,
        });
        
        setIsEditing(false);
      } catch (error) {
        toast({
          title: 'Update failed',
          description: error.response?.data?.detail || 'An error occurred while updating your profile',
          status: 'error',
          duration: 5000,
          isClosable: true,
        });
      }
    },
  });

  if (authLoading) {
    return <LoadingSpinner />;
  }

  if (!user) {
    return <ErrorAlert title="Authentication Error" description="Please log in to view your profile" />;
  }

  return (
    <Box>
      <PageHeader 
        title="Your Profile" 
        subtitle="View and manage your personal information"
      />
      
      <SimpleGrid columns={{ base: 1, md: 2 }} spacing={8}>
        {/* Profile Overview */}
        <Card>
          <CardBody>
            <Flex direction="column" align="center" textAlign="center" mb={6}>
              <Avatar 
                size="2xl" 
                name={user.full_name} 
                mb={4}
                bg="brand.500"
              />
              <Heading size="lg">{user.full_name}</Heading>
              <Text color="gray.600">{user.email}</Text>
              <Text fontSize="sm" color="gray.500" mt={1}>
                Joined on {formatDate(user.created_at)}
              </Text>
            </Flex>
            
            <Divider mb={6} />
            
            <SimpleGrid columns={2} spacing={4}>
              <Stat>
                <StatLabel>Grade/Class</StatLabel>
                <StatNumber fontSize="lg">{user.grade_class}</StatNumber>
              </Stat>
              <Stat>
                <StatLabel>Contact</StatLabel>
                <StatNumber fontSize="lg">{user.contact}</StatNumber>
              </Stat>
            </SimpleGrid>
            
            {user.expectations && (
              <Box mt={4}>
                <Text fontWeight="bold" mb={1}>Expectations:</Text>
                <Text>{user.expectations}</Text>
              </Box>
            )}
            
            <Button
              mt={6}
              colorScheme="brand"
              width="full"
              onClick={() => setIsEditing(true)}
            >
              Edit Profile
            </Button>
          </CardBody>
        </Card>
        
        {/* Edit Profile Form */}
        {isEditing && (
          <Card>
            <CardBody>
              <Heading size="md" mb={6}>Edit Profile</Heading>
              
              <form onSubmit={formik.handleSubmit}>
                <VStack spacing={4} align="stretch">
                  <FormControl 
                    id="full_name" 
                    isInvalid={formik.touched.full_name && formik.errors.full_name}
                  >
                    <FormLabel>Full Name</FormLabel>
                    <Input 
                      type="text" 
                      {...formik.getFieldProps('full_name')}
                    />
                    <FormErrorMessage>{formik.errors.full_name}</FormErrorMessage>
                  </FormControl>
                  
                  <FormControl 
                    id="email" 
                    isInvalid={formik.touched.email && formik.errors.email}
                  >
                    <FormLabel>Email address</FormLabel>
                    <Input 
                      type="email" 
                      {...formik.getFieldProps('email')}
                    />
                    <FormErrorMessage>{formik.errors.email}</FormErrorMessage>
                  </FormControl>
                  
                  <FormControl 
                    id="grade_class" 
                    isInvalid={formik.touched.grade_class && formik.errors.grade_class}
                  >
                    <FormLabel>Grade/Class</FormLabel>
                    <Input 
                      type="text" 
                      placeholder="e.g., 12th Grade, College Freshman" 
                      {...formik.getFieldProps('grade_class')}
                    />
                    <FormErrorMessage>{formik.errors.grade_class}</FormErrorMessage>
                  </FormControl>
                  
                  <FormControl 
                    id="contact" 
                    isInvalid={formik.touched.contact && formik.errors.contact}
                  >
                    <FormLabel>Contact Number</FormLabel>
                    <Input 
                      type="text" 
                      {...formik.getFieldProps('contact')}
                    />
                    <FormErrorMessage>{formik.errors.contact}</FormErrorMessage>
                  </FormControl>
                  
                  <FormControl 
                    id="expectations" 
                    isInvalid={formik.touched.expectations && formik.errors.expectations}
                  >
                    <FormLabel>Expectations</FormLabel>
                    <Textarea 
                      placeholder="What are you hoping to achieve with our platform?" 
                      {...formik.getFieldProps('expectations')}
                    />
                    <FormErrorMessage>{formik.errors.expectations}</FormErrorMessage>
                  </FormControl>
                  
                  <Flex justify="space-between" mt={4}>
                    <Button
                      variant="outline"
                      onClick={() => setIsEditing(false)}
                    >
                      Cancel
                    </Button>
                    <Button
                      type="submit"
                      colorScheme="brand"
                      isLoading={formik.isSubmitting}
                    >
                      Save Changes
                    </Button>
                  </Flex>
                </VStack>
              </form>
            </CardBody>
          </Card>
        )}
      </SimpleGrid>
    </Box>
  );
}
