import { useState } from 'react';
import {
  Box,
  Button,
  FormControl,
  FormLabel,
  FormErrorMessage,
  Select,
  VStack,
  useToast,
  Radio,
  RadioGroup,
  Stack,
} from '@chakra-ui/react';
import { useFormik } from 'formik';
import * as Yup from 'yup';
import { sessionApi } from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';

const BookingForm = ({ onBookingSuccess }) => {
  const { user } = useAuth();
  const toast = useToast();
  const [selectedDate, setSelectedDate] = useState(null);

  const formik = useFormik({
    initialValues: {
      session_type: 'AI',
      counselor_id: '',
    },
    validationSchema: Yup.object({
      session_type: Yup.string().required('Session type is required'),
      counselor_id: Yup.string().when('session_type', {
        is: 'Human',
        then: Yup.string().required('Counselor is required for human sessions'),
      }),
    }),
    onSubmit: async (values) => {
      if (!selectedDate) {
        toast({
          title: 'Date required',
          description: 'Please select a date and time for your session',
          status: 'error',
          duration: 3000,
          isClosable: true,
        });
        return;
      }

      try {
        const sessionData = {
          user_id: user.id,
          session_type: values.session_type,
          scheduled_time: selectedDate.toISOString(),
          status: 'scheduled',
        };

        if (values.session_type === 'Human' && values.counselor_id) {
          sessionData.counselor_id = parseInt(values.counselor_id);
        }

        const response = await sessionApi.createSession(sessionData);
        
        toast({
          title: 'Session booked',
          description: 'Your counseling session has been scheduled successfully',
          status: 'success',
          duration: 5000,
          isClosable: true,
        });
        
        if (onBookingSuccess) {
          onBookingSuccess(response.data);
        }
      } catch (error) {
        toast({
          title: 'Booking failed',
          description: error.response?.data?.detail || 'An error occurred while booking your session',
          status: 'error',
          duration: 5000,
          isClosable: true,
        });
      }
    },
  });

  // Filter available times (9 AM to 5 PM, hourly slots)
  const filterPassedTime = (time) => {
    const currentDate = new Date();
    const selectedDate = new Date(time);
    
    // Only allow future times
    if (selectedDate < currentDate) {
      return false;
    }
    
    // Only allow times between 9 AM and 5 PM
    const hours = selectedDate.getHours();
    return hours >= 9 && hours <= 17;
  };

  return (
    <Box>
      <form onSubmit={formik.handleSubmit}>
        <VStack spacing={6} align="stretch">
          <FormControl
            id="session_type"
            isInvalid={formik.touched.session_type && formik.errors.session_type}
          >
            <FormLabel>Session Type</FormLabel>
            <RadioGroup
              name="session_type"
              value={formik.values.session_type}
              onChange={(value) => formik.setFieldValue('session_type', value)}
            >
              <Stack direction="row">
                <Radio value="AI">AI Counselor</Radio>
                <Radio value="Human">Human Counselor</Radio>
              </Stack>
            </RadioGroup>
            <FormErrorMessage>{formik.errors.session_type}</FormErrorMessage>
          </FormControl>

          {formik.values.session_type === 'Human' && (
            <FormControl
              id="counselor_id"
              isInvalid={formik.touched.counselor_id && formik.errors.counselor_id}
            >
              <FormLabel>Select Counselor</FormLabel>
              <Select
                placeholder="Select counselor"
                {...formik.getFieldProps('counselor_id')}
              >
                <option value="1">Dr. Sarah Johnson</option>
                <option value="2">Dr. Michael Chen</option>
                <option value="3">Dr. Emily Rodriguez</option>
              </Select>
              <FormErrorMessage>{formik.errors.counselor_id}</FormErrorMessage>
            </FormControl>
          )}

          <FormControl id="scheduled_time">
            <FormLabel>Select Date and Time</FormLabel>
            <Box border="1px" borderColor="gray.200" borderRadius="md" p={2}>
              <DatePicker
                selected={selectedDate}
                onChange={(date) => setSelectedDate(date)}
                showTimeSelect
                timeFormat="HH:mm"
                timeIntervals={60}
                timeCaption="Time"
                dateFormat="MMMM d, yyyy h:mm aa"
                minDate={new Date()}
                filterTime={filterPassedTime}
                placeholderText="Click to select date and time"
                className="chakra-input"
                style={{ width: '100%' }}
              />
            </Box>
          </FormControl>

          <Button
            mt={4}
            colorScheme="brand"
            isLoading={formik.isSubmitting}
            type="submit"
          >
            Book Session
          </Button>
        </VStack>
      </form>
    </Box>
  );
};

export default BookingForm;
