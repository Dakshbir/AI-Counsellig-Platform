import { useState } from 'react';
import {
  Box,
  Button,
  FormControl,
  FormLabel,
  Input,
  Text,
  VStack,
  useToast,
  Progress,
  Icon,
  Flex,
} from '@chakra-ui/react';
import { FiUpload, FiFile, FiCheck } from 'react-icons/fi';
import { psychometricApi } from '../../services/api';

const UploadForm = ({ onUploadSuccess }) => {
  const [file, setFile] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState(0);
  const toast = useToast();

  const handleFileChange = (e) => {
    if (e.target.files.length > 0) {
      const selectedFile = e.target.files[0];
      
      // Check if file is PDF
      if (selectedFile.type !== 'application/pdf') {
        toast({
          title: 'Invalid file type',
          description: 'Please upload a PDF file',
          status: 'error',
          duration: 3000,
          isClosable: true,
        });
        return;
      }
      
      // Check file size (max 10MB)
      if (selectedFile.size > 10 * 1024 * 1024) {
        toast({
          title: 'File too large',
          description: 'Please upload a file smaller than 10MB',
          status: 'error',
          duration: 3000,
          isClosable: true,
        });
        return;
      }
      
      setFile(selectedFile);
    }
  };

  const handleUpload = async () => {
    if (!file) {
      toast({
        title: 'No file selected',
        description: 'Please select a file to upload',
        status: 'warning',
        duration: 3000,
        isClosable: true,
      });
      return;
    }

    try {
      setUploading(true);
      
      // Simulate progress for better UX
      const progressInterval = setInterval(() => {
        setProgress((prev) => {
          if (prev >= 90) {
            clearInterval(progressInterval);
            return 90;
          }
          return prev + 10;
        });
      }, 500);
      
      const response = await psychometricApi.uploadReport(file);
      
      clearInterval(progressInterval);
      setProgress(100);
      
      toast({
        title: 'Upload successful',
        description: 'Your psychometric report has been processed',
        status: 'success',
        duration: 5000,
        isClosable: true,
      });
      
      if (onUploadSuccess) {
        onUploadSuccess(response.data);
      }
    } catch (error) {
      toast({
        title: 'Upload failed',
        description: error.response?.data?.detail || 'An error occurred during upload',
        status: 'error',
        duration: 5000,
        isClosable: true,
      });
    } finally {
      setUploading(false);
      setProgress(0);
    }
  };

  return (
    <VStack spacing={4} align="stretch">
      <FormControl>
        <FormLabel>Upload Psychometric Test Report (PDF)</FormLabel>
        <Input
          type="file"
          accept=".pdf"
          onChange={handleFileChange}
          display="none"
          id="file-upload"
          isDisabled={uploading}
        />
        <Flex
          as="label"
          htmlFor="file-upload"
          border="2px dashed"
          borderColor="gray.300"
          borderRadius="md"
          p={6}
          textAlign="center"
          cursor="pointer"
          direction="column"
          align="center"
          justify="center"
          transition="all 0.3s"
          _hover={{ borderColor: 'brand.500' }}
        >
          <Icon as={file ? FiFile : FiUpload} boxSize={10} color="gray.500" mb={2} />
          {file ? (
            <Text fontWeight="medium">{file.name}</Text>
          ) : (
            <>
              <Text fontWeight="medium">Drag and drop your PDF file here</Text>
              <Text fontSize="sm" color="gray.500">or click to browse</Text>
            </>
          )}
        </Flex>
      </FormControl>
      
      {uploading && (
        <Progress value={progress} size="sm" colorScheme="brand" borderRadius="md" />
      )}
      
      <Button
        leftIcon={uploading ? <FiCheck /> : <FiUpload />}
        colorScheme="brand"
        onClick={handleUpload}
        isLoading={uploading}
        loadingText="Uploading..."
        isDisabled={!file || uploading}
      >
        Upload Report
      </Button>
    </VStack>
  );
};

export default UploadForm;
