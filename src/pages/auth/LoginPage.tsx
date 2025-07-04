import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Eye, EyeOff, Lock, Mail } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';

const LoginPage = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const navigate = useNavigate();
  const { login, isAdmin } = useAuth();

  useEffect(() => {
    document.title = 'Login | DentalReach';
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage('');
    
    if (!email || !password) {
      setErrorMessage('Please enter both email and password');
      return;
    }
    
    setIsSubmitting(true);
    
    try {
      await login(email, password);
      // If user is admin, redirect to admin dashboard
      if (isAdmin) {
        navigate('/admin/articles');
      } else {
        navigate('/dashboard');
      }
    } catch (error) {
      setErrorMessage('Invalid email or password');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-neutral-50 via-dental-50/30 to-blue-50/20 pt-16 pb-16 px-4 py-8 relative overflow-hidden">
      {/* Background Effects */}
      <div className="absolute inset-0">
        <motion.div 
          className="absolute top-20 right-20 w-64 h-64 bg-gradient-to-br from-dental-200/20 to-dental-300/10 rounded-full blur-3xl"
          animate={{
            x: [0, 30, 0],
            y: [0, -20, 0],
            scale: [1, 1.1, 1],
          }}
          transition={{
            duration: 8,
            repeat: Infinity,
            ease: "easeInOut"
          }}
        />
        <motion.div 
          className="absolute bottom-20 left-20 w-48 h-48 bg-gradient-to-br from-blue-200/20 to-dental-200/10 rounded-full blur-3xl"
          animate={{
            x: [0, -20, 0],
            y: [0, 15, 0],
            scale: [1, 0.9, 1],
          }}
          transition={{
            duration: 10,
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
            {/* Image Section */}
            <div className="hidden md:block relative overflow-hidden">
              <div className="absolute inset-0 bg-gradient-to-br from-dental-700/90 to-dental-800/90 z-10"></div>
              <img 
                src="https://images.pexels.com/photos/3845653/pexels-photo-3845653.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2" 
                alt="Dental professional" 
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-0 flex flex-col items-center justify-center text-white p-12 z-20">
                <motion.h2 
                  className="text-3xl font-bold mb-6 text-center"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6, delay: 0.2 }}
                >
                  Welcome Back to DentalReach
                </motion.h2>
                <motion.p 
                  className="text-dental-100 text-center mb-8 leading-relaxed"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6, delay: 0.3 }}
                >
                  Access exclusive content, connect with peers, and advance your dental knowledge and career.
                </motion.p>
                <div className="space-y-4 w-full max-w-xs">
                  <motion.div 
                    className="flex items-center bg-white/10 backdrop-blur-sm p-4 rounded-xl border border-white/20"
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.6, delay: 0.4 }}
                  >
                    <div className="rounded-full bg-white/20 p-2 mr-4">
                      <Mail className="h-5 w-5 text-white" />
                    </div>
                    <div>
                      <p className="font-medium">Personalized Content</p>
                      <p className="text-sm text-dental-100">Tailored to your interests</p>
                    </div>
                  </motion.div>
                  <motion.div 
                    className="flex items-center bg-white/10 backdrop-blur-sm p-4 rounded-xl border border-white/20"
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.6, delay: 0.5 }}
                  >
                    <div className="rounded-full bg-white/20 p-2 mr-4">
                      <Lock className="h-5 w-5 text-white" />
                    </div>
                    <div>
                      <p className="font-medium">Secure Platform</p>
                      <p className="text-sm text-dental-100">Your data is always protected</p>
                    </div>
                  </motion.div>
                </div>
              </div>
            </div>
            
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
                <h1 className="text-2xl md:text-3xl font-bold text-neutral-900 mb-2">Log in to your account</h1>
                <p className="text-neutral-600">
                  Don't have an account? <Link to="/register" className="text-dental-600 hover:text-dental-700 font-medium transition-colors duration-200">Sign up</Link>
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
                  transition={{ duration: 0.6, delay: 0.3 }}
                >
                  <div className="flex items-center justify-between mb-2">
                    <label htmlFor="password" className="block text-sm font-medium text-neutral-700">
                      Password
                    </label>
                    <a href="#" className="text-sm text-dental-600 hover:text-dental-700 transition-colors duration-200">
                      Forgot password?
                    </a>
                  </div>
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
                </motion.div>
                
                <motion.div 
                  className="flex items-center"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6, delay: 0.4 }}
                >
                  <input
                    id="remember-me"
                    name="remember-me"
                    type="checkbox"
                    className="rounded border-neutral-300 focus:ring-dental-500 h-4 w-4 text-dental-600"
                  />
                  <label htmlFor="remember-me" className="ml-2 block text-sm text-neutral-700">
                    Remember me
                  </label>
                </motion.div>
                
                {/* Enhanced Login Button */}
                <motion.button
                  type="submit"
                  disabled={isSubmitting}
                  className="relative overflow-hidden w-full py-3 px-4 bg-gradient-to-r from-dental-600 via-dental-700 to-dental-800 hover:from-dental-700 hover:via-dental-800 hover:to-dental-900 text-white font-semibold rounded-xl focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-dental-500 transition-all duration-300 transform hover:scale-[1.02] hover:-translate-y-0.5 disabled:opacity-70 disabled:cursor-not-allowed disabled:transform-none shadow-lg hover:shadow-xl"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6, delay: 0.5 }}
                  whileTap={{ scale: 0.98 }}
                >
                  <div className="absolute inset-0 bg-gradient-to-r from-white/0 via-white/20 to-white/0 translate-x-[-100%] hover:translate-x-[100%] transition-transform duration-700" />
                  <span className="relative">
                    {isSubmitting ? 'Logging in...' : 'Log in'}
                  </span>
                </motion.button>
              </form>
              
              <motion.div 
                className="mt-6"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.6 }}
              >
                <div className="relative">
                  <div className="absolute inset-0 flex items-center">
                    <div className="w-full border-t border-neutral-200"></div>
                  </div>
                  <div className="relative flex justify-center text-sm">
                    <span className="px-4 bg-white text-neutral-500">Or continue with</span>
                  </div>
                </div>
                
                <div className="grid grid-cols-2 gap-4 mt-6">
                  {/* Enhanced Google Button */}
                  <motion.button
                    type="button"
                    className="relative overflow-hidden py-3 px-4 bg-white text-neutral-700 border border-neutral-200 hover:bg-neutral-50 hover:border-neutral-300 font-medium rounded-xl transition-all duration-300 transform hover:scale-105 hover:-translate-y-0.5 flex items-center justify-center shadow-md hover:shadow-lg"
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    <div className="absolute inset-0 bg-gradient-to-r from-neutral-50/0 via-neutral-50/50 to-neutral-50/0 translate-x-[-100%] hover:translate-x-[100%] transition-transform duration-700" />
                    <svg className="h-5 w-5 mr-2" viewBox="0 0 24 24" fill="currentColor">
                      <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
                      <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
                      <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
                      <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
                      <path d="M1 1h22v22H1z" fill="none"/>
                    </svg>
                    <span className="relative">Google</span>
                  </motion.button>
                  
                  {/* Enhanced Facebook Button */}
                  <motion.button
                    type="button"
                    className="relative overflow-hidden py-3 px-4 bg-gradient-to-r from-dental-600 to-dental-700 hover:from-dental-700 hover:to-dental-800 text-white font-medium rounded-xl transition-all duration-300 transform hover:scale-105 hover:-translate-y-0.5 flex items-center justify-center shadow-lg hover:shadow-xl"
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    <div className="absolute inset-0 bg-gradient-to-r from-white/0 via-white/10 to-white/0 translate-x-[-100%] hover:translate-x-[100%] transition-transform duration-700" />
                    <svg className="h-5 w-5 mr-2" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M9.03954 16.7761L8.64814 20.1185C9.20454 20.1185 9.44814 19.8749 9.73994 19.5831L12.0161 17.4115L15.3139 19.7899C16.2229 20.2949 16.8553 20.0309 17.0991 19.1403L19.9625 4.55386L19.9636 4.55285C20.2516 3.41285 19.4783 2.89535 18.5926 3.22335L3.02954 9.82235C1.93294 10.3273 1.95354 11.0389 2.84694 11.3669L6.69454 12.5219L16.0445 6.10635C16.5773 5.75135 17.0616 5.94635 16.6589 6.30135L9.03954 16.7761Z"/>
                    </svg>
                    <span className="relative">Facebook</span>
                  </motion.button>
                </div>
              </motion.div>
              
              <motion.p 
                className="mt-8 text-center text-xs text-neutral-500"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.6, delay: 0.7 }}
              >
                By signing in, you agree to our 
                <a href="#" className="text-dental-600 hover:text-dental-700 transition-colors duration-200"> Terms of Service</a> and 
                <a href="#" className="text-dental-600 hover:text-dental-700 transition-colors duration-200"> Privacy Policy</a>.
              </motion.p>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default LoginPage;