import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Eye, EyeOff, Lock, Mail } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import PrimaryButton from '../../components/common/PrimaryButton';
import SecondaryButton from '../../components/common/SecondaryButton';

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
    <div className="min-h-screen flex items-center justify-center bg-neutral-50 pt-16 pb-16 px-4 py-8">
      <div className="container-custom max-w-6xl mx-auto">
        <div className="bg-white rounded-2xl shadow-md overflow-hidden">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {/* Image Section */}
            <div className="hidden md:block relative">
              <div className="absolute inset-0 bg-dental-700 opacity-90"></div>
              <img 
                src="https://images.pexels.com/photos/3845653/pexels-photo-3845653.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2" 
                alt="Dental professional" 
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-0 flex flex-col items-center justify-center text-white p-12">
                <h2 className="text-3xl font-bold mb-6">Welcome Back to DentalReach</h2>
                <p className="text-dental-100 text-center mb-8">
                  Access exclusive content, connect with peers, and advance your dental knowledge and career.
                </p>
                <div className="space-y-4 w-full max-w-xs">
                  <div className="flex items-center bg-white/10 backdrop-blur-sm p-4 rounded-xl">
                    <div className="rounded-full bg-white/20 p-2 mr-4">
                      <Mail className="h-5 w-5 text-white" />
                    </div>
                    <div>
                      <p className="font-medium">Personalized Content</p>
                      <p className="text-sm text-dental-100">Tailored to your interests</p>
                    </div>
                  </div>
                  <div className="flex items-center bg-white/10 backdrop-blur-sm p-4 rounded-xl">
                    <div className="rounded-full bg-white/20 p-2 mr-4">
                      <Lock className="h-5 w-5 text-white" />
                    </div>
                    <div>
                      <p className="font-medium">Secure Platform</p>
                      <p className="text-sm text-dental-100">Your data is always protected</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            
            {/* Form Section */}
            <div className="p-8 md:p-12">
              <div className="mb-8 text-center md:text-left">
                <Link to="/" className="inline-flex items-center mb-8">
                  <div className="w-10 h-10 bg-dental-600 rounded-lg flex items-center justify-center">
                    <span className="text-white font-bold">DR</span>
                  </div>
                  <span className="ml-2 font-semibold text-xl text-dental-700">DentalReach</span>
                </Link>
                <h1 className="text-2xl md:text-3xl font-bold text-neutral-900 mb-2">Log in to your account</h1>
                <p className="text-neutral-600">
                  Don't have an account? <Link to="/register" className="text-dental-600 hover:text-dental-700">Sign up</Link>
                </p>
              </div>
              
              <form onSubmit={handleSubmit} className="space-y-6">
                {errorMessage && (
                  <div className="bg-error-50 text-error-600 p-4 rounded-lg text-sm">
                    {errorMessage}
                  </div>
                )}
                
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
                  <div className="flex items-center justify-between mb-1">
                    <label htmlFor="password" className="block text-sm font-medium text-neutral-700">
                      Password
                    </label>
                    <a href="#" className="text-sm text-dental-600 hover:text-dental-700">
                      Forgot password?
                    </a>
                  </div>
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
                </div>
                
                <div className="flex items-center">
                  <input
                    id="remember-me"
                    name="remember-me"
                    type="checkbox"
                    className="rounded border-neutral-300 focus:ring-dental-500 h-4 w-4"
                  />
                  <label htmlFor="remember-me" className="ml-2 block text-sm text-neutral-700">
                    Remember me
                  </label>
                </div>
                
                {/* Main login button (primary) */}
                <motion.button
                  type="submit"
                  whileTap={{ scale: 0.98 }}
                  className="w-full py-3 px-4 bg-dental-600 hover:bg-dental-700 text-white font-semibold rounded-lg focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-dental-500 flex items-center justify-center"
                  disabled={isSubmitting}
                >
                  {isSubmitting ? 'Logging in...' : 'Log in'}
                </motion.button>
              </form>
              
              <div className="mt-6">
                <div className="relative">
                  <div className="absolute inset-0 flex items-center">
                    <div className="w-full border-t border-neutral-200"></div>
                  </div>
                  <div className="relative flex justify-center text-sm">
                    <span className="px-4 bg-white text-neutral-500">Or continue with</span>
                  </div>
                </div>
                
                <div className="grid grid-cols-2 gap-4 mt-6">
                  {/* Google (secondary) */}
                  <SecondaryButton
                    type="button"
                    className="py-3 px-4 font-semibold flex items-center justify-center"
                  >
                    <svg className="h-5 w-5 mr-2" viewBox="0 0 24 24" fill="currentColor">
                      <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
                      <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
                      <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
                      <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
                      <path d="M1 1h22v22H1z" fill="none"/>
                    </svg>
                    Google
                  </SecondaryButton>
                  {/* Facebook (primary) */}
                  <PrimaryButton
                    type="button"
                    className="py-3 px-4 font-semibold flex items-center justify-center"
                  >
                    <svg className="h-5 w-5 mr-2" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M9.03954 16.7761L8.64814 20.1185C9.20454 20.1185 9.44814 19.8749 9.73994 19.5831L12.0161 17.4115L15.3139 19.7899C16.2229 20.2949 16.8553 20.0309 17.0991 19.1403L19.9625 4.55386L19.9636 4.55285C20.2516 3.41285 19.4783 2.89535 18.5926 3.22335L3.02954 9.82235C1.93294 10.3273 1.95354 11.0389 2.84694 11.3669L6.69454 12.5219L16.0445 6.10635C16.5773 5.75135 17.0616 5.94635 16.6589 6.30135L9.03954 16.7761Z"/>
                    </svg>
                    Facebook
                  </PrimaryButton>
                </div>
              </div>
              
              <p className="mt-8 text-center text-xs text-neutral-500">
                By signing in, you agree to our 
                <a href="#" className="text-dental-600 hover:text-dental-700"> Terms of Service</a> and 
                <a href="#" className="text-dental-600 hover:text-dental-700"> Privacy Policy</a>.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;