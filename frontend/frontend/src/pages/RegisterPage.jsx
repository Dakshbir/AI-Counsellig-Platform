import {
  Box,
  FormControl,
  FormLabel,
  Input,
  Stack,
  Button,
  Heading,
  Text,
  useColorModeValue,
  Link,
  FormErrorMessage,
  useToast,
  InputGroup,
  InputRightElement,
  IconButton,
  Textarea,
} from '@chakra-ui/react';
import { useState } from 'react';
import { Link as RouterLink, useNavigate } from 'react-router-dom';
import { useFormik } from 'formik';
import * as Yup from 'yup';
import { FaEye, FaEyeSlash } from 'react-icons/fa';
import { useAuth } from '../context/AuthContext';

export default function RegisterPage() {
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const { register } = useAuth();
  const navigate = useNavigate();
  const toast = useToast();

  const formik = useFormik({
    initialValues: {
      full_name: '',
      email: '',
      grade_class: '',
      contact: '',
      expectations: '',
      password: '',
      confirmPassword: '',
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
      expectations: Yup.string(),
      password: Yup.string()
        .required('Password is required')
        .min(6, 'Password must be at least 6 characters'),
      confirmPassword: Yup.string()
        .oneOf([Yup.ref('password'), null], 'Passwords must match')
        .required('Confirm password is required'),
    }),
    onSubmit: async (values, { setSubmitting }) => {
      try {
        // Remove confirmPassword from values
        const { confirmPassword, ...userData } = values;
        
        await register(userData);
        
        toast({
          title: 'Registration successful',
          description: 'You can now log in with your credentials',
          status: 'success',
          duration: 5000,
          isClosable: true,
        });
        
        navigate('/login');
      } catch (error) {
        toast({
          title: 'Registration failed',
          description: error.response?.data?.detail || 'An error occurred during registration',
          status: 'error',
          duration: 5000,
          isClosable: true,
        });
      } finally {
        setSubmitting(false);
      }
    },
  });

  return (
    <Box
      minH={'100vh'}
      bg={useColorModeValue('gray.50', 'gray.800')}
      py={12}
      px={4}
    >
      <Stack spacing={8} mx={'auto'} maxW={'lg'} py={12} px={6}>
        <Stack align={'center'}>
          <Heading fontSize={'4xl'}>Create your account</Heading>
          <Text fontSize={'lg'} color={'gray.600'}>
            to start your career counseling journey ✨
          </Text>
        </Stack>
        <Box
          rounded={'lg'}
          bg={useColorModeValue('white', 'gray.700')}
          boxShadow={'lg'}
          p={8}
        >
          <form onSubmit={formik.handleSubmit}>
            <Stack spacing={4}>
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
                <FormLabel>Expectations (Optional)</FormLabel>
                <Textarea 
                  placeholder="What are you hoping to achieve with our platform?" 
                  {...formik.getFieldProps('expectations')}
                />
                <FormErrorMessage>{formik.errors.expectations}</FormErrorMessage>
              </FormControl>
              
              <FormControl 
                id="password" 
                isInvalid={formik.touched.password && formik.errors.password}
              >
                <FormLabel>Password</FormLabel>
                <InputGroup>
                  <Input 
                    type={showPassword ? 'text' : 'password'} 
                    {...formik.getFieldProps('password')}
                  />
                  <InputRightElement>
                    <IconButton
                      aria-label={showPassword ? 'Hide password' : 'Show password'}
                      icon={showPassword ? <FaEyeSlash /> : <FaEye />}
                      variant="ghost"
                      onClick={() => setShowPassword(!showPassword)}
                    />
                  </InputRightElement>
                </InputGroup>
                <FormErrorMessage>{formik.errors.password}</FormErrorMessage>
              </FormControl>
              
              <FormControl 
                id="confirmPassword" 
                isInvalid={formik.touched.confirmPassword && formik.errors.confirmPassword}
              >
                <FormLabel>Confirm Password</FormLabel>
                <InputGroup>
                  <Input 
                    type={showConfirmPassword ? 'text' : 'password'} 
                    {...formik.getFieldProps('confirmPassword')}
                  />
                  <InputRightElement>
                    <IconButton
                      aria-label={showConfirmPassword ? 'Hide password' : 'Show password'}
                      icon={showConfirmPassword ? <FaEyeSlash /> : <FaEye />}
                      variant="ghost"
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    />
                  </InputRightElement>
                </InputGroup>
                <FormErrorMessage>{formik.errors.confirmPassword}</FormErrorMessage>
              </FormControl>
              
              <Stack spacing={10} pt={2}>
                <Button
                  type="submit"
                  loadingText="Submitting"
                  size="lg"
                  bg={'brand.500'}
                  color={'white'}
                  _hover={{
                    bg: 'brand.600',
                  }}
                  isLoading={formik.isSubmitting}
                >
                  Sign up
                </Button>
              </Stack>
              <Stack pt={6}>
                <Text align={'center'}>
                  Already a user?{' '}
                  <Link as={RouterLink} to="/login" color={'brand.500'}>
                    Login
                  </Link>
                </Text>
              </Stack>
            </Stack>
          </form>
        </Box>
      </Stack>
    </Box>
  );
}
