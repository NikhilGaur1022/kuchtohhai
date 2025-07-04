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
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-neutral-50 via-dental-50/30 to-blue-50/20 pt-16 pb-16 px-4 py-8 relative overflow-hidden">
      {/* Background Effects */}
      <div className="absolute inset-0">
        <motion.div 
          className="absolute top-20 left-20 w-64 h-64 bg-gradient-to-br from-dental-200/20 to-dental-300/10 rounded-full blur-3xl"
          animate={{
            x: [0, -30, 0],
            y: [0, 20, 0],
            scale: [1, 1.2, 1],
          }}
          transition={{
            duration: 9,
            repeat: Infinity,
            ease: "easeInOut"
          }}
        />
        <motion.div 
          className="absolute bottom-20 right-20 w-48 h-48 bg-gradient-to-br from-blue-200/20 to-dental-200/10 rounded-full blur-3xl"
          animate={{
            x: [0, 20, 0],
            y: [0, -15, 0],
            scale: [1, 0.8, 1],
          }}
          transition={{
            duration: 11,
            repeat: Infinity,
            ease: "easeInOut"
          }}
        />
      </div>

      <div className="container-custom max-w-6xl mx-auto relative z-10">
        <motion.div 
          className="bg-white/80 backdrop-blur-xl rounded-3xl shadow-2xl overflow-hidden border border-white/20"
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.6 }}
        >
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {/* Form Section */}
            <div className="p-8 md:p-12">
              <motion.div 
                className="mb-8 text-center md:text-left"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.1 }}
              >
                <Link to="/" className="inline-flex items-center mb-8 group">
                  <motion.div 
                    className="w-10 h-10 bg-gradient-to-br from-dental-600 to-dental-700 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform duration-300"
                    whileHover={{ rotate: 360 }}
                    transition={{ duration: 0.5 }}
                  >
                    <span className="text-white font-bold">DR</span>
                  </motion.div>
                  <span className="ml-2 font-semibold text-xl bg-gradient-to-r from-dental-700 to-dental-600 bg-clip-text text-transparent">DentalReach</span>
                </Link>
                <h1 className="text-2xl md:text-3xl font-bold text-neutral-900 mb-2">Create your account</h1>
                <p className="text-neutral-600">
                  Already have an account?{' '}
                  <Link to="/login" className="text-dental-600 hover:text-dental-700 font-medium transition-colors duration-200">Log in</Link>
                </p>
              </motion.div>
              
              <form onSubmit={handleSubmit} className="space-y-6">
                {errorMessage && (
                  <motion.div 
                    className="bg-red-50 text-red-600 p-4 rounded-xl text-sm border border-red-200"
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 0.3 }}
                  >
                    {errorMessage}
                  </motion.div>
                )}
                
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6, delay: 0.2 }}
                >
                  <label htmlFor="fullName" className="block text-sm font-medium text-neutral-700 mb-2">
                    Full Name
                  </label>
                  <div className="relative">
                    <input
                      id="fullName"
                      type="text"
                      value={fullName}
                      onChange={(e) => setFullName(e.target.value)}
                      className="w-full px-4 py-3 rounded-xl border border-neutral-200 focus:outline-none focus:ring-2 focus:ring-dental-500 focus:border-dental-500 transition-all duration-200 bg-white/50 backdrop-blur-sm"
                      placeholder="Dr. John Smith"
                      required
                    />
                    <User className="absolute right-3 top-1/2 transform -translate-y-1/2 text-neutral-400 h-5 w-5" />
                  </div>
                </motion.div>
                
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6, delay: 0.3 }}
                >
                  <label htmlFor="email" className="block text-sm font-medium text-neutral-700 mb-2">
                    Email Address
                  </label>
                  <div className="relative">
                    <input
                      id="email"
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="w-full px-4 py-3 rounded-xl border border-neutral-200 focus:outline-none focus:ring-2 focus:ring-dental-500 focus:border-dental-500 transition-all duration-200 bg-white/50 backdrop-blur-sm"
                      placeholder="you@example.com"
                      required
                    />
                    <Mail className="absolute right-3 top-1/2 transform -translate-y-1/2 text-neutral-400 h-5 w-5" />
                  </div>
                </motion.div>
                
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6, delay: 0.4 }}
                >
                  <label htmlFor="password" className="block text-sm font-medium text-neutral-700 mb-2">
                    Password
                  </label>
                  <div className="relative">
                    <input
                      id="password"
                      type={showPassword ? "text" : "password"}
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="w-full px-4 py-3 rounded-xl border border-neutral-200 focus:outline-none focus:ring-2 focus:ring-dental-500 focus:border-dental-500 transition-all duration-200 bg-white/50 backdrop-blur-sm"
                      placeholder="••••••••"
                      required
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 transform -translate-y-1/2 text-neutral-400 hover:text-neutral-600 transition-colors duration-200"
                    >
                      {showPassword ? (
                        <EyeOff className="h-5 w-5" />
                      ) : (
                        <Eye className="h-5 w-5" />
                      )}
                    </button>
                  </div>
                  <p className="text-xs text-neutral-500 mt-1">Must be at least 8 characters long</p>
                </motion.div>

                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6, delay: 0.5 }}
                >
                  <label htmlFor="confirmPassword" className="block text-sm font-medium text-neutral-700 mb-2">
                    Confirm Password
                  </label>
                  <div className="relative">
                    <input
                      id="confirmPassword"
                      type={showPassword ? "text" : "password"}
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      className="w-full px-4 py-3 rounded-xl border border-neutral-200 focus:outline-none focus:ring-2 focus:ring-dental-500 focus:border-dental-500 transition-all duration-200 bg-white/50 backdrop-blur-sm"
                      placeholder="••••••••"
                      required
                    />
                  </div>
                </motion.div>

                {/* Enhanced Register Button */}
                <motion.button
                  type="submit"
                  disabled={isSubmitting}
                  className="relative overflow-hidden w-full py-3 px-4 bg-gradient-to-r from-dental-600 via-dental-700 to-dental-800 hover:from-dental-700 hover:via-dental-800 hover:to-dental-900 text-white font-semibold rounded-xl focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-dental-500 transition-all duration-300 transform hover:scale-[1.02] hover:-translate-y-0.5 disabled:opacity-70 disabled:cursor-not-allowed disabled:transform-none shadow-lg hover:shadow-xl"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6, delay: 0.6 }}
                  whileTap={{ scale: 0.98 }}
                >
                  <div className="absolute inset-0 bg-gradient-to-r from-white/0 via-white/20 to-white/0 translate-x-[-100%] hover:translate-x-[100%] transition-transform duration-700" />
                  <span className="relative">
                    {isSubmitting ? 'Creating Account...' : 'Create Account'}
                  </span>
                </motion.button>

                <motion.div 
                  className="text-center text-xs text-neutral-500"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ duration: 0.6, delay: 0.7 }}
                >
                  By creating an account, you agree to our{' '}
                  <a href="#" className="text-dental-600 hover:text-dental-700 transition-colors duration-200">Terms of Service</a> and{' '}
                  <a href="#" className="text-dental-600 hover:text-dental-700 transition-colors duration-200">Privacy Policy</a>
                </motion.div>
              </form>
            </div>

            {/* Enhanced Image Section */}
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
                    {[
                      { value: '10k+', label: 'Professionals' },
                      { value: '500+', label: 'Articles' },
                      { value: '50+', label: 'Events' },
                      { value: '24/7', label: 'Support' }
                    ].map((stat, i) => (
                      <motion.div 
                        key={i}
                        className="bg-white/50 backdrop-blur-sm rounded-xl p-4 hover:bg-white/70 transition-all duration-300"
                        whileHover={{ scale: 1.05, y: -2 }}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.5, delay: 0.3 + i * 0.1 }}
                      >
                        <div className="text-2xl font-bold text-dental-700">{stat.value}</div>
                        <div className="text-dental-600">{stat.label}</div>
                      </motion.div>
                    ))}
                  </motion.div>
                </div>
              </div>
              
              {/* Decorative elements */}
              <motion.div 
                className="absolute -top-12 -right-12 w-24 h-24 bg-dental-200 rounded-full opacity-20"
                animate={{ rotate: 360 }}
                transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
              />
              <motion.div 
                className="absolute top-20 -left-8 w-16 h-16 bg-dental-300 rounded-full opacity-30"
                animate={{ y: [0, -10, 0] }}
                transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
              />
              <motion.div 
                className="absolute -bottom-8 left-12 w-20 h-20 bg-dental-400 rounded-full opacity-20"
                animate={{ x: [0, 10, 0] }}
                transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
              />
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default RegisterPage;