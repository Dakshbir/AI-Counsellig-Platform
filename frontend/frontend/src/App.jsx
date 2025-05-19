import { ChakraProvider } from '@chakra-ui/react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import theme from './theme';

// Import pages
import HomePage from './pages/HomePage';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import DashboardPage from './pages/DashboardPage';
import ProfilePage from './pages/ProfilePage';
import CounselingSessionPage from './pages/CounselingSessionPage';
import BookSessionPage from './pages/BookSessionPage';
import PsychometricTestPage from './pages/PsychometricTestPage';
import CareerRoadmapPage from './pages/CareerRoadmapPage';

// Import components
import PrivateRoute from './components/common/PrivateRoute';
import Layout from './components/layout/Layout';

function App() {
  return (
    <ChakraProvider theme={theme}>
      <AuthProvider>
        <Router>
          <Routes>
            <Route path="/" element={<HomePage />} />
            <Route path="/login" element={<LoginPage />} />
            <Route path="/register" element={<RegisterPage />} />
            
            <Route path="/" element={<Layout />}>
              <Route 
                path="/dashboard" 
                element={
                  <PrivateRoute>
                    <DashboardPage />
                  </PrivateRoute>
                } 
              />
              <Route 
                path="/profile" 
                element={
                  <PrivateRoute>
                    <ProfilePage />
                  </PrivateRoute>
                } 
              />
              <Route 
                path="/book-session" 
                element={
                  <PrivateRoute>
                    <BookSessionPage />
                  </PrivateRoute>
                } 
              />
              <Route 
                path="/session/:sessionId" 
                element={
                  <PrivateRoute>
                    <CounselingSessionPage />
                  </PrivateRoute>
                } 
              />
              <Route 
                path="/psychometric-test" 
                element={
                  <PrivateRoute>
                    <PsychometricTestPage />
                  </PrivateRoute>
                } 
              />
              <Route 
                path="/career-roadmap" 
                element={
                  <PrivateRoute>
                    <CareerRoadmapPage />
                  </PrivateRoute>
                } 
              />
            </Route>
          </Routes>
        </Router>
      </AuthProvider>
    </ChakraProvider>
  );
}

export default App;
