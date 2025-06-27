import { useState, useEffect, useRef } from 'react';
import { Link, NavLink, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Menu, X, ChevronDown, Search, User } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';

interface HeaderProps {
  scrolled: boolean;
}

const Header = ({ scrolled }: HeaderProps) => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [profileDropdownOpen, setProfileDropdownOpen] = useState(false);
  const [mobileProfileDropdownOpen, setMobileProfileDropdownOpen] = useState(false);
  const { isAuthenticated, user } = useAuth();
  const location = useLocation();

  // Refs for dropdowns
  const profileDropdownRef = useRef<HTMLDivElement>(null);
  const mobileProfileDropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Close mobile menu when route changes
    setMobileMenuOpen(false);
  }, [location.pathname]);

  // Lock scroll when mobile menu is open
  useEffect(() => {
    if (mobileMenuOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'auto';
    }
    return () => {
      document.body.style.overflow = 'auto';
    };
  }, [mobileMenuOpen]);

  // Close dropdown on outside click (desktop)
  useEffect(() => {
    if (!profileDropdownOpen) return;
    function handleClick(e: MouseEvent) {
      if (
        profileDropdownRef.current &&
        !profileDropdownRef.current.contains(e.target as Node)
      ) {
        setProfileDropdownOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, [profileDropdownOpen]);

  // Close dropdown on outside click (mobile)
  useEffect(() => {
    if (!mobileProfileDropdownOpen) return;
    function handleClick(e: MouseEvent) {
      if (
        mobileProfileDropdownRef.current &&
        !mobileProfileDropdownRef.current.contains(e.target as Node)
      ) {
        setMobileProfileDropdownOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, [mobileProfileDropdownOpen]);

const publicNavItems = [
  { name: 'Articles', path: '/articles' },
  { name: 'Journals', path: '/journals' },
  { name: 'Forum', path: '/forum' },
  { name: 'Events', path: '/events' },
  { name: 'Business Listings', path: '/business-listings' },
  { name: 'Products', path: '/products' },
  { name: 'Professors', path: '/professors' }, // Changed from 'Awards' to 'Professors'
  { name: 'About', path: '/about' },
];

  const privateNavItems = [
    { name: 'Submission', path: '/submit' },
    { name: 'Dashboard', path: '/dashboard' },
    { name: 'Profile', path: '/profile' },
  ];

  return (
    <header
      className="fixed top-0 left-0 right-0 z-50 bg-white shadow-md py-4 transition-all duration-300"
    >
      <div className="container-custom flex items-center justify-between lg:gap-8">
        {/* Logo */}
        <Link to="/" className="flex items-center space-x-2 flex-shrink-0">
          <div className="w-10 h-10 bg-dental-600 rounded-lg flex items-center justify-center">
            <span className="text-white font-bold">DR</span>
          </div>
          <span className={`font-semibold text-xl ${scrolled ? 'text-dental-800' : 'text-dental-700'}`}>
            DentalReach
          </span>
        </Link>

        {/* Desktop Navigation - horizontally centered, no wrap, flex-1, no overflow-x or scroll */}
        <div className="hidden lg:flex flex-1 justify-center items-center space-x-1 whitespace-nowrap">
          {publicNavItems.map((item) => (
            <NavLink
              key={item.name}
              to={item.path}
              className={({ isActive }) =>
                `px-3 py-2 rounded-lg text-sm font-medium whitespace-nowrap transition-all duration-200 ease-in-out ${
                  isActive
                    ? 'text-dental-600 bg-dental-50'
                    : scrolled
                    ? 'text-neutral-700 hover:text-dental-600 hover:bg-neutral-100'
                    : 'text-neutral-800 hover:text-dental-600 hover:bg-white/80'
                }`
              }
            >
              {item.name}
            </NavLink>
          ))}
        </div>

        {/* Right side buttons (no Join Now button) */}
        <div className="hidden lg:flex items-center space-x-4 flex-shrink-0">
          <button
            aria-label="Search"
            className="p-2 text-neutral-500 hover:text-dental-600 rounded-full hover:bg-neutral-100 transition-all duration-200 ease-in-out"
          >
            <Search className="h-5 w-5" />
          </button>
          {isAuthenticated ? (
            <div className="relative" ref={profileDropdownRef}>
              <button
                className="flex items-center space-x-2 focus:outline-none group"
                onClick={() => setProfileDropdownOpen((open) => !open)}
                aria-haspopup="true"
                aria-expanded={profileDropdownOpen ? 'true' : 'false'}
              >
                {user?.avatar ? (
                  <img src={user.avatar} alt={user.name} className="w-8 h-8 rounded-full object-cover border-2 border-dental-600" />
                ) : (
                  <div className="w-8 h-8 rounded-full bg-dental-200 flex items-center justify-center border-2 border-dental-600">
                    <User className="h-4 w-4 text-dental-700" />
                  </div>
                )}
                <ChevronDown className="h-4 w-4 text-dental-600 transition-transform duration-200 group-aria-expanded:rotate-180" />
              </button>
              {profileDropdownOpen && (
                <div
                  className="absolute right-0 mt-2 w-48 bg-white rounded-xl shadow-lg py-2 z-50 border border-neutral-100 transition-all duration-200 ease-in-out transform opacity-100 translate-y-0"
                  style={{
                    transitionProperty: 'opacity, transform',
                  }}
                >
                  <Link to="/dashboard" className="block px-4 py-2 text-sm text-neutral-800 hover:bg-dental-50 focus:bg-dental-50 transition-all duration-200 ease-in-out" onClick={() => setProfileDropdownOpen(false)}>Dashboard</Link>
                  <Link to="/submit" className="block px-4 py-2 text-sm text-neutral-800 hover:bg-dental-50 focus:bg-dental-50 transition-all duration-200 ease-in-out" onClick={() => setProfileDropdownOpen(false)}>Submission</Link>
                  <Link to="/profile" className="block px-4 py-2 text-sm text-neutral-800 hover:bg-dental-50 focus:bg-dental-50 transition-all duration-200 ease-in-out" onClick={() => setProfileDropdownOpen(false)}>Profile</Link>
                  <div className="px-4 py-2">
                    <button
                      onClick={() => { setProfileDropdownOpen(false); if (window.confirm('Log out?')) { window.localStorage.removeItem('dentalreachUser'); window.location.reload(); } }}
                      className="w-full border border-dental-600 text-dental-600 bg-white hover:bg-dental-50 rounded-lg py-2 px-4 font-semibold whitespace-nowrap transition-all duration-200 ease-in-out"
                    >
                      Log out
                    </button>
                  </div>
                </div>
              )}
            </div>
          ) : (
            <Link to="/login" className="border border-dental-600 text-dental-600 bg-white hover:bg-dental-50 rounded-lg py-2 px-4 font-semibold text-sm transition-all duration-200 ease-in-out">
              Log in
            </Link>
          )}
        </div>

        {/* Mobile menu button */}
        <button
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          className="lg:hidden p-2 rounded-md text-neutral-700"
          aria-expanded={mobileMenuOpen}
          aria-label="Toggle menu"
        >
          {mobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
        </button>
      </div>

      {/* Mobile menu */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.3 }}
            className="lg:hidden bg-white shadow-lg overflow-hidden"
          >
            <div className="container-custom py-4">
              <nav className="flex flex-col space-y-1 mb-4">
                {publicNavItems.map((item) => (
                  <NavLink
                    key={item.name}
                    to={item.path}
                    className={({ isActive }) =>
                      `px-4 py-3 rounded-xl text-base ${
                        isActive
                          ? 'bg-dental-50 text-dental-600 font-medium'
                          : 'text-neutral-700 hover:bg-neutral-50'
                      }`
                    }
                  >
                    {item.name}
                  </NavLink>
                ))}
              </nav>

              {isAuthenticated && (
                <div className="flex items-center space-x-3 mt-4" ref={mobileProfileDropdownRef}>
                  <button
                    className="flex items-center space-x-2 focus:outline-none group"
                    onClick={() => setMobileProfileDropdownOpen((open) => !open)}
                    aria-haspopup="true"
                    aria-expanded={mobileProfileDropdownOpen ? 'true' : 'false'}
                  >
                    {user?.avatar ? (
                      <img src={user.avatar} alt={user.name} className="w-10 h-10 rounded-full object-cover border-2 border-dental-600" />
                    ) : (
                      <div className="w-10 h-10 rounded-full bg-dental-200 flex items-center justify-center border-2 border-dental-600">
                        <User className="h-5 w-5 text-dental-700" />
                      </div>
                    )}
                    <ChevronDown className="h-4 w-4 text-dental-600 transition-transform duration-200 group-aria-expanded:rotate-180" />
                  </button>
                  {mobileProfileDropdownOpen && (
                    <div className="absolute left-0 right-0 mt-2 bg-white rounded-xl shadow-lg py-2 z-50 border border-neutral-100">
                      <Link to="/dashboard" className="block px-4 py-2 text-base text-neutral-800 hover:bg-dental-50 focus:bg-dental-50 transition-all duration-200 ease-in-out" onClick={() => setMobileProfileDropdownOpen(false)}>Dashboard</Link>
                      <Link to="/submit" className="block px-4 py-2 text-base text-neutral-800 hover:bg-dental-50 focus:bg-dental-50 transition-all duration-200 ease-in-out" onClick={() => setMobileProfileDropdownOpen(false)}>Submission</Link>
                      <Link to="/profile" className="block px-4 py-2 text-base text-neutral-800 hover:bg-dental-50 focus:bg-dental-50 transition-all duration-200 ease-in-out" onClick={() => setMobileProfileDropdownOpen(false)}>Profile</Link>
                      <div className="px-4 py-2">
                        <button
                          onClick={() => { setMobileProfileDropdownOpen(false); if (window.confirm('Log out?')) { window.localStorage.removeItem('dentalreachUser'); window.location.reload(); } }}
                          className="w-full border border-dental-600 text-dental-600 bg-white hover:bg-dental-50 rounded-lg py-2 px-4 font-semibold whitespace-nowrap transition-all duration-200 ease-in-out"
                        >
                          Log out
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              )}

              <div className="border-t border-neutral-100 pt-4 flex flex-col space-y-2">
                {isAuthenticated ? (
                  <div className="flex items-center space-x-3">
                    {user?.avatar ? (
                      <img src={user.avatar} alt={user.name} className="w-10 h-10 rounded-full object-cover" />
                    ) : (
                      <div className="w-10 h-10 rounded-full bg-dental-200 flex items-center justify-center">
                        <User className="h-5 w-5 text-dental-700" />
                      </div>
                    )}
                    <div>
                      <p className="font-medium">{user?.name}</p>
                      <p className="text-sm text-neutral-500">{user?.role}</p>
                    </div>
                    <button
                      onClick={() => { setMobileProfileDropdownOpen(false); if (window.confirm('Log out?')) { window.localStorage.removeItem('dentalreachUser'); window.location.reload(); } }}
                      className="border border-dental-600 text-dental-600 bg-white hover:bg-dental-50 rounded-lg py-2 px-4 font-semibold whitespace-nowrap transition-all duration-200 ease-in-out"
                    >
                      Log out
                    </button>
                  </div>
                ) : (
                  <div className="flex space-x-3">
                    <Link to="/login" className="border border-dental-600 text-dental-600 bg-white hover:bg-dental-50 rounded-lg py-2 px-4 font-semibold flex-1 justify-center">
                      Log in
                    </Link>
                  </div>
                )}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
};

export default Header;