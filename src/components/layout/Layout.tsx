import { Outlet, Link, useNavigate } from 'react-router-dom';
import { useState, useEffect } from 'react';
import { Menu, X, User, LogOut, Settings, BarChart2, Bell, FileText, Plus, BookmarkIcon, CheckCircle, ShieldCheck, Briefcase} from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { supabase } from '../../lib/supabase';

interface UserProfile {
  full_name: string | null;
  email: string | null;
  is_verified: boolean;
}

const Layout = () => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [unreadNotifications, setUnreadNotifications] = useState(0);
  const [isScrolled, setIsScrolled] = useState(false);
  const { user, logout, isAuthenticated, isAdmin } = useAuth();
  const navigate = useNavigate();

  // Handle scroll effect for navbar
  useEffect(() => {
    const handleScroll = () => {
      const scrollTop = window.scrollY;
      setIsScrolled(scrollTop > 20);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Fetch user profile data
  useEffect(() => {
    const fetchUserProfile = async () => {
      if (!user) {
        setUserProfile(null);
        return;
      }

      try {
        const { data: profile } = await supabase
          .from('profiles')
          .select('full_name, email, is_verified')
          .eq('id', user.id)
          .single();

        setUserProfile(profile);
      } catch (error) {
        console.error('Error fetching user profile:', error);
        // Fallback to user email
        setUserProfile({ full_name: null, email: user.email, is_verified: false });
      }
    };

    fetchUserProfile();
  }, [user]);

  // Fetch unread notifications count
  useEffect(() => {
    const fetchNotifications = async () => {
      if (!user) {
        setUnreadNotifications(0);
        return;
      }

      try {
        const { count } = await supabase
          .from('notifications')
          .select('*', { count: 'exact', head: true })
          .eq('user_id', user.id)
          .eq('read', false);

        setUnreadNotifications(count || 0);
      } catch (error) {
        console.error('Error fetching notifications:', error);
      }
    };

    fetchNotifications();

    // Set up real-time subscription for notifications
    if (user) {
      const subscription = supabase
        .channel('notifications')
        .on('postgres_changes', 
          { 
            event: '*', 
            schema: 'public', 
            table: 'notifications',
            filter: `user_id=eq.${user.id}` 
          }, 
          () => {
            fetchNotifications();
          }
        )
        .subscribe();

      return () => {
        subscription.unsubscribe();
      };
    }
  }, [user]);

  const handleLogout = async () => {
    try {
      await logout();
      navigate('/');
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  const getDisplayName = () => {
    if (userProfile?.full_name) {
      return userProfile.full_name;
    }
    if (userProfile?.email) {
      return userProfile.email.split('@')[0];
    }
    if (user?.email) {
      return user.email.split('@')[0];
    }
    return 'User';
  };

  const getInitials = () => {
    if (userProfile?.full_name) {
      return userProfile.full_name
        .split(' ')
        .map(name => name.charAt(0))
        .join('')
        .substring(0, 2)
        .toUpperCase();
    }
    if (userProfile?.email) {
      return userProfile.email.charAt(0).toUpperCase();
    }
    if (user?.email) {
      return user.email.charAt(0).toUpperCase();
    }
    return 'U';
  };

const navLinks = [
  { name: 'Home', href: '/' },
  { name: 'Articles', href: '/articles' },
  { name: 'Journals', href: '/journals' },
  { name: 'Forum', href: '/forum' },
  { name: 'Events', href: '/events' },
  { name: 'Jobs', href: '/jobs' },
  { name: 'Business', href: '/business-listings' },
  { name: 'Products', href: '/products' },
  { name: 'Professors', href: '/professors' },
  { name: 'About', href: '/about' },
];

  return (
    <div className="min-h-screen bg-neutral-50">
      {/* Enhanced Navbar with Blur Effect */}
      <nav className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 ease-in-out ${
        isScrolled 
          ? 'bg-white/80 backdrop-blur-xl shadow-lg border-b border-white/20' 
          : 'bg-white/95 backdrop-blur-sm shadow-sm border-b border-neutral-200'
      }`}>
        <div className="container-custom">
          <div className="flex justify-between items-center h-16">
            {/* Enhanced Logo with Hover Effect */}
            <Link to="/" className="flex items-center group">
              <div className="w-10 h-10 bg-gradient-to-br from-dental-600 to-dental-700 rounded-xl flex items-center justify-center transform transition-all duration-300 group-hover:scale-110 group-hover:rotate-3 shadow-lg group-hover:shadow-xl">
                <span className="text-white font-bold text-lg">DR</span>
              </div>
              <span className="ml-3 font-bold text-xl bg-gradient-to-r from-dental-700 to-dental-600 bg-clip-text text-transparent transition-all duration-300 group-hover:scale-105">
                DentalReach
              </span>
            </Link>

            {/* Enhanced Desktop Navigation */}
            <div className="hidden lg:flex items-center space-x-1">
              {navLinks.map((link) => (
                <Link
                  key={link.name}
                  to={link.href}
                  className="relative px-4 py-2 text-neutral-700 hover:text-dental-600 font-medium transition-all duration-300 text-sm rounded-lg group overflow-hidden"
                >
                  <span className="relative z-10">{link.name}</span>
                  <div className="absolute inset-0 bg-gradient-to-r from-dental-50 to-dental-100 opacity-0 group-hover:opacity-100 transition-all duration-300 transform scale-x-0 group-hover:scale-x-100 origin-left"></div>
                  <div className="absolute bottom-0 left-0 w-full h-0.5 bg-gradient-to-r from-dental-600 to-dental-500 transform scale-x-0 group-hover:scale-x-100 transition-transform duration-300 origin-left"></div>
                </Link>
              ))}
            </div>

            {/* Enhanced User Menu / Auth Buttons */}
            <div className="flex items-center space-x-4">
              {isAuthenticated && user ? (
                <div className="flex items-center space-x-3">
                  {/* Enhanced Notifications Bell */}
                  <div className="relative flex items-center">
                    <Link 
                      to="/notifications"
                      className="relative p-2 text-neutral-500 hover:text-dental-600 transition-all duration-300 inline-flex items-center justify-center rounded-lg hover:bg-dental-50 group"
                    >
                      <Bell className="h-5 w-5 transition-transform duration-300 group-hover:scale-110 group-hover:rotate-12" />
                      {unreadNotifications > 0 && (
                        <span className="absolute -top-1 -right-1 bg-gradient-to-r from-red-500 to-red-600 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center animate-pulse shadow-lg">
                          {unreadNotifications > 99 ? '99+' : unreadNotifications}
                        </span>
                      )}
                    </Link>
                  </div>

                  {/* Enhanced User Dropdown */}
                  <div className="relative">
                    <button
                      onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
                      className="flex items-center space-x-3 text-sm rounded-xl focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-dental-500 p-2 transition-all duration-300 hover:bg-dental-50 group"
                    >
                      <div className="w-8 h-8 rounded-full bg-gradient-to-br from-dental-100 to-dental-200 flex items-center justify-center ring-2 ring-white shadow-md group-hover:shadow-lg transition-all duration-300 group-hover:scale-110">
                        <span className="text-dental-600 font-medium text-sm">
                          {getInitials()}
                        </span>
                      </div>
                      <div className="flex items-center">
                        <span className="font-medium text-neutral-700 group-hover:text-dental-600 transition-colors duration-300">
                          {getDisplayName()}
                        </span>
                        {userProfile?.is_verified && (
                          <CheckCircle className="h-4 w-4 ml-1 text-blue-500 animate-pulse" title="Verified User" />
                        )}
                      </div>
                    </button>

                    {/* Enhanced User Dropdown Menu */}
                    {isUserMenuOpen && (
                      <>
                        {/* Backdrop */}
                        <div 
                          className="fixed inset-0 z-40" 
                          onClick={() => setIsUserMenuOpen(false)}
                        />
                        
                        {/* Menu */}
                        <div className="absolute right-0 mt-2 w-64 bg-white/95 backdrop-blur-xl rounded-2xl shadow-2xl py-2 z-50 border border-white/20 animate-in slide-in-from-top-2 duration-200">
                          <div className="px-4 py-3 border-b border-neutral-100/50">
                            <div className="flex items-center">
                              <p className="text-sm font-medium text-neutral-900">
                                {getDisplayName()}
                              </p>
                              {userProfile?.is_verified && (
                                <CheckCircle className="h-3 w-3 ml-1 text-blue-500" />
                              )}
                            </div>
                            <p className="text-xs text-neutral-500 truncate">
                              {userProfile?.email || user.email}
                            </p>
                          </div>
                          
                          <Link
                            to="/dashboard"
                            className="flex items-center px-4 py-3 text-sm text-neutral-700 hover:bg-dental-50/50 hover:text-dental-600 transition-all duration-200 group"
                            onClick={() => setIsUserMenuOpen(false)}
                          >
                            <BarChart2 className="h-4 w-4 mr-3 group-hover:scale-110 transition-transform duration-200" />
                            Dashboard
                          </Link>
                          
                          <Link
                            to="/submit"
                            className="flex items-center px-4 py-3 text-sm text-neutral-700 hover:bg-dental-50/50 hover:text-dental-600 transition-all duration-200 group"
                            onClick={() => setIsUserMenuOpen(false)}
                          >
                            <Plus className="h-4 w-4 mr-3 group-hover:scale-110 transition-transform duration-200" />
                            Submit Article
                          </Link>

                          {userProfile?.is_verified && (
                            <Link
                              to="/jobs/create"
                              className="flex items-center px-4 py-3 text-sm text-neutral-700 hover:bg-dental-50/50 hover:text-dental-600 transition-all duration-200 group"
                              onClick={() => setIsUserMenuOpen(false)}
                            >
                              <Briefcase className="h-4 w-4 mr-3 group-hover:scale-110 transition-transform duration-200" />
                              Post Job
                            </Link>
                          )}

                          {!userProfile?.is_verified && (
                            <Link
                              to="/verification/apply"
                              className="flex items-center px-4 py-3 text-sm text-neutral-700 hover:bg-blue-50/50 hover:text-blue-600 transition-all duration-200 group"
                              onClick={() => setIsUserMenuOpen(false)}
                            >
                              <CheckCircle className="h-4 w-4 mr-3 group-hover:scale-110 transition-transform duration-200" />
                              Get Verified
                            </Link>
                          )}
                          
                          {isAdmin && (
                            <>
                              <Link
                                to="/admin/articles"
                                className="flex items-center px-4 py-3 text-sm text-neutral-700 hover:bg-dental-50/50 hover:text-dental-600 transition-all duration-200 group"
                                onClick={() => setIsUserMenuOpen(false)}
                              >
                                <Settings className="h-4 w-4 mr-3 group-hover:scale-110 transition-transform duration-200" />
                                Manage Articles
                              </Link>
                              <Link
                                to="/admin/verifications"
                                className="flex items-center px-4 py-3 text-sm text-neutral-700 hover:bg-dental-50/50 hover:text-dental-600 transition-all duration-200 group"
                                onClick={() => setIsUserMenuOpen(false)}
                              >
                                <ShieldCheck className="h-4 w-4 mr-3 group-hover:scale-110 transition-transform duration-200" />
                                Manage Verifications
                              </Link>
                            </>
                          )}

                          <Link
                            to="/profile"
                            className="flex items-center px-4 py-3 text-sm text-neutral-700 hover:bg-dental-50/50 hover:text-dental-600 transition-all duration-200 group"
                            onClick={() => setIsUserMenuOpen(false)}
                          >
                            <User className="h-4 w-4 mr-3 group-hover:scale-110 transition-transform duration-200" />
                            Profile
                          </Link>

                          <hr className="my-2 border-neutral-100/50" />
                          
                          <button
                            onClick={() => {
                              setIsUserMenuOpen(false);
                              handleLogout();
                            }}
                            className="flex items-center w-full px-4 py-3 text-sm text-neutral-700 hover:bg-red-50/50 hover:text-red-600 focus:outline-none transition-all duration-200 group"
                          >
                            <LogOut className="h-4 w-4 mr-3 group-hover:scale-110 transition-transform duration-200" />
                            Log Out
                          </button>
                        </div>
                      </>
                    )}
                  </div>
                </div>
              ) : (
                <div className="flex items-center space-x-4">
                  <Link
                    to="/login"
                    className="text-neutral-700 hover:text-dental-600 font-medium transition-all duration-300 px-4 py-2 rounded-lg hover:bg-dental-50"
                  >
                    Log in
                  </Link>
                  <Link
                    to="/register"
                    className="bg-gradient-to-r from-dental-600 to-dental-700 text-white px-6 py-2 rounded-xl hover:from-dental-700 hover:to-dental-800 font-medium transition-all duration-300 transform hover:scale-105 hover:shadow-lg"
                  >
                    Sign up
                  </Link>
                </div>
              )}

              {/* Enhanced Mobile menu button */}
              <button
                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                className="lg:hidden p-2 text-neutral-700 hover:text-dental-600 rounded-lg hover:bg-dental-50 transition-all duration-300 group"
              >
                {isMobileMenuOpen ? (
                  <X className="h-6 w-6 transform rotate-0 group-hover:rotate-90 transition-transform duration-300" />
                ) : (
                  <Menu className="h-6 w-6 transform rotate-0 group-hover:rotate-180 transition-transform duration-300" />
                )}
              </button>
            </div>
          </div>

          {/* Enhanced Mobile Navigation */}
          {isMobileMenuOpen && (
            <div className="lg:hidden border-t border-neutral-200/50 py-4 space-y-1 bg-white/95 backdrop-blur-xl animate-in slide-in-from-top-2 duration-300">
              {navLinks.map((link, index) => (
                <Link
                  key={link.name}
                  to={link.href}
                  className="block px-4 py-3 text-neutral-700 hover:text-dental-600 font-medium rounded-lg mx-2 hover:bg-dental-50 transition-all duration-300 transform hover:translate-x-2"
                  onClick={() => setIsMobileMenuOpen(false)}
                  style={{ animationDelay: `${index * 50}ms` }}
                >
                  {link.name}
                </Link>
              ))}
              
              {isAuthenticated && user && (
                <>
                  <hr className="my-3 mx-4 border-neutral-200/50" />
                  <div className="px-4 py-2">
                    <div className="flex items-center">
                      <p className="text-sm font-medium text-neutral-900">
                        {getDisplayName()}
                      </p>
                      {userProfile?.is_verified && (
                        <CheckCircle className="h-3 w-3 ml-1 text-blue-500" />
                      )}
                    </div>
                    <p className="text-xs text-neutral-500">
                      {userProfile?.email || user.email}
                    </p>
                  </div>
                  <Link
                    to="/dashboard"
                    className="block px-4 py-3 text-neutral-700 hover:text-dental-600 font-medium rounded-lg mx-2 hover:bg-dental-50 transition-all duration-300"
                    onClick={() => setIsMobileMenuOpen(false)}
                  >
                    Dashboard
                  </Link>
                  <Link
                    to="/submit"
                    className="block px-4 py-3 text-neutral-700 hover:text-dental-600 font-medium rounded-lg mx-2 hover:bg-dental-50 transition-all duration-300"
                    onClick={() => setIsMobileMenuOpen(false)}
                  >
                    Submit Article
                  </Link>
                  {userProfile?.is_verified && (
                    <Link
                      to="/jobs/create"
                      className="block px-4 py-3 text-neutral-700 hover:text-dental-600 font-medium rounded-lg mx-2 hover:bg-dental-50 transition-all duration-300"
                      onClick={() => setIsMobileMenuOpen(false)}
                    >
                      Post Job
                    </Link>
                  )}
                  {!userProfile?.is_verified && (
                    <Link
                      to="/verification/apply"
                      className="block px-4 py-3 text-neutral-700 hover:text-dental-600 font-medium rounded-lg mx-2 hover:bg-dental-50 transition-all duration-300"
                      onClick={() => setIsMobileMenuOpen(false)}
                    >
                      Get Verified
                    </Link>
                  )}
                  {isAdmin && (
                    <>
                      <Link
                        to="/admin/articles"
                        className="block px-4 py-3 text-neutral-700 hover:text-dental-600 font-medium rounded-lg mx-2 hover:bg-dental-50 transition-all duration-300"
                        onClick={() => setIsMobileMenuOpen(false)}
                      >
                        Manage Articles
                      </Link>
                      <Link
                        to="/admin/verifications"
                        className="block px-4 py-3 text-neutral-700 hover:text-dental-600 font-medium rounded-lg mx-2 hover:bg-dental-50 transition-all duration-300"
                        onClick={() => setIsMobileMenuOpen(false)}
                      >
                        Manage Verifications
                      </Link>
                    </>
                  )}
                  <Link
                    to="/profile"
                    className="block px-4 py-3 text-neutral-700 hover:text-dental-600 font-medium rounded-lg mx-2 hover:bg-dental-50 transition-all duration-300"
                    onClick={() => setIsMobileMenuOpen(false)}
                  >
                    Profile
                  </Link>
                  <button
                    onClick={() => {
                      setIsMobileMenuOpen(false);
                      handleLogout();
                    }}
                    className="block w-full text-left px-4 py-3 text-neutral-700 hover:text-red-600 font-medium rounded-lg mx-2 hover:bg-red-50 transition-all duration-300"
                  >
                    Log Out
                  </button>
                </>
              )}
            </div>
          )}
        </div>
      </nav>

      {/* Main content */}
      <main className="pt-16">
        <Outlet />
      </main>

      {/* Enhanced Footer */}
      <footer className="bg-white/95 backdrop-blur-sm border-t border-neutral-200/50 mt-16">
        <div className="container-custom py-8">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <div className="flex items-center mb-4 md:mb-0 group">
              <div className="w-8 h-8 bg-gradient-to-br from-dental-600 to-dental-700 rounded-lg flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                <span className="text-white font-bold text-sm">DR</span>
              </div>
              <span className="ml-2 font-semibold text-lg bg-gradient-to-r from-dental-700 to-dental-600 bg-clip-text text-transparent">DentalReach</span>
            </div>
            <p className="text-neutral-600 text-sm">
              © 2025 DentalReach. All rights reserved.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Layout;