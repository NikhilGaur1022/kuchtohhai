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
  const { user, logout, isAuthenticated, isAdmin } = useAuth();
  const navigate = useNavigate();

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
      {/* Navbar */}
      <nav className="bg-white shadow-sm border-b border-neutral-200 fixed top-0 left-0 right-0 z-50">
        <div className="container-custom">
          <div className="flex justify-between items-center h-16">
            {/* Logo */}
            <Link to="/" className="flex items-center">
              <div className="w-10 h-10 bg-dental-600 rounded-lg flex items-center justify-center">
                <span className="text-white font-bold">DR</span>
              </div>
              <span className="ml-2 font-semibold text-xl text-dental-700">DentalReach</span>
            </Link>

            {/* Desktop Navigation */}
            <div className="hidden lg:flex items-center space-x-6">
              {navLinks.map((link) => (
                <Link
                  key={link.name}
                  to={link.href}
                  className="text-neutral-700 hover:text-dental-600 font-medium transition-colors text-sm"
                >
                  {link.name}
                </Link>
              ))}
            </div>

            {/* User Menu / Auth Buttons */}
            <div className="flex items-center space-x-4">
              {isAuthenticated && user ? (
                <div className="flex items-center space-x-3">
                  {/* Notifications Bell */}
                  <div className="relative flex items-center">
                    <Link 
                      to="/notifications"
                      className="p-2 text-neutral-500 hover:text-dental-600 transition-colors inline-flex items-center justify-center"
                    >
                      <Bell className="h-5 w-5" />
                      {unreadNotifications > 0 && (
                        <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
                          {unreadNotifications > 99 ? '99+' : unreadNotifications}
                        </span>
                      )}
                    </Link>
                  </div>

                  {/* User Dropdown */}
                  <div className="relative">
                    <button
                      onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
                      className="flex items-center space-x-3 text-sm rounded-full focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-dental-500 p-2"
                    >
                      <div className="w-8 h-8 rounded-full bg-dental-100 flex items-center justify-center">
                        <span className="text-dental-600 font-medium text-sm">
                          {getInitials()}
                        </span>
                      </div>
                      <div className="flex items-center">
                        <span className="font-medium text-neutral-700">
                          {getDisplayName()}
                        </span>
                        {userProfile?.is_verified && (
                          <CheckCircle className="h-4 w-4 ml-1 text-blue-500" title="Verified User" />
                        )}
                      </div>
                    </button>

                    {/* User Dropdown Menu */}
                    {isUserMenuOpen && (
                      <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg py-1 z-50 border border-neutral-200">
                        <div className="px-4 py-2 border-b border-neutral-100">
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
                          className="flex items-center px-4 py-2 text-sm text-neutral-700 hover:bg-neutral-50"
                          onClick={() => setIsUserMenuOpen(false)}
                        >
                          <BarChart2 className="h-4 w-4 mr-3" />
                          Dashboard
                        </Link>
                        
                        <Link
                          to="/submit"
                          className="flex items-center px-4 py-2 text-sm text-neutral-700 hover:bg-neutral-50"
                          onClick={() => setIsUserMenuOpen(false)}
                        >
                          <Plus className="h-4 w-4 mr-3" />
                          Submit Article
                        </Link>

                        {userProfile?.is_verified && (
                          <Link
                            to="/jobs/create"
                            className="flex items-center px-4 py-2 text-sm text-neutral-700 hover:bg-neutral-50"
                            onClick={() => setIsUserMenuOpen(false)}
                          >
                            <Briefcase className="h-4 w-4 mr-3" />
                            Post Job
                          </Link>
                        )}

                        {!userProfile?.is_verified && (
                          <Link
                            to="/verification/apply"
                            className="flex items-center px-4 py-2 text-sm text-neutral-700 hover:bg-neutral-50"
                            onClick={() => setIsUserMenuOpen(false)}
                          >
                            <CheckCircle className="h-4 w-4 mr-3" />
                            Get Verified
                          </Link>
                        )}
                        
                        {isAdmin && (
                          <>
                            <Link
                              to="/admin/articles"
                              className="flex items-center px-4 py-2 text-sm text-neutral-700 hover:bg-neutral-50"
                              onClick={() => setIsUserMenuOpen(false)}
                            >
                              <Settings className="h-4 w-4 mr-3" />
                              Manage Articles
                            </Link>
                            <Link
                              to="/admin/verifications"
                              className="flex items-center px-4 py-2 text-sm text-neutral-700 hover:bg-neutral-50"
                              onClick={() => setIsUserMenuOpen(false)}
                            >
                              <ShieldCheck className="h-4 w-4 mr-3" />
                              Manage Verifications
                            </Link>
                          </>
                        )}

                        <Link
                          to="/profile"
                          className="flex items-center px-4 py-2 text-sm text-neutral-700 hover:bg-neutral-50"
                          onClick={() => setIsUserMenuOpen(false)}
                        >
                          <User className="h-4 w-4 mr-3" />
                          Profile
                        </Link>

                        <hr className="my-1" />
                        
                        <button
                          onClick={() => {
                            setIsUserMenuOpen(false);
                            handleLogout();
                          }}
                          className="flex items-center w-full px-4 py-2 text-sm text-neutral-700 hover:bg-neutral-50 focus:outline-none"
                        >
                          <LogOut className="h-4 w-4 mr-3" />
                          Log Out
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              ) : (
                <div className="flex items-center space-x-4">
                  <Link
                    to="/login"
                    className="text-neutral-700 hover:text-dental-600 font-medium"
                  >
                    Log in
                  </Link>
                  <Link
                    to="/register"
                    className="bg-dental-600 text-white px-4 py-2 rounded-lg hover:bg-dental-700 font-medium transition-colors"
                  >
                    Sign up
                  </Link>
                </div>
              )}

              {/* Mobile menu button */}
              <button
                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                className="lg:hidden p-2 text-neutral-700 hover:text-dental-600"
              >
                {isMobileMenuOpen ? (
                  <X className="h-6 w-6" />
                ) : (
                  <Menu className="h-6 w-6" />
                )}
              </button>
            </div>
          </div>

          {/* Mobile Navigation */}
          {isMobileMenuOpen && (
            <div className="lg:hidden border-t border-neutral-200 py-4 space-y-2">
              {navLinks.map((link) => (
                <Link
                  key={link.name}
                  to={link.href}
                  className="block px-3 py-2 text-neutral-700 hover:text-dental-600 font-medium"
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  {link.name}
                </Link>
              ))}
              
              {isAuthenticated && user && (
                <>
                  <hr className="my-2" />
                  <div className="px-3 py-2">
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
                    className="block px-3 py-2 text-neutral-700 hover:text-dental-600 font-medium"
                    onClick={() => setIsMobileMenuOpen(false)}
                  >
                    Dashboard
                  </Link>
                  <Link
                    to="/submit"
                    className="block px-3 py-2 text-neutral-700 hover:text-dental-600 font-medium"
                    onClick={() => setIsMobileMenuOpen(false)}
                  >
                    Submit Article
                  </Link>
                  {userProfile?.is_verified && (
                    <Link
                      to="/jobs/create"
                      className="block px-3 py-2 text-neutral-700 hover:text-dental-600 font-medium"
                      onClick={() => setIsMobileMenuOpen(false)}
                    >
                      Post Job
                    </Link>
                  )}
                  {!userProfile?.is_verified && (
                    <Link
                      to="/verification/apply"
                      className="block px-3 py-2 text-neutral-700 hover:text-dental-600 font-medium"
                      onClick={() => setIsMobileMenuOpen(false)}
                    >
                      Get Verified
                    </Link>
                  )}
                  {isAdmin && (
                    <>
                      <Link
                        to="/admin/articles"
                        className="block px-3 py-2 text-neutral-700 hover:text-dental-600 font-medium"
                        onClick={() => setIsMobileMenuOpen(false)}
                      >
                        Manage Articles
                      </Link>
                      <Link
                        to="/admin/verifications"
                        className="block px-3 py-2 text-neutral-700 hover:text-dental-600 font-medium"
                        onClick={() => setIsMobileMenuOpen(false)}
                      >
                        Manage Verifications
                      </Link>
                    </>
                  )}
                  <Link
                    to="/profile"
                    className="block px-3 py-2 text-neutral-700 hover:text-dental-600 font-medium"
                    onClick={() => setIsMobileMenuOpen(false)}
                  >
                    Profile
                  </Link>
                  <button
                    onClick={() => {
                      setIsMobileMenuOpen(false);
                      handleLogout();
                    }}
                    className="block w-full text-left px-3 py-2 text-neutral-700 hover:text-dental-600 font-medium"
                  >
                    Log Out
                  </button>
                </>
              )}
            </div>
          )}
        </div>
      </nav>

      {/* Close user menu when clicking outside */}
      {isUserMenuOpen && (
        <div
          className="fixed inset-0 z-40"
          onClick={() => setIsUserMenuOpen(false)}
        />
      )}

      {/* Main content */}
      <main className="pt-16">
        <Outlet />
      </main>

      {/* Footer */}
      <footer className="bg-white border-t border-neutral-200 mt-16">
        <div className="container-custom py-8">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <div className="flex items-center mb-4 md:mb-0">
              <div className="w-8 h-8 bg-dental-600 rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-sm">DR</span>
              </div>
              <span className="ml-2 font-semibold text-lg text-dental-700">DentalReach</span>
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