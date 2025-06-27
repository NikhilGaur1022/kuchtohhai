import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Eye, EyeOff, Mail, User } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';

const RegisterPage = () => {
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const navigate = useNavigate();
  const { register } = useAuth();

  useEffect(() => {
    document.title = 'Register | DentalReach';
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage('');
    
    if (!fullName || !email || !password || !confirmPassword) {
      setErrorMessage('Please fill in all fields');
      return;
    }
    
    if (password !== confirmPassword) {
      setErrorMessage('Passwords do not match');
      return;
    }
    
    if (password.length < 8) {
      setErrorMessage('Password must be at least 8 characters long');
      return;
    }
    
    setIsSubmitting(true);
    
    try {
      await register(email, password, fullName);
      setErrorMessage('Registration successful! Please check your email for confirmation link.');
    } catch (error: any) {
      console.error('Registration error:', error);
      if (error.message.includes('check your email')) {
        setErrorMessage('Registration successful! Please check your email for confirmation link.');
      } else if (error.message) {
        setErrorMessage(error.message);
      } else if (error.error_description) {
        setErrorMessage(error.error_description);
      } else {
        setErrorMessage('Registration failed. Please try again.');
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-neutral-50 pt-16 pb-16 px-4 py-8">
      <div className="container-custom max-w-6xl mx-auto">
        <div className="bg-white rounded-2xl shadow-md overflow-hidden">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {/* Form Section */}
            <div className="p-8 md:p-12">
              <div className="mb-8 text-center md:text-left">
                <Link to="/" className="inline-flex items-center mb-8">
                  <div className="w-10 h-10 bg-dental-600 rounded-lg flex items-center justify-center">
                    <span className="text-white font-bold">DR</span>
                  </div>
                  <span className="ml-2 font-semibold text-xl text-dental-700">DentalReach</span>
                </Link>
                <h1 className="text-2xl md:text-3xl font-bold text-neutral-900 mb-2">Create your account</h1>
                <p className="text-neutral-600">
                  Already have an account?{' '}
                  <Link to="/login" className="text-dental-600 hover:text-dental-700">Log in</Link>
                </p>
              </div>
              
              <form onSubmit={handleSubmit} className="space-y-6">
                {errorMessage && (
                  <div className="bg-error-50 text-error-600 p-4 rounded-lg text-sm">
                    {errorMessage}
                  </div>
                )}
                
                <div>
                  <label htmlFor="fullName" className="block text-sm font-medium text-neutral-700 mb-1">
                    Full Name
                  </label>
                  <div className="relative">
                    <input
                      id="fullName"
                      type="text"
                      value={fullName}
                      onChange={(e) => setFullName(e.target.value)}
                      className="w-full px-4 py-2 rounded-lg border border-neutral-200 focus:outline-none focus:ring-2 focus:ring-dental-500"
                      placeholder="Dr. John Smith"
                      required
                    />
                    <User className="absolute right-3 top-1/2 transform -translate-y-1/2 text-neutral-400 h-5 w-5" />
                  </div>
                </div>
                
                <div>
                  <label htmlFor="email" className="block text-sm font-medium text-neutral-700 mb-1">
                    Email Address
                  </label>
                  <div className="relative">
                    <input
                      id="email"
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="w-full px-4 py-2 rounded-lg border border-neutral-200 focus:outline-none focus:ring-2 focus:ring-dental-500"
                      placeholder="you@example.com"
                      required
                    />
                    <Mail className="absolute right-3 top-1/2 transform -translate-y-1/2 text-neutral-400 h-5 w-5" />
                  </div>
                </div>
                
                <div>
                  <label htmlFor="password" className="block text-sm font-medium text-neutral-700 mb-1">
                    Password
                  </label>
                  <div className="relative">
                    <input
                      id="password"
                      type={showPassword ? "text" : "password"}
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="w-full px-4 py-2 rounded-lg border border-neutral-200 focus:outline-none focus:ring-2 focus:ring-dental-500"
                      placeholder="••••••••"
                      required
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 transform -translate-y-1/2 text-neutral-400 hover:text-neutral-600"
                    >
                      {showPassword ? (
                        <EyeOff className="h-5 w-5" />
                      ) : (
                        <Eye className="h-5 w-5" />
                      )}
                    </button>
                  </div>
                  <p className="text-xs text-neutral-500 mt-1">Must be at least 8 characters long</p>
                </div>

                <div>
                  <label htmlFor="confirmPassword" className="block text-sm font-medium text-neutral-700 mb-1">
                    Confirm Password
                  </label>
                  <div className="relative">
                    <input
                      id="confirmPassword"
                      type={showPassword ? "text" : "password"}
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      className="w-full px-4 py-2 rounded-lg border border-neutral-200 focus:outline-none focus:ring-2 focus:ring-dental-500"
                      placeholder="••••••••"
                      required
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full bg-dental-600 text-white py-2 rounded-lg hover:bg-dental-700 font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isSubmitting ? 'Creating Account...' : 'Create Account'}
                </button>

                <div className="text-center text-xs text-neutral-500">
                  By creating an account, you agree to our{' '}
                  <a href="#" className="text-dental-600 hover:text-dental-700">Terms of Service</a> and{' '}
                  <a href="#" className="text-dental-600 hover:text-dental-700">Privacy Policy</a>
                </div>
              </form>
            </div>

            {/* Image Section */}
            <div className="hidden md:block relative overflow-hidden bg-gradient-to-br from-dental-50 to-dental-100">
              <div className="absolute inset-0 flex items-center justify-center p-12">
                <div className="text-center">
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.8 }}
                    className="mb-8"
                  >
                    <h2 className="text-3xl font-bold text-dental-700 mb-4">
                      Join the DentalReach Community
                    </h2>
                    <p className="text-dental-600 text-lg leading-relaxed">
                      Connect with dental professionals worldwide, share knowledge, and advance your career.
                    </p>
                  </motion.div>
                  
                  <motion.div
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 0.8, delay: 0.2 }}
                    className="grid grid-cols-2 gap-4 text-sm"
                  >
                    <div className="bg-white/50 rounded-lg p-4">
                      <div className="text-2xl font-bold text-dental-700">10k+</div>
                      <div className="text-dental-600">Professionals</div>
                    </div>
                    <div className="bg-white/50 rounded-lg p-4">
                      <div className="text-2xl font-bold text-dental-700">500+</div>
                      <div className="text-dental-600">Articles</div>
                    </div>
                    <div className="bg-white/50 rounded-lg p-4">
                      <div className="text-2xl font-bold text-dental-700">50+</div>
                      <div className="text-dental-600">Events</div>
                    </div>
                    <div className="bg-white/50 rounded-lg p-4">
                      <div className="text-2xl font-bold text-dental-700">24/7</div>
                      <div className="text-dental-600">Support</div>
                    </div>
                  </motion.div>
                </div>
              </div>
              
              {/* Decorative elements */}
              <div className="absolute -top-12 -right-12 w-24 h-24 bg-dental-200 rounded-full opacity-20"></div>
              <div className="absolute top-20 -left-8 w-16 h-16 bg-dental-300 rounded-full opacity-30"></div>
              <div className="absolute -bottom-8 left-12 w-20 h-20 bg-dental-400 rounded-full opacity-20"></div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RegisterPage;