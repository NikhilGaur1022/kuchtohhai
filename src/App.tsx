import { useEffect } from 'react';
import { Routes, Route } from 'react-router-dom';
import Layout from './components/layout/Layout';
import HomePage from './pages/HomePage';
import ArticlesPage from './pages/ArticlesPage';
import ArticleDetailPage from './pages/ArticleDetailPage';

import EventsPage from './pages/EventsPage';
import EventDetailPage from './pages/EventDetailPage';
import CreateEventPage from './pages/CreateEventPage';
import VerificationApplicationPage from './pages/VerificationApplicationPage';


import LoginPage from './pages/auth/LoginPage';
import RegisterPage from './pages/auth/RegisterPage';
import DashboardPage from './pages/dashboard/DashboardPage';
import ProfilePage from './pages/dashboard/ProfilePage';
import AdminArticlesPage from './pages/dashboard/AdminArticlesPage';
import AdminVerificationPage from './pages/dashboard/AdminVerificationPage';

import NotFoundPage from './pages/NotFoundPage';
import ScrollToTop from './components/common/ScrollToTop';

import PrivateRoute from './components/common/PrivateRoute';
import AdminRoute from './components/common/AdminRoute';



import ProfessorsPage from './pages/ProfessorsPage';
import ProfessorDetailPage from './pages/ProfessorDetailPage';
import ProfessorArticlesPage from './pages/ProfessorArticlesPage';

function App() {
  useEffect(() => {
    // Initialize animation observers
    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add('is-visible');
        }
      });
    }, { threshold: 0.1 });

    document.querySelectorAll('.animate-on-scroll').forEach((element) => {
      observer.observe(element);
    });

    // Parallax effect on mouse movement
    const handleMouseMove = (e: MouseEvent) => {
      const parallaxElements = document.querySelectorAll('.parallax');
      const mouseX = e.clientX / window.innerWidth - 0.5;
      const mouseY = e.clientY / window.innerHeight - 0.5;

      parallaxElements.forEach((el) => {
        const element = el as HTMLElement;
        const speed = element.getAttribute('data-speed') || '5';
        const x = mouseX * parseInt(speed);
        const y = mouseY * parseInt(speed);
        element.style.transform = `translate(${x}px, ${y}px)`;
      });
    };

    document.addEventListener('mousemove', handleMouseMove);

    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
      observer.disconnect();
    };
  }, []);

  return (
    <>
      <ScrollToTop />
      <Routes>
        <Route path="/" element={<Layout />}>
          <Route index element={<HomePage />} />
          <Route path="articles" element={<ArticlesPage />} />
          <Route path="articles/:id" element={<ArticleDetailPage />} />
          
          <Route path="events" element={<EventsPage />} />
          <Route path="events/:id" element={<EventDetailPage />} />
          <Route path="events/create" element={<PrivateRoute><CreateEventPage /></PrivateRoute>} />
          <Route path="verification/apply" element={<PrivateRoute><VerificationApplicationPage /></PrivateRoute>} />


          <Route path="professors" element={<ProfessorsPage />} />
          <Route path="professors/:id/articles" element={<ProfessorArticlesPage />} />
          <Route path="professors/:id" element={<ProfessorDetailPage />} />


          <Route path="dashboard" element={<PrivateRoute><DashboardPage /></PrivateRoute>} />
          <Route path="profile" element={<PrivateRoute><ProfilePage /></PrivateRoute>} />
          <Route path="admin">
            <Route path="articles" element={<AdminRoute><AdminArticlesPage /></AdminRoute>} />
            <Route path="verifications" element={<AdminRoute><AdminVerificationPage /></AdminRoute>} />
          </Route>
          <Route path="login" element={<LoginPage />} />
          <Route path="register" element={<RegisterPage />} />
         
        
          <Route path="*" element={<NotFoundPage />} />
        </Route>
      </Routes>
    </>
  );
}

export default App;